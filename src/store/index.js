import Vue from "vue"
import Vuex from "vuex"

import regex from '../utils/regex'
import items from '../utils/items.json'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    lootLogs: [],
    selectedPlayersLogs: [],
    chestLogs: [],
    filters: {
      t2: false,
      t3: false,
      t4: true,
      t5: true,
      t6: true,
      t7: true,
      t8: true,
      trash: false,
      food: false,
      potion: false,
      bag: false,
      mount: false,
      cape: false,
      donated: true
    }
  },
  mutations: {
    addLootLogs(state, logs) {
      const loot = []

      for (const line of logs) {
        const result = regex.lootLogRe.exec(line)

        if (result == null) {
          continue
        }

        const lootedAt = result[1]
        const lootedBy = result[2]
        const itemId = result[3]
        const amount = parseInt(result[4], 10)
        const lootedFrom = result[5]

        loot.push({ lootedAt, lootedBy, itemId, amount, lootedFrom })
      }

      state.lootLogs.push(loot)
    },
    addSelectedPlayersLogs(state, logs) {
      const selectedPlayers = []

      for (const line of logs) {
        const result = regex.guildMemberLogRe.exec(line)

        if (result == null) {
          continue
        }

        const playerName = result[1]

        selectedPlayers.push({ playerName })
      }

      state.selectedPlayersLogs.push(selectedPlayers)
    },
    addChestLogs(state, logs) {
      const donations = []

      for (const line of logs) {
        const result = regex.chestLogRe.exec(line)

        if (result == null) {
          continue
        }

        const donatedAt = result[1]
        const donatedBy = result[2]
        const itemName = result[3]
        const itemEnchant = parseInt(result[4], 10)
        const amount = parseInt(result[5], 10)

        let itemId = items[itemName]

        if (itemEnchant > 0) {
          itemId = `${itemId}@${itemEnchant}`
        }

        if (amount > 0) {
          donations.push({ donatedAt, donatedBy, itemId, itemEnchant, amount })
        }
      }

      state.chestLogs.push(donations)
    }
  },
  actions: {},
  modules: {},
  getters: {
    donatedLoot(state) {
      const donatedLoot = {}

      for (const logs of state.chestLogs) {
        for (const line of logs) {
          const key = `${line.donatedBy} ${line.donatedAt} ${line.itemId} ${line.amount}`

          donatedLoot[key] = line
        }
      }

      return Object.values(donatedLoot)
    },
    allPlayers(state) {
      const allPlayers = new Set()

      for (const logs of state.lootLogs) {
        for (const item of logs) {
          allPlayers.add(item.lootedBy)
        }
      }

      return Array.from(allPlayers)
    },
    selectedPlayers(state) {
      const selectedPlayers = new Set()

      for (const logs of state.selectedPlayersLogs) {
        for (const item of logs) {
          selectedPlayers.add(item.playerName)
        }
      }

      return Array.from(selectedPlayers)
    },
    filteredPlayers(state, getters) {
      if (!getters.selectedPlayers.length) {
        return getters.allPlayers
      }

      return getters.allPlayers.filter(player => getters.selectedPlayers.includes(player))
    },
    allLoot(state) {
      const loot = []
      
      for (const logs of state.lootLogs) {
        loot.push(...logs)
      }

      return loot
    },
    filteredLoot(state, getters) {
      return getters.allLoot.filter(loot => {
        const hideItem = getters.filterPatterns.some(pattern => loot.itemId.match(pattern))

        return !hideItem
      })
    },
    filterPatterns(state) {
      const filterPatterns = []

      if (!state.filters.t2) {
        filterPatterns.push(/^T2/)
      }

      if (!state.filters.t3) {
        filterPatterns.push(/^T3/)
      }

      if (!state.filters.t4) {
        filterPatterns.push(/^T4/)
      }

      if (!state.filters.t5) {
        filterPatterns.push(/^T5/)
      }

      if (!state.filters.t6) {
        filterPatterns.push(/^T6/)
      }

      if (!state.filters.t7) {
        filterPatterns.push(/^T7/)
      }

      if (!state.filters.t8) {
        filterPatterns.push(/^T8/)
      }

      if (!state.filters.trash) {
        filterPatterns.push(/_TRASH/)
      }

      if (!state.filters.bag) {
        filterPatterns.push(/_BAG/)
      }

      if (!state.filters.potion) {
        filterPatterns.push(/_POTION_/)
      }

      if (!state.filters.food) {
        filterPatterns.push(/_MEAL_/)
      }

      if (!state.filters.cape) {
        filterPatterns.push(/^T\d_CAPE(?:@\d)?$/)

        filterPatterns.push(/^T\d_CAPEITEM_FW_BRIDGEWATCH(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_FW_FORTSTERLING(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_FW_LYMHURST(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_FW_MARTLOCK(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_FW_THETFORD(?:@\d)?$/)

        filterPatterns.push(/^T\d_CAPEITEM_HERETIC(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_UNDEAD(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_KEEPER(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_MORGANA(?:@\d)?$/)
        filterPatterns.push(/^T\d_CAPEITEM_DEMON(?:@\d)?$/)
      }

      if (!state.filters.mount) {
        // FIXME: _MOUNT_ is very generic, it'll filter battle mounts.
        filterPatterns.push(/_MOUNT_/)
      }

      if (!state.filters.others) {
        filterPatterns.push(/RUNE/)
        filterPatterns.push(/SOUL/)
        filterPatterns.push(/RELIC/)
        filterPatterns.push(/_FARM/)
        filterPatterns.push(/_TOOL_/)
        filterPatterns.push(/_GVGTOKEN_/)
        filterPatterns.push(/TREASURE/)
      }

      return filterPatterns
    }
  }
})
