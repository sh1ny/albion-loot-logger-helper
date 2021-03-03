<template>
  <div class="home" @drop.prevent="drop" @dragover.prevent>
    <h3>Loot Logger Viewer</h3>

    <Filters/>
    
    <table id="loot-table" class="table table-bordered" v-if="slices.length">
      <thead>
        <tr>
          <th>Name</th>
          <th>Items</th>
        </tr>
      </thead>
      <tbody v-for="(slice, index) in slices" :key="index">
        <PlayerLoot
          v-for="player in slice"
          :key="player.name"
          :name="player.name"
          :died="player.died"
          :picked-up-items="player.pickedUpItems"
          :resolved-items="filters.resolved ? player.resolvedItems : {}"
          :lost-items="filters.lost ? player.lostItems : {}" 
          :donated-items="filters.donated ? player.donatedItems : {}"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'

import PlayerLoot from './components/PlayerLoot.vue'
import Filters from './components/Filters.vue'
import regex from './utils/regex'

export default {
  name: 'App',
  components: {
    PlayerLoot,
    Filters
  },
  computed: {
    ...mapState([
      'filters'
    ]),
    ...mapGetters([
      'filteredPlayers'
    ]),
    sortedFilteredPlayers() {
      return Object.values(this.filteredPlayers)
        .sort((a, b) => b.amountOfPickedUpItems - a.amountOfPickedUpItems)
        .map(p => p.name)
    },
    slices() {
      const slices = []
      const MAX_IMAGES_PER_SLICE = 100
      const MAX_PLAYERS_IN_SLICE = 8

      const players = this.sortedFilteredPlayers.slice()

      let imagesInSlice = 0
      let slice = []

      while (players.length) {
        const playerName = players.shift()
        const player = this.filteredPlayers[playerName]

        let amountOfDifferentItems = Object.keys(player.pickedUpItems).length

        if (this.filters.resolved) {
          amountOfDifferentItems += Object.keys(player.resolvedItems).length
        }

        if (this.filters.lost) {
          amountOfDifferentItems += Object.keys(player.lostItems).length
        }

        if (this.filters.donated) {
          amountOfDifferentItems += Object.keys(player.donatedItems).length
        }

        if (slice.length >= MAX_PLAYERS_IN_SLICE || imagesInSlice + amountOfDifferentItems > MAX_IMAGES_PER_SLICE) {
          slices.push(slice)
          imagesInSlice = 0
          slice = []
        }

        slice.push(player)
        imagesInSlice += amountOfDifferentItems
      }

      if (slice.length) {
        slices.push(slice)
      }

      return slices
    }
  },
  methods: {
    drop(event) {
      const droppedFiles = Array.from(event.dataTransfer.files)

      for (const file of droppedFiles) {
        console.log(file)

        if (file.type !== "text/plain" && file.type !== "text/csv") {
          return
        }

        const reader = new FileReader()

        reader.onload = evt => this.processFile(evt.target.result)

        reader.readAsText(file, "UTF-8")
      }
    },
    processFile(content) {
      const lines = content.trim().split("\n")

      if (!lines.length) {
        return
      }

      const head = lines[0]

      let result = regex.lootLogRe.exec(head)

      if (result) {
        return this.processLoot(lines.slice(1))
      }

      result = regex.chestLogRe.exec(head)

      if (result) {
        return this.processChestLog(lines.slice(1))
      }

      result = regex.guildMemberLogRe.exec(head)

      if (result) {
        return this.processGuildMembers(lines.slice(1))
      }

    },
    processLoot(lines) {
      this.$store.commit('addLootLogs', lines)
    },
    processGuildMembers(lines) {
      this.$store.commit('addSelectedPlayersLogs', lines)
    },
    processChestLog(lines) {
      this.$store.commit('addChestLogs', lines)
    }
  }
}
</script>

<style>
html, body, .home {
  min-height: 100vh;
  width: 100%;
}

.home {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 16px;
}

#loot-table {
  width: 80%;
  max-width: 1280px;
  margin-bottom: 32px;
}

table {
  border-collapse: collapse;
  border-spacing: 0px;
}

th {
  padding: 8px;
  text-align: center;
  min-width: 200px;
  vertical-align: middle;
}
</style>
