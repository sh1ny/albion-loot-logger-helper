<template>
  <tr v-show="hasItems">
    <td class="player-name">{{ playerName }}</td>
    <td class="items">
      <Item
        v-for="(details, itemId) in filteredItems"
        :key="itemId"
        :itemId="itemId"
        :details="details"
        :donations="donations"
      />
    </td>
  </tr>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
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
      if (this.filters.donated) {
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
          lootedAt: loot.lootedAt,
          lootedFrom: loot.lootedFrom,
          amount: loot.amount
        })
      }

      for (const itemId in items) {
        const details = items[itemId]

        for (const history of details.history) {
          details.amount += history.amount
        }
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
.player-name {
  text-align: center;
  width: 200px;
  vertical-align: middle;
}

.items {
  padding-top: 8px;
}
</style>
