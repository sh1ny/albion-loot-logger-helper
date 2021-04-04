const axios = require('axios')
const bluebird = require('bluebird')
const fs = require('fs')
const path = require('path')

const AO_BIN_DUMP_URL = 'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.json'
const IMAGES_DIR = './public/items/'

async function main() {
  const response = await request(AO_BIN_DUMP_URL)
  const itemsDump = response.data

  return bluebird.map(itemsDump, async item => {
    const filenamePath = path.join(IMAGES_DIR, `${item.UniqueName}#1.png`)

    if (process.env.FORCE_DOWNLOAD) {
      await deleteFile(filenamePath)
    }

    const exists = await fileExists(filenamePath)

    if (!exists) {
      const url = `https://render.albiononline.com/v1/item/${item.UniqueName}.png?count=1&quality=1&size=217`

      console.log(`downloading ${item.UniqueName}`)

      await downloadImageAndSave(url, filenamePath)
    }
  }, { concurrency: 10 })
}

async function downloadImageAndSave(url, filenamePath) {
  const options = { responseType: 'stream' }

  const response = await request(url, options)

  if (response == null) {
    return console.error(`Can't download ${url}`)
  }

  const writer = fs.createWriteStream(filenamePath)

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

function fileExists(filenamePath) {
  return new Promise((resolve) => {
    fs.stat(filenamePath, (error) => {
      if (error) {
        return resolve(false)
      }

      return resolve(true)
    })
  })
}

function deleteFile(filenamePath) {
  return new Promise((resolve, reject) => {
    fs.rm(filenamePath, (error) => {
      if (error) {
        return reject(error)
      }

      return resolve()
    })
  })
}

async function request(url, options = {}, count = 0) {
  if (count >= 5) {
    return null
  }

  try {
    return await axios.get(url, options)
  } catch (error) {
    if (error.response && error.response.status === 404 && count > 2) {
      return null
    }

    const delay = 2 ** count * 100

    await new Promise(r => setTimeout(r, delay))

    return request(url, options, count + 1)
  }
}

main()
