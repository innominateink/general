let distribution = {
  13: 0, 14:0, 15:0,16:0,17:0,18:0
}

function a(startResult) {
  let result = startResult

  for (let i = 1; i <= 6; i++) {
    if (result + i > 12) distribution[result + i] += 1
      else a(result += i)
  }
}

a(0)

let maxValue = (() => {
  let max = distribution[13]
  for (let key in distribution) if (distribution[key] > max) max = distribution[key]
  return max
})()

let str = ''
for (let c = maxValue/10; c >= 0; c--) {
  str += Math.trunc(c*10)
  
  for (let z = 4 - Math.trunc(c*10).toString().length; z >= 1; z--) str += ' '

  for (let r = 13; r <= 18; r++) {
    str += (distribution[r]/10 >= c) ? ' O ' : '   '
  }
  str += '\n'
}
str += '    13 14 15 16 17 18'

console.log(str)