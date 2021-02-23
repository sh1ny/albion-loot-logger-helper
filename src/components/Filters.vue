<template>
  <div class="container">
    <div class="filters">
      <div v-for="(value, name) in filters" :key="name" class="filter">
        <button @click="filters[name] = !filters[name]" :id="name">
          <svg v-if="filters[name]" aria-hidden="true" focusable="false" data-prefix="far" data-icon="eye" class="eye" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="currentColor" d="M288 144a110.94 110.94 0 0 0-31.24 5 55.4 55.4 0 0 1 7.24 27 56 56 0 0 1-56 56 55.4 55.4 0 0 1-27-7.24A111.71 111.71 0 1 0 288 144zm284.52 97.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400c-98.65 0-189.09-55-237.93-144C98.91 167 189.34 112 288 112s189.09 55 237.93 144C477.1 345 386.66 400 288 400z"></path></svg>
          <svg v-else aria-hidden="true" focusable="false" data-prefix="far" data-icon="eye-slash" class="eye-slash" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M634 471L36 3.51A16 16 0 0 0 13.51 6l-10 12.49A16 16 0 0 0 6 41l598 467.49a16 16 0 0 0 22.49-2.49l10-12.49A16 16 0 0 0 634 471zM296.79 146.47l134.79 105.38C429.36 191.91 380.48 144 320 144a112.26 112.26 0 0 0-23.21 2.47zm46.42 219.07L208.42 260.16C210.65 320.09 259.53 368 320 368a113 113 0 0 0 23.21-2.46zM320 112c98.65 0 189.09 55 237.93 144a285.53 285.53 0 0 1-44 60.2l37.74 29.5a333.7 333.7 0 0 0 52.9-75.11 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64c-36.7 0-71.71 7-104.63 18.81l46.41 36.29c18.94-4.3 38.34-7.1 58.22-7.1zm0 288c-98.65 0-189.08-55-237.93-144a285.47 285.47 0 0 1 44.05-60.19l-37.74-29.5a333.6 333.6 0 0 0-52.89 75.1 32.35 32.35 0 0 0 0 29.19C89.72 376.41 197.08 448 320 448c36.7 0 71.71-7.05 104.63-18.81l-46.41-36.28C359.28 397.2 339.89 400 320 400z"></path></svg>
        </button>
        <div class="filter-name">{{ name }}</div>
      </div>
      <div class="filter">
        <button @click="download">
          <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="download" class="download" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z"></path></svg>
        </button>
        <div class="filter-name">
          {{ downloading ? 'Loading' : 'Download' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

let domToImage = null
let saveAs = null

export default {
  data() {
    return {
      downloading: false
    }
  },
  computed: {
    ...mapState([
      'filters'
    ]),
  },
  methods: {
    async download() {
      if (this.downloading) {
        return
      }

      this.downloading = true

      if (domToImage == null) {
        const lib = await import('dom-to-image')

        domToImage = window.domToImage = lib.default
      }

      if (saveAs == null) {
        const fileSaver = await import('file-saver')

        saveAs = fileSaver.saveAs
      }

      const blobs = await this.getImages()

      const date = new Date().toISOString()

      for (let i = 0; i < blobs.length; i++) {
        const blob = blobs[i]

        saveAs(blob, `albion-loot-${date}-${i}.png`)
      }

      this.downloading = false
    },
    async getImages() {
      const groups = [...document.querySelectorAll('table#loot-table tbody')]

      const blobs = []

      for (const group of groups) {
        const blob = await domToImage.toBlob(group, { bgcolor: '#fff' })

        blobs.push(blob)
      }

      return blobs
    }
  }
}
</script>

<style scoped>
.container {
  width: 80%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  margin-top: 32px;
}

.filters {
  display: grid;
  grid-gap: 1em;
  grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
  width: 100%;
  text-align: center;
}

.form-check-inline {
  margin-right: 1.5em;
}

.filter {
  display: flex;
  flex-direction: column;
  align-content: center;
}

.filter-name {
  text-transform: capitalize;
  font-size: 0.8em;
}

svg {
  width: 16px;
  margin-left: 4px;
  margin-bottom: 4px;
  cursor: pointer;
}

svg.eye {
  color: #0d6efd;
}

svg.eye-slash {
  color: #808080;
}

svg.download {
  color: #E43333;
}

button {
  border: none;
  background: none;
  margin-right: 4px;
}
</style>

