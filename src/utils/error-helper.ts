import Command from 'common-bin'
import chalk from 'chalk'

export const errorHandler = function (this: Command, err: Error): void {
  console.error(chalk.red(`⚠️  发生错误`))
  console.error(chalk.red(`⚠️  ${err.name}: ${err.message}`))
  console.error('⚠️  版本号: %s', require('../../package.json').version)
  console.error()
  console.error(chalk.red(err.stack))
  console.error()

  process.exit(1)
}
