<template>
  <div class="item">
    <img :src="url" :alt="title" :title="title" />
    <span class="amount">{{ amount }}</span>
  </div>
</template>

<script>
export default {
  props: {
    itemId: {
      type: String,
      required: true
    },
    details: {
      type: Object,
      required: true
    }
  },
  computed: {
    url() {
      return `https://render.albiononline.com/v1/item/${this.itemId}.png?count=1&quality=1&size=217`
    },
    title() {
      return this.filteredHistory
        .map(e => `Looted ${e.amount}x from ${e.lootedFrom} at ${e.lootedAt.format('DD-MM-YYYY hh:mm:ss')}`)
        .join('\n')
    },
    filteredHistory() {
      const filteredHistory = []

      for (const item of this.details.history) {
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

      return filteredHistory
    },
    amount() {
      let amount = 0

      for (const item of this.filteredHistory) {
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
  top: -1.3em;
  color: white;
}
</style>
