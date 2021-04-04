const axios = require('axios')
const _ = require('lodash')
const fs = require('fs')

async function main() {
  const response = await axios.get('https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json')

  const itemsIdToName = {}
  const itemsNameToId = {}

  for (const item of response.data) {
    const name = _.get(item, 'LocalizedNames["EN-US"]')
    const id = item.UniqueName

    itemsIdToName[id] = name || id

    if (name && itemsNameToId[name] == null) {
      itemsNameToId[name] = id
    }
  }

  fs.writeFileSync('./src/utils/items-id-to-name.json', JSON.stringify(itemsIdToName, null, 2)) 
  fs.writeFileSync('./src/utils/items.json', JSON.stringify(itemsNameToId, null, 2)) 
}

main()
