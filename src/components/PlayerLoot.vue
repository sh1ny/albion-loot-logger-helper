<template>
  <tr>
    <td class="player-name" :class="{ died: died }">{{ name }}</td>
    <td class="items">
      <Item
        v-for="(props, itemId) in pickedUpItems"
        :key="`picked-up-${itemId}`"
        :id="itemId"
        :type="'pickedup'"
        :amount="props.amount"
        :history="props.history"
      />
      <Item
        v-for="(props, itemId) in resolvedItems"
        :key="`resolved-${itemId}`"
        :id="itemId"
        :type="'resolved'"
        :amount="props.amount"
        :history="props.history"
      />
      <Item
        v-for="(props, itemId) in lostItems"
        :key="`lost-${itemId}`"
        :id="itemId"
        :type="'lost'"
        :amount="props.amount"
        :history="props.history"
      />
      <Item
        v-for="(props, itemId) in donatedItems"
        :key="`donated-${itemId}`"
        :id="itemId"
        :type="'donation'"
        :amount="props.amount"
        :history="props.history"
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
    pickedUpItems: {
      type: Object,
      required: true
    },
    resolvedItems: {
      type: Object,
      required: true
    },
    lostItems: {
      type: Object,
      required: true
    },
    donatedItems: {
      type: Object,
      required: true
    },
    died: {
      type: Boolean,
      default: () => false
    }
  }
}
</script>

<style scoped>
.player-name {
  text-align: center;
  width: 200px;
  vertical-align: middle;
  font-weight: 600;
}

.died {
  color: #cc0000;
}

.items {
  padding-top: 8px;
  display: grid;
  grid-gap: 4px;
  grid-template-columns: repeat(auto-fit, 80px);
}
</style>
