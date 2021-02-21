<template>
  <div class="item" :class="{ donated: donatedAll }">
    <img :src="url" :alt="itemId" :title="title" />
    <span class="amount">{{ amount }}</span>
  </div>
</template>

<script>
import itemsIdToName from '../utils/items-id-to-name.json'

export default {
  data () {
    return {
      publicPath: process.env.BASE_URL
    }
  },
  props: {
    itemId: {
      type: String,
      required: true
    },
    details: {
      type: Object,
      required: true
    },
    donations: {
      type: Object,
      required: true
    }
  },
  computed: {
    url() {
      return encodeURIComponent(`${this.publicPath}items/${this.itemId}#1.png`)
    },
    title() {
      const items = this.details.history
        .map(e => `${e.amount}x looted from ${e.lootedFrom} at ${e.lootedAt.format('DD-MM-YYYY hh:mm:ss')}`)

      return [
        `${itemsIdToName[this.itemId]} - ${this.itemId}`,
        '',
        ...items
      ].join('\n')
    },
    donatedAmount() {
      let amount = 0

      for (const donation of this.filteredDonations) {
        amount += donation.amount
      }

      return amount
    },
    donatedAll() {
      return this.donatedAmount >= this.amount
    },
    filteredDonations() {
      return this.donations[this.itemId] || []
    },
    amount() {
      let amount = 0

      for (const item of this.details.history) {
        amount += item.amount
      }

      return amount
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
