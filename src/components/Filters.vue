<template>
  <div class="filters">
    <h3>Show</h3>

    <div>
      <div v-for="(value, name) in filters" :key="name" class="form-check form-check-inline">
        <input class="form-check-input" type="checkbox" v-model="filters[name]" :id="name">
        <label class="form-check-label" :for="name">{{ name }}</label>
      </div>
    </div>
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

.form-check-inline {
  margin-right: 1.5em;
}

label {
  text-transform: capitalize;
}
</style>

