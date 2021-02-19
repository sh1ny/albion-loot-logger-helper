<template>
  <div class="home" @drop.prevent="drop" @dragover.prevent>
    <ul>
      <li v-for="player in filteredPlayers" :key="player.name">
        <div class="player-name">{{ player.name }}</div>
        <div class="items">
          <Item
            v-for="(details, itemId) in player.items"
            :key="itemId"
            :itemId="itemId"
            :amount="details.amount"
          ></Item>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import Item from "./components/Item.vue";

const guildMembersRe = /".*"\t"(.*)"\t".*"\t".*"/;
const lootRe = /(.*);(.*);(.*);(.*);(.*)/;
const chestLogs = /asd/;

export default {
  name: "Home",
  components: {
    Item
  },
  data() {
    return {
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
        cape: false
      },
      players: {},
      selectedPlayers: null
    };
  },
  computed: {
    filteredPlayers() {
      const filteredPlayers = [];

      console.log(this.players);

      for (const playerName in this.players) {
        console.log({ playerName });

        if (this.selectedPlayers && !this.selectedPlayers[playerName]) {
          continue;
        }

        const items = this.filterItems(this.players[playerName]);

        // if no items to display, skip this player
        if (!Object.values(items).length) {
          continue;
        }

        filteredPlayers.push({
          items,
          name: playerName
        });
      }

      return filteredPlayers;
    }
  },
  methods: {
    drop(event) {
      const droppedFiles = Array.from(event.dataTransfer.files);

      for (const file of droppedFiles) {
        if (file.type !== "text/plain") {
          return;
        }

        const reader = new FileReader();

        reader.onload = evt => this.processFile(evt.target.result);

        reader.readAsText(file, "UTF-8");
      }
    },
    filterItems(items) {
      const filterdItems = {};
      const filterPatterns = [];

      if (!this.filters.t2) {
        filterPatterns.push(/^T2/);
      }

      if (!this.filters.t3) {
        filterPatterns.push(/^T3/);
      }

      if (!this.filters.t4) {
        filterPatterns.push(/^T4/);
      }

      if (!this.filters.t5) {
        filterPatterns.push(/^T5/);
      }

      if (!this.filters.t6) {
        filterPatterns.push(/^T6/);
      }

      if (!this.filters.t7) {
        filterPatterns.push(/^T7/);
      }

      if (!this.filters.t8) {
        filterPatterns.push(/^T8/);
      }

      if (!this.filters.trash) {
        filterPatterns.push(/_TRASH/);
      }

      if (!this.filters.bag) {
        filterPatterns.push(/_BAG/);
      }

      if (!this.filters.potion) {
        filterPatterns.push(/_POTION_/);
      }

      if (!this.filters.food) {
        filterPatterns.push(/_MEAL_/);
      }

      if (!this.filters.cape) {
        filterPatterns.push(/^T\d_CAPE(?:@\d)?$/);

        filterPatterns.push(/^T\d_CAPEITEM_FW_BRIDGEWATCH(?:@\d)?$/);
        filterPatterns.push(/^T\d_CAPEITEM_FW_FORTSTERLING(?:@\d)?$/);
        filterPatterns.push(/^T\d_CAPEITEM_FW_LYMHURST(?:@\d)?$/);
        filterPatterns.push(/^T\d_CAPEITEM_FW_MARTLOCK(?:@\d)?$/);
        filterPatterns.push(/^T\d_CAPEITEM_FW_THETFORD(?:@\d)?$/);

        filterPatterns.push(/^T\d_CAPEITEM_HERETIC(?:@\d)?$/);
        filterPatterns.push(/^T\d_CAPEITEM_UNDEAD(?:@\d)?$/);
        filterPatterns.push(/^T\d_CAPEITEM_KEEPER(?:@\d)?$/);
        filterPatterns.push(/^T\d_CAPEITEM_MORGANA(?:@\d)?$/);
        filterPatterns.push(/^T\d_CAPEITEM_DEMON(?:@\d)?$/);
      }

      if (!this.filters.mount) {
        // FIXME: _MOUNT_ is very generic, it'll filter battle mounts.
        filterPatterns.push(/_MOUNT_/);
      }

      if (!this.filters.others) {
        filterPatterns.push(/RUNE/);
        filterPatterns.push(/SOUL/);
        filterPatterns.push(/RELIC/);
        filterPatterns.push(/_FARM/);
        filterPatterns.push(/_TOOL_/);
        filterPatterns.push(/_GVGTOKEN_/);
        filterPatterns.push(/TREASURE/);
      }

      for (const itemId in items) {
        const hideItem = filterPatterns.some(pattern => itemId.match(pattern));

        if (hideItem) {
          continue;
        }

        filterdItems[itemId] = items[itemId];
      }

      return filterdItems;
    },
    processFile(content) {
      console.log("precessing file", content);

      const lines = content.trim().split("\n");

      if (!lines.length) {
        return;
      }

      const head = lines[0];

      let result = lootRe.exec(head);

      if (result) {
        return this.processLoot(lines);
      }

      result = guildMembersRe.exec(head);

      if (result) {
        return this.processGuildMembers(lines);
      }

      result = chestLogs.exec(head);

      if (result) {
        return this.processChestLog(lines);
      }
    },
    processLoot(lines) {
      for (const line of lines) {
        const result = lootRe.exec(line);

        if (result == null) {
          continue;
        }

        const date = result[1];
        const by = result[2];
        const id = result[3];
        const amount = parseInt(result[4], 10);
        const from = result[5];

        if (this.players[by] == null) {
          this.players[by] = {};
        }

        if (this.players[by][id] == null) {
          this.players[by][id] = {
            amount: 0,
            date: [],
            from: []
          };
        }

        this.players[by][id].date.push(date);
        this.players[by][id].from.push(from);

        this.players[by][id].amount += amount;
      }
    },
    processGuildMembers(lines) {
      if (this.selectedPlayers == null) {
        this.selectedPlayers = {};
      }

      for (const line of lines) {
        const result = guildMembersRe.exec(line);

        if (result == null) {
          continue;
        }

        const playerName = result[1];

        this.selectedPlayers[playerName] = true;
      }
    },
    processChestLog() {
      console.log("process chest");
    }
  }
};
</script>

<style>
html,
body,
.home {
  height: 100%;
}
</style>
