<template>
  <tr>
    <td class="player-name">{{ name }}</td>
    <td class="items">
      <Item
        v-for="(value, itemId) in items"
        :key="itemId"
        :id="itemId"
        :donated-all="value.donatedAll"
        :amount="value.amount"
        :history="value.history"
      />
    </td>
  </tr>
</template>

<script>
import Item from './Item.vue'

export default {
  name: 'PlayerLoot',
  components: {
    Item
  },
  props: {
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
    },
    items: {
      type: Object,
      required: true
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
  display: grid;
  grid-gap: 4px;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
}
</style>
