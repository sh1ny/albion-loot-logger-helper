export default function deepFreeze(obj) {
  const props = Object.keys(obj)

  for (const prop of props) {
    if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop])
    }
  }

  return Object.freeze(obj)
}
