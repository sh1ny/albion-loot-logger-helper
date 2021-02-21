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
        <PlayerLoot v-for="player in slice" :key="player.name" :name="player.name" :amount="player.amountOfPickedUpItems" :items="player.items"/>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

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
    ...mapGetters([
      'filteredPlayers'
    ]),
    sortedFilteredPlayers() {
      const sortedFilteredPlayers = {}

      const sortedByAmountOfPickedUpItems = Object.values(this.filteredPlayers)
        .sort((a, b) => Object.keys(b.items).length - Object.keys(a.items).length)

      for (const player of sortedByAmountOfPickedUpItems) {
        sortedFilteredPlayers[player.name] = player
      }

      return sortedFilteredPlayers
    },
    slices() {
      const slices = []
      const SLICE_SIZE = 10

      const players = Object.keys(this.sortedFilteredPlayers)

      for (let i = 0; i < players.length; i += SLICE_SIZE) {
        const slice = players.slice(i, i + SLICE_SIZE)
          .map(item => this.filteredPlayers[item])

        slices.push(slice)
      }

      return slices
    }
  },
  methods: {
    drop(event) {
      const droppedFiles = Array.from(event.dataTransfer.files)

      for (const file of droppedFiles) {
        if (file.type !== "text/plain") {
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
