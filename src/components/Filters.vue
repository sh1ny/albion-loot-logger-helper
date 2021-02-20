<template>
  <div class="filters">
    <h3>Show</h3>
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
.filters {
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  margin-top: 32px;
}

li {
  display: inline-block;
  margin-right: 16px;
}

label {
  margin-left: 8px;
  margin-right: 16px;
}
</style>

