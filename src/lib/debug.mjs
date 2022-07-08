import { isMage, giveMeARandomMage } from './magerank.mjs'
import { diffJson } from 'diff'
import chalk from 'chalk'

export function hashMismatchOutput (hashName, badProperty, goodProperty) {
  if (badProperty === '-' || badProperty === undefined) {
    console.debug(`${hashName} hash was empty`)
    return
  }
  console.group(`${hashName} hash was different:`)
  const badDiff = diffJson(goodProperty, badProperty, { context: 2, ignoreWhitespace: false })
  badDiff.forEach((part) => {
    const color = part.added
      ? chalk.green(part.value)
      : part.removed ? chalk.red(part.value) : chalk.grey(part.value)
    if (color) {
      console.log(color)
    }
  })

  console.groupEnd()
}

export function findIncorrectHash (badNode, goodNode) {
  if (badNode.startupHash !== goodNode.startupHash) {
    hashMismatchOutput('Startup', badNode.data.startup, goodNode.data.startup)
  }
  if (badNode.paramHash !== goodNode.paramHash) {
    hashMismatchOutput('Params', badNode.data.params, goodNode.data.params)
  }
  if (badNode.steakHash !== goodNode.steakHash) {
    hashMismatchOutput('Stake', badNode.data.steak, goodNode.data.steak)
  }
  if (badNode.epochHash !== goodNode.epochHash) {
    hashMismatchOutput('Epoch', badNode.data.epoch, goodNode.data.epoch)
  }
}

// TODO: pull non-maged nodes, find the hashes that differ
//       and diff it with a maged node
export function debug (nodes) {
  const mage = giveMeARandomMage(nodes)

  nodes.forEach(node => {
    if (!isMage(node)) {
      console.group(chalk.bold(node.host))

      if (node.data.error) {
        console.error(node.data.error)
      } else {
        if (node.blockHeight !== '-' && node.blockHeight !== mage.blockHeight) {
          node.data.diagnosisCode = 0
          node.data.diagnosis = 'Probably no error: node returned a different block to the mages'
        } else {
          node.data.diagnosisCode = 1
          node.data.diagnosis = 'Node did not return good data'
        }

        if (node.data.diagnosisCode === 1) {
          findIncorrectHash(node, mage)
        } else {
          console.error(node.data.diagnosis)
        }
      }

      console.groupEnd()
    }
  })

  return nodes
}
