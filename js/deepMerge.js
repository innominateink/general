function deepMerge(state, mergeMe) {
  let mergedObject = {...state}

  for (let prop in mergeMe) {
    let value = mergeMe[prop]

    if (typeof value === 'object' && value !== null) mergedObject[prop] = deepMerge(state[prop], value)
    else mergedObject[prop] = value
  }

  return mergedObject
}

module.exports = deepMerge
