<template>
  <li v-show="hasItems">
    <div class="player-name">{{ playerName }}</div>
    <div class="items">
      <Item
        v-for="(details, itemId) in items"
        :key="itemId"
        :itemId="itemId"
        :details="details"
      />
    </div>
  </li>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'

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
    ...mapGetters([
      'filteredLoot'
    ]),
    items() {
      const items = {}

      for (const loot of this.filteredLoot) {
        if (loot.lootedBy !== this.playerName) {
          continue
        }

        if (items[loot.itemId] == null) {
          items[loot.itemId] = {
            history: []
          }
        }

        items[loot.itemId].history.push({
          lootedAt: moment(loot.lootedAt, 'DD-MM-YYYY hh:mm:ss'),
          lootedFrom: loot.lootedFrom,
          amount: loot.amount
        })
      }

      return items
    },
    hasItems() {
      return !!Object.keys(this.items).length
    }
  }
}
</script>

<style scoped>
</style>
