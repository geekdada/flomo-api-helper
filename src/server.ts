import Hapi, { ResponseObject } from '@hapi/hapi'
import _ from 'lodash'
import Boom from '@hapi/boom'
import Joi from '@hapi/joi'
import HapiPino from 'hapi-pino'

import Flomo from './flomo'

export async function createServer(
  address: string,
  port: number,
  flomo: Flomo,
): Promise<Hapi.Server> {
  const server = Hapi.server({
    port,
    address,
    compression: {
      minBytes: 2048,
    },
    debug: false,
  })
  await server.register({
    plugin: HapiPino,
    options: {
      prettyPrint: true,
      redact: ['req.headers.authorization', 'req.headers.cookie'],
      logRequestComplete: false,
    },
  })

  // Hooks
  server.ext('onRequest', (request, h) => {
    if (request.headers['x-token'] === process.env.API_TOKEN) {
      return h.continue
    } else {
      throw Boom.unauthorized()
    }
  })
  server.ext('onPreResponse', (request, h) => {
    if (!request.response.hasOwnProperty('isBoom')) {
      const response = request.response as ResponseObject

      response.header(
        'x-powered-by',
        `flomo-api-helper/${require('../package.json').version}`,
      )
    }

    return h.continue
  })

  // Event listeners
  server.events.on('response', (request) => {
    if (request.response instanceof Boom.Boom) {
      server.logger.error(
        `${request.method.toUpperCase()} ${request.path} ${
          request.response.output.statusCode
        } ${request.response.message}`,
      )
    } else {
      server.logger.info(
        `${request.method.toUpperCase()} ${request.path} ${
          request.response.statusCode
        }`,
      )
    }
  })

  // Routes
  server.route({
    method: 'PUT',
    path: '/helper/memo',
    options: {
      log: {
        collect: true,
      },
      cors: {
        origin: ['*'],
        additionalHeaders: ['x-token'],
      },
      validate: {
        // @ts-ignore
        payload: Joi.object({
          content: Joi.string().required(),
          tags: Joi.string(),
          contentType: Joi.string().valid('html', 'text'),
        }),
      },
    },
    handler: async (request, h) => {
      const {
        content,
        tags,
        contentType = 'text',
      }: {
        content: string
        tags?: string
        contentType: string
      } = request.payload as any
      const payload = {
        content: '',
        file_ids: [],
        parent_memo_id: null,
        source: 'web',
      }

      if (contentType === 'text') {
        content.split('\n').forEach((sentence) => {
          payload.content += `<p>${sentence}</p>`
        })
      } else {
        payload.content += content
      }

      if (tags) {
        const tagsString = tags
          .split(',')
          .map((tag) => `#${tag.trim()}`)
          .join(' ')
        payload.content += `<p>${tagsString}</p>`
      }

      const upstreamRes = await flomo.client.put('https://flomo.app/api/memo', {
        json: payload,
      })

      return h.response(upstreamRes.body).code(upstreamRes.statusCode)
    },
  })

  server.route({
    method: '*',
    path: '/{p*}',
    options: {
      log: {
        collect: true,
      },
      cors: {
        origin: ['*'],
        additionalHeaders: ['x-token'],
      },
    },
    handler: async (request, h) => {
      const url = request.url
      url.hostname = 'flomo.app'
      url.port = '443'
      url.protocol = 'https:'

      const upstreamRes = await flomo.client({
        url: url.toString(),
        method: request.method,
        ...(_.isPlainObject(request.payload)
          ? {
              json: request.payload as Record<string, any>,
            }
          : null),
      })

      return h.response(upstreamRes.body).code(upstreamRes.statusCode)
    },
  })

  return server
}
