'use strict'

// args.js
// Version 1.2
// Argument parser
// (c) 2015 Volker Hehl | MIT License

// module.exports:
//   object with script arguments as keys and their following argument as value
//   keys must begin with '-'
//   values of keys must not begin with '-'!
//   missing values are resolved to true
//   args without leading '-', before the first key-argument are commands
//   values not following keys are missplaced

// example:
//   node.js <app-name> command1 command2 --first --second param2 -3 -4 parameter4 invalid --last
// resulting module.exports:
//   {
//       "scriptName": "<app-name>",
//       "--first": true,
//       "--second": "param2",
//       "-3": true,
//       "-4": "parameter4",
//       "--last": true,
//       "commands": [
//           "command1",
//           "command2"
//       ],
//       "misplaced": [
//           "invalid"
//       ]
//   }

let args = {}
let commands = []
let misplaced = []
let processArgs = process.argv.slice(2)
let commandPhase = true
let scriptNamePathElements = process.argv[1].split('/')
args.scriptName = scriptNamePathElements[scriptNamePathElements.length - 1]

for (let i in processArgs) {
    i = Number(i)
    let thisArg = processArgs[i]
    let nextArg = processArgs[i + 1]

    if (thisArg.charAt(0) == '-') {
        commandPhase = false
        let value = true

        if (nextArg && nextArg.charAt(0) != '-') {
            value = nextArg
        }

        args[thisArg] = value
    }
    else {
        if (i == 0 || processArgs[i - 1].charAt(0) != '-') {
            if (commandPhase) {
                commands.push(processArgs[i])
            }
            else {
                misplaced.push(processArgs[i])
            }
        }
    }
}

args.commands = commands
args.misplaced = misplaced
module.exports = args
