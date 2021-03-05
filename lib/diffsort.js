'use strict'

// diffsort.js
// sort and diffs two arrays
// 2016, 2020 Volker Hehl

// const logger = include('lib/logger')

// returns an array like this:
// [
//     {
//         left: <element or null when missing here>,
//         right <element or null when missing here>
//     },
//     {
//         ..
//     },
//     ..
// ]

function diffSort(leftArray, rightArray, compareFunction) {
    let leftCounter = 0
    let rightCounter = 0
    let leftStop = true
    let rightStop = true
    let result = []

    if (leftArray.length === 0 && rightArray.length === 0) {
        return []
    }

    if (leftArray.length === 0 && rightArray.length > 0) {
        return rightArray.sort(compareFunction).map(el => {
            return {
                left: null,
                right: el
            }
        })
    }

    if (leftArray.length > 0 && rightArray.length === 0) {
        return leftArray.sort(compareFunction).map(el => {
            return {
                left: el,
                right: null
            }
        })
    }

    leftArray = leftArray.sort(compareFunction)
    rightArray = rightArray.sort(compareFunction)

    do {
        let leftElement = leftArray[leftCounter]
        let rightElement = rightArray[rightCounter]

        switch (compareFunction(leftElement, rightElement)) {
            case 1:
                // left > right
                result.push({
                    left: null,
                    right: rightElement
                })

                rightCounter++
                break

            case -1:
                // left < right
                result.push({
                    left: leftElement,
                    right: null
                })

                leftCounter++
                break

            default:
                // case 0:
                // left == right
                result.push({
                    left: leftElement,
                    right: rightElement
                })

                leftCounter++
                rightCounter++
        }

        leftStop = (leftCounter >= leftArray.length)
        rightStop = (rightCounter >= rightArray.length)

        if (leftStop && !rightStop) {
            do {
                result.push({
                    left: null,
                    right: rightArray[rightCounter]
                })

                rightCounter++
            } while (rightCounter < rightArray.length)

            rightStop = true
        }

        if (rightStop && !leftStop) {
            do {
                result.push({
                    left: leftArray[leftCounter],
                    right: null
                })

                leftCounter++
            } while (leftCounter < leftArray.length)

            leftStop = true
        }
    } while (!leftStop || !rightStop)

    return result
}

module.exports = diffSort
