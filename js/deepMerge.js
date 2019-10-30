function deepMerge(state = {}, mergeMe) {
  let mergedObject = {...state}

  for (let prop in mergeMe) {
    let value = mergeMe[prop]

    if (typeof value === 'object') mergedObject[prop] = deepMerge(state[prop], value)
    else mergedObject[prop] = value
  }

  return mergedObject
}
