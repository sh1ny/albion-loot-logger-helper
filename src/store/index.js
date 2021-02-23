import Vue from "vue"
import Vuex from "vuex"
import moment from 'moment'

import regex from '../utils/regex'
import deepFreeze from '../utils/deepFreeze'
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
      bag: false,
      cape: false,
      lost: false,
      donated: true,
      food: false,
      mount: false,
      others: false,
      resolved: true,
      potion: false,
      trash: false,
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

        const lootedAt = moment(result[1], 'DD/MM/YYYY hh:mm:ss')
        const lootedBy = result[2]
        const itemId = result[3]
        const amount = parseInt(result[4], 10)
        const lootedFrom = result[5]

        const log = { lootedAt, lootedBy, itemId, amount, lootedFrom }

        loot.push(log)
      }

      state.lootLogs.push(deepFreeze(loot))
    },
    addSelectedPlayersLogs(state, logs) {
      const selectedPlayers = []

      for (const line of logs) {
        const result = regex.guildMemberLogRe.exec(line)

        if (result == null) {
          continue
        }

        const playerName = result[1]

        const player = { playerName }

        selectedPlayers.push(player)
      }

      state.selectedPlayersLogs.push(deepFreeze(selectedPlayers))
    },
    addChestLogs(state, logs) {
      const donations = []

      for (const line of logs) {
        const result = regex.chestLogRe.exec(line)

        if (result == null) {
          continue
        }

        const donatedAt = moment(result[1], 'MM/DD/YYYY hh:mm:ss')
        const donatedBy = result[2]
        const itemName = result[3]
        const itemEnchant = parseInt(result[4], 10)
        const amount = parseInt(result[5], 10)

        let itemId = items[itemName]

        if (itemEnchant > 0 && itemId.indexOf('@') === -1) {
          itemId = `${itemId}@${itemEnchant}`
        }

        if (amount > 0) {
          const log = { donatedAt, donatedBy, itemId, itemEnchant, amount }

          donations.push(log)
        }
      }

      state.chestLogs.push(deepFreeze(donations))
    }
  },
  getters: {
    donatedLoot(state) {
      const donatedLoot = {}

      for (const logs of state.chestLogs) {
        for (const line of logs) {
          const key = `${line.donatedBy} ${line.donatedAt} ${line.itemId} ${line.amount}`

          donatedLoot[key] = line
        }
      }

      return deepFreeze(Object.values(donatedLoot))
    },
    allPlayers(state, getters) {
      const players = {}

      for (const loot of getters.filteredLoot) {
        if (players[loot.lootedBy] == null) {
          players[loot.lootedBy] = {
            name: loot.lootedBy,
            amountOfPickedUpItems: 0,
            pickedUpItems: {},
            resolvedItems: {},
            lostItems: {},
            donatedItems: {}
          }
        }

        if (players[loot.lootedBy].pickedUpItems[loot.itemId] == null) {
          players[loot.lootedBy].pickedUpItems[loot.itemId] = {
            id: loot.itemId,
            amount: 0,
            history: []
          }
        }

        players[loot.lootedBy].amountOfPickedUpItems += 1

        players[loot.lootedBy].pickedUpItems[loot.itemId].amount += loot.amount
        players[loot.lootedBy].pickedUpItems[loot.itemId].history.push(loot)
      }

      for (const loot of getters.filteredLoot) {
        if (players[loot.lootedFrom] == null) {
          players[loot.lootedFrom] = {
            name: loot.lootedFrom,
            amountOfPickedUpItems: 0,
            pickedUpItems: {},
            resolvedItems: {},
            lostItems: {},
            donatedItems: {}
          }
        }

        const player = players[loot.lootedFrom]

        player.died = true

        if (player.lostItems[loot.itemId] == null) {
          player.lostItems[loot.itemId] = {
            id: loot.itemId,
            amount: 0,
            history: []
          }
        }

        player.lostItems[loot.itemId].amount += loot.amount
        player.lostItems[loot.itemId].history.push(loot)

        // if the lost item was picked up, it needs to subtract and create/increment a "resolved" item
        if (player.pickedUpItems[loot.itemId] != null) {
          if (player.resolvedItems[loot.itemId] == null) {
            player.resolvedItems[loot.itemId] = {
              id: loot.itemId,
              amount: 0,
              history: []
            }
          }

          player.resolvedItems[loot.itemId].amount += loot.amount
          player.resolvedItems[loot.itemId].history.push({
            amount: loot.amount,
            at: loot.lootedAt,
            str: `picked up but lost`
          })

          if (loot.amount >= player.pickedUpItems[loot.itemId].amount) {
            delete player.pickedUpItems[loot.itemId]
          } else {
            player.pickedUpItems[loot.itemId].amount -= loot.amount
          }

          player.amountOfPickedUpItems -= loot.amount
        }
      }

      for (const donation of getters.filteredDonations) {
        if (players[donation.donatedBy] == null) {
          players[donation.donatedBy] = {
            name: donation.donatedBy,
            amountOfPickedUpItems: 0,
            pickedUpItems: {},
            resolvedItems: {},
            lostItems: {},
            donatedItems: {}
          }
        }

        const player = players[donation.donatedBy]

        if (player.donatedItems[donation.itemId] == null) {
          player.donatedItems[donation.itemId] = {
            id: donation.itemId,
            amount: 0,
            history: []
          }
        }

        player.donatedItems[donation.itemId].amount += donation.amount
        player.donatedItems[donation.itemId].history.push(donation)

        if (player.pickedUpItems[donation.itemId] != null) {
          if (player.resolvedItems[donation.itemId] == null) {
            player.resolvedItems[donation.itemId] = {
              id: donation.itemId,
              amount: 0,
              history: []
            }
          }

          player.resolvedItems[donation.itemId].amount += donation.amount
          player.resolvedItems[donation.itemId].history.push({
            amount: donation.amount,
            at: donation.donatedAt,
            str: `picked up and donated`
          })

          if (donation.amount >= player.pickedUpItems[donation.itemId].amount) {
            delete player.pickedUpItems[donation.itemId]
          } else {
            player.pickedUpItems[donation.itemId].amount -= donation.amount
          }

          player.amountOfPickedUpItems -= donation.amount
        }
      }

      // filter players that didn't picked up anything
      for (const playerName in players) {
        const player = players[playerName]

        const hasPickedUpItemsToShow = Object.keys(player.pickedUpItems).length

        if (!hasPickedUpItemsToShow) {
          delete players[playerName]
        }
      }

      return deepFreeze(players)
    },
    selectedPlayers(state) {
      if (!state.selectedPlayersLogs.length) {
        return null
      }

      const selectedPlayers = new Set()

      for (const logs of state.selectedPlayersLogs) {
        for (const item of logs) {
          selectedPlayers.add(item.playerName)
        }
      }

      return Array.from(selectedPlayers)
    },
    filteredPlayers(state, getters) {
      if (!getters.selectedPlayers) {
        return getters.allPlayers
      }

      const players = {}

      for (const player of getters.selectedPlayers) {
        if (getters.allPlayers[player]) {
          players[player] = getters.allPlayers[player]
        }
      }

      return players
    },
    allLoot(state) {
      const loot = []

      for (const logs of state.lootLogs) {
        for (const log of logs) {
          const isDuplicate = loot.some(e => {
            // if the player looted different players, it is definetly not a duplicate.
            if (e.lootedFrom !== log.lootedFrom) {
              return false
            }

            if (e.lootedBy !== log.lootedBy) {
              return false
            }

            if (e.itemId !== log.itemId) {
              return false
            }

            const diff = Math.abs(e.lootedAt.diff(log.lootedAt))

            // if looted from the same player, in a very short time window, it is
            // probably a duplicate
            return diff <= 5000
          })

          if (!isDuplicate) {
            loot.push(log)
          }
        }
      }

      return deepFreeze(loot)
    },
    filteredLoot(state, getters) {
      const filteredLoot = getters.allLoot.filter(loot => {
        const hideItem = getters.filterPatterns.some(pattern => loot.itemId.match(pattern))

        return !hideItem
      })

      return deepFreeze(filteredLoot)
    },
    filteredDonations(state, getters) {
      const filteredDonations = getters.donatedLoot.filter(loot => {
        const hideItem = getters.filterPatterns.some(pattern => loot.itemId.match(pattern))

        return !hideItem
      })

      return deepFreeze(filteredDonations)
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
        filterPatterns.push(/_BAG_INSIGHT/)
      }

      if (!state.filters.potion) {
        filterPatterns.push(/_POTION_/)
      }

      if (!state.filters.food) {
        filterPatterns.push(/_MEAL_/)
        filterPatterns.push(/_FISH_SALTWATER_/)
        filterPatterns.push(/_FISH_FRESHWATER_/)
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
        filterPatterns.push(/_MOUNT_MULE/)
        filterPatterns.push(/_MOUNT_HORSE/)
        filterPatterns.push(/_MOUNT_ARMORED_HORSE/)
        filterPatterns.push(/_MOUNT_OX/)
        filterPatterns.push(/_MOUNT_GIANTSTAG/)
        filterPatterns.push(/_MOUNT_DIREWOLF/)
        filterPatterns.push(/_MOUNT_DIREBOAR/)
        filterPatterns.push(/_MOUNT_SWAMPDRAGON/)
        filterPatterns.push(/_MOUNT_DIREBEAR/)
        filterPatterns.push(/_MOUNT_MOABIRD_FW_BRIDGEWATCH/)
        filterPatterns.push(/_MOUNT_DIREBEAR_FW_FORTSTERLING/)
        filterPatterns.push(/_MOUNT_DIREBOAR_FW_LYMHURST/)
        filterPatterns.push(/_MOUNT_RAM_FW_MARTLOCK/)
        filterPatterns.push(/_MOUNT_SWAMPDRAGON_FW_THETFORD/)
        filterPatterns.push(/_MOUNT_HORSE_UNDEAD@1/)
        filterPatterns.push(/_MOUNT_COUGAR_KEEPER@1/)
        filterPatterns.push(/_MOUNT_ARMORED_HORSE_MORGANA@1/)
        filterPatterns.push(/UNIQUE_MOUNT_BAT_PERSONAL/)
        filterPatterns.push(/_MOUNT_MONITORLIZARD_ADC/)
        filterPatterns.push(/_MOUNT_HUSKY_ADC/)
        filterPatterns.push(/_MOUNT_FROSTRAM_ADC/)
        filterPatterns.push(/_MOUNT_TERRORBIRD_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_BEAR_KEEPER_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_BLACK_PANTHER_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_MORGANA_RAVEN_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_GIANT_HORSE_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_UNDEAD_DIREBOAR_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_DIVINE_OWL_ADC/)
        filterPatterns.push(/UNIQUE_MOUNT_HERETIC_MULE_ADC/)
      }

      if (!state.filters.others) {
        filterPatterns.push(/_ARTEFACT_/)

        filterPatterns.push(/_RUNE/)
        filterPatterns.push(/_SOUL/)
        filterPatterns.push(/_RELIC/)

        filterPatterns.push(/_FARM/)
        filterPatterns.push(/_TOOL_/)
        filterPatterns.push(/_GVGTOKEN_/)
        filterPatterns.push(/TREASURE/)
        filterPatterns.push(/FURNITUREITEM/)
        filterPatterns.push(/_JOURNAL_/)
        filterPatterns.push(/_SKILLBOOK/)
        filterPatterns.push(/_SEAWEED/)
        filterPatterns.push(/QUESTITEM_EXP_TOKEN/)
        filterPatterns.push(/QUESTITEM_TOKEN/)
        filterPatterns.push(/_VANITY_/)

        filterPatterns.push(/T\d_ROCK/)
        filterPatterns.push(/T\d_STONEBLOCK/)
        filterPatterns.push(/T\d_FIBER/)
        filterPatterns.push(/T\d_CLOTH/)
        filterPatterns.push(/T\d_ORE/)
        filterPatterns.push(/T\d_METALBAR/)
        filterPatterns.push(/T\d_WOOD/)
        filterPatterns.push(/T\d_PLANKS/)
        filterPatterns.push(/T\d_HIDE/)
        filterPatterns.push(/T\d_LEATHER/)
      }

      return deepFreeze(filterPatterns)
    },
    donationsByPlayer(state, getters) {
      const donationsByPlayer = {}

      for (const donation of getters.donatedLoot) {
        if (donationsByPlayer[donation.donatedBy] == null) {
          donationsByPlayer[donation.donatedBy] = {}
        }
        
        if (donationsByPlayer[donation.donatedBy][donation.itemId] == null) {
          donationsByPlayer[donation.donatedBy][donation.itemId] = {
            amount: 0,
            history: []
          }
        }

        donationsByPlayer[donation.donatedBy][donation.itemId].amount += donation.amount
        donationsByPlayer[donation.donatedBy][donation.itemId].history.push(donation)
      }

      return deepFreeze(donationsByPlayer)
    }
  }
})
