<template>
  <div class="item" :class="{ donated: donatedAll }">
    <img :src="url" :alt="id" :title="title" />
    <span class="amount">{{ amount }}</span>
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
  display: inline-block;
}

img {
  width: 5em;
}

.amount {
  font-size: 0.8em;
  position: relative;
  right: 1.8em;
  top: 1.5em;
  color: white;
}

.donated {
  filter: grayscale(100%);
}
</style>
