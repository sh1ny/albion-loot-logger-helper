<template>
  <div class="item" :class="{ donated: donatedAll }">
    <img :src="url" :alt="id" :title="title" />
    <div class="amount">{{ amount }}</div>
  </div>
</template>

<script>
import itemsIdToName from '../utils/items-id-to-name.json'

export default {
  name: 'Item',
  data () {
    return {
      publicPath: process.env.BASE_URL
    }
  },
  props: {
    id: {
      type: String,
      required: true
    },
    history: {
      type: Array,
      required: true
    },
    donatedAll: {
      type: Boolean,
      default: () => false
    },
    amount: {
      type: Number,
      default: () => 1
    }
  },
  computed: {
    url() {
      return `${this.publicPath}items/${this.id}%231.png`
    },
    title() {
      const items = this.history
        .map(e => `${e.amount}x looted from ${e.lootedFrom} at ${e.lootedAt.format('DD-MM-YYYY hh:mm:ss')}`)

      return [
        `${itemsIdToName[this.id]} - ${this.id}`,
        '',
        ...items
      ].join('\n')
    }
  }
}
</script>

<style scoped>
.item {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
}

img {
  width: 80px;
  grid-column: 1;
  grid-row: 1;
}

.amount {
  font-size: 0.8em;
  color: white;
  align-self: end;
  justify-self: end;
  grid-column:1;
  grid-row:1;
  margin-right: 9px;
  margin-bottom: 10px;
  font-family: monospaced;
  width: 21px;
  text-align: center;
}

.donated {
  filter: grayscale(100%);
}
</style>
