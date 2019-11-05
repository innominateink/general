// If value is provided, returns the total number of times that the property [seeking] is found being equal to value;
// If value is undefined, returns the total number of occurrences of property [seeking].
module.exports = recursivePropCounter = function(obj, seeking, value) {
  let sum = 0
  for (let prop in obj) {
    if (prop === seeking) {
      if (value !== undefined && obj[prop] === value) sum++
      else sum++
    }

    if (typeof obj[prop] === 'object') sum = sum + recursivePropCounter(obj[prop], seeking, value)
  }
  return sum
}

// let obj = {
//   id1: {
//     id11: { property: true },//1
//     id12: { property: false }
//   },
//   id2: {
//     id21: { property: false },
//     id22: { property: true }, //2
//     id23: { property: true }, //3
//     id24: {
//       id241: { property: true, //4
//         id2411: { property: true } //5
//       },
//       property: true //6
//     }
//   },
//   id3: {
//     id31: {
//       id311: { property: true }, //7
//       id312: {
//         id3121: {
//           id31211: { property: true }, //8
//           id31212: { property: true } //9
//         }
//       },
//       property: false
//     },
//     id32: { property: true } //10
//   }
// };
// console.log('With value: ', recursivePropCounter(obj, 'property', true));
// console.log('Without value', recursivePropCounter(obj, 'property'));
