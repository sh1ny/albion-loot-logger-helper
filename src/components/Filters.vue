<template>
  <div>
    <ul>
      <li v-for="(value, name) in filters" :key="name">
        <input type="checkbox" v-model="filters[name]" :id="name">
        <label :for="name">{{ name }}</label>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState([
      'filters'
    ]),
  }
}
</script>

<style scoped>
</style>

