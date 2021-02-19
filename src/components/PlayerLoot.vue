<template>
  <li v-show="hasItems">
    <div class="player-name">{{ playerName }}</div>
    <div class="items">
      <Item
        v-for="(details, itemId) in items"
        :key="itemId"
        :itemId="itemId"
        :amount="details.amount"
      />
    </div>
  </li>
</template>

<script>
import { mapGetters } from 'vuex'

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
        if (loot.by !== this.playerName) {
          continue
        }

        if (items[loot.id] == null) {
          items[loot.id] = {
            id: loot.id,
            amount: 0,
            date: [],
            from: []
          }
        }

        items[loot.id].date.push(loot.date)
        items[loot.id].from.push(loot.from)

        items[loot.id].amount += loot.amount
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
