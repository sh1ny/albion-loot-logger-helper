<template>
  <li v-show="hasItems">
    <div class="player-name">{{ playerName }}</div>
    <div class="items">
      <Item
        v-for="(details, itemId) in filteredItems"
        :key="itemId"
        :itemId="itemId"
        :details="details"
        :donations="donations"
      />
    </div>
  </li>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import moment from 'moment'
import _ from 'lodash'

import Item from './Item.vue'

export default {
  components: {
    Item
  },
  props: {
    playerName: {
      type: String,
      required: true
    }
  },
  computed: {
    ...mapState([
      'filters'
    ]),
    ...mapGetters([
      'filteredLoot',
      'donatedLoot'
    ]),
    filteredItems() {
      if (!this.filters.donated) {
        return this.items
      }

      const filteredItems = _.cloneDeep(this.items)

      for (const itemId in this.donations) {
        if (filteredItems[itemId] == null) {
          continue
        }

        const donations = this.donations[itemId]

        for (const donation of donations) {
          filteredItems[itemId].amount -= donation.amount
        }
        
        if (filteredItems[itemId].amount <= 0) {
          delete filteredItems[itemId]
        }
      }

      return filteredItems
    },
    items() {
      const items = {}

      for (const loot of this.filteredLoot) {
        if (loot.lootedBy !== this.playerName || loot.amount <= 0) {
          continue
        }

        if (items[loot.itemId] == null) {
          items[loot.itemId] = {
            amount: 0,
            history: []
          }
        }

        items[loot.itemId].history.push({
          lootedAt: moment(loot.lootedAt, 'DD-MM-YYYY hh:mm:ss'),
          lootedFrom: loot.lootedFrom,
          amount: loot.amount
        })
      }

      // remove duplicated entries and calculate the final amount of units
      for (const itemId in items) {
        const details = items[itemId]
        const filteredHistory = []

        for (const item of details.history) {
          const isDuplicate = filteredHistory.some(e => {
            // if the player looted different players, it is definetly not a duplicate.
            if (e.lootedFrom !== item.lootedFrom) {
              return false
            }

            const diff = Math.abs(e.lootedAt.diff(item.lootedAt))

            // if looted from the same player, in a very short time window, it is
            // probably a duplicate
            return diff <= 5000
          })

          if (!isDuplicate) {
            filteredHistory.push(item)
          }
        }

        for (const history of filteredHistory) {
          details.amount += history.amount
        }

        details.history = filteredHistory
      }

      return items
    },
    donations() {
      const donations = {}
      const donationsByPlayer = this.donatedLoot.filter(e => e.donatedBy === this.playerName)

      for (const item of donationsByPlayer) {
        if (donations[item.itemId] == null) {
          donations[item.itemId] = []
        }

        donations[item.itemId].push(item)
      }

      return donations
    },
    hasItems() {
      return !!Object.keys(this.filteredItems).length
    }
  }
}
</script>

<style scoped>
</style>
