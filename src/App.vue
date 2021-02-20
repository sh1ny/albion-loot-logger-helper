<template>
  <div class="home" @drop.prevent="drop" @dragover.prevent>
    <div>
      <Filters/>
    </div>
    <div>
      <ul>
        <PlayerLoot v-for="player in filteredPlayers" :key="player" :player-name="player"/>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import PlayerLoot from './components/PlayerLoot.vue'
import Filters from './components/Filters.vue'
import regex from './utils/regex'

export default {
  components: {
    PlayerLoot,
    Filters
  },
  computed: {
    ...mapGetters([
      'filteredPlayers'
    ])
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
html,
body,
.home {
  height: 100%;
}
</style>
