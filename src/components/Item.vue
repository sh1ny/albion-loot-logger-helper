<template>
  <div class="item">
    <img :src="url" :alt="itemId" :title="itemId" />
    <span class="amount">{{ amount }}</span>
  </div>
</template>

<script>
export default {
  name: "Item",
  props: {
    itemId: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      default: () => 1
    }
  },
  computed: {
    url() {
      return `https://render.albiononline.com/v1/item/${this.itemId}.png?count=1&quality=1&size=217`;
    }
  }
};
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
