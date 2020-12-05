import Command, { Context } from 'common-bin'
import assert from 'assert'
import Flomo from '../flomo'

import { createServer } from '../server'

class StartCommand extends Command {
  constructor(rawArgv?: string[]) {
    super(rawArgv)
    this.usage = '使用方法: flomo start'
    this.options = {
      address: {
        describe: 'Address',
        type: 'string',
        default: '127.0.0.1',
      },
      p: {
        alias: 'port',
        describe: '端口',
        default: 8080,
      },
    }

    assert(process.env.FLOMO_EMAIL)
    assert(process.env.FLOMO_PASSWORD)
    assert(process.env.API_TOKEN)
  }

  // istanbul ignore next
  public get description(): string {
    return '启动助手'
  }

  async run(ctx: Context): Promise<void> {
    const flomo = new Flomo()

    await flomo.login()

    const server = await createServer(ctx.argv.address, ctx.argv.port, flomo)

    await server.start()
  }
}

export = StartCommand
