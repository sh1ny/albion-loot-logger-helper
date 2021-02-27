import moment from 'moment'

const regex = /(\d?\d:\d\d:\d\d)/

export function strToDate(str) {
  const result = regex.exec(str)

  if (result == null) {
    console.log(str, result)
    return moment.utc('')
  }

  return moment.utc(result[1], 'hh:mm:ss')
}

export function dateToStr(date) {
  window.date = date

  if (Object.isFrozen(date)) {
    return date.clone().utc().format('LTS')
  }

  return date.utc().format('LTS')
}
