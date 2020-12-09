import Boom from '@hapi/boom'
import got, { Got } from 'got'
import _ from 'lodash'
import tough, { CookieJar } from 'tough-cookie'
import HttpAgent from 'agentkeepalive'

const { HttpsAgent } = HttpAgent

class Flomo {
  client: Got
  cookieJar: CookieJar
  isLogin = false

  constructor() {
    this.cookieJar = new tough.CookieJar()
    this.client = got.extend({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.67 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json; charset=utf-8',
      },
      responseType: 'json',
      cookieJar: this.cookieJar,
      http2: false,
      agent: {
        http: new HttpAgent({
          keepAlive: true,
          keepAliveMsecs: 60000,
          freeSocketTimeout: 30000,
        }),
        https: new HttpsAgent({
          keepAlive: true,
          keepAliveMsecs: 60000,
          freeSocketTimeout: 30000,
        }),
      },
      hooks: {
        beforeRequest: [
          (options) => {
            const cookies = this.cookieJar.getCookiesSync(
              options.url.toString(),
            )

            if (cookies) {
              cookies.forEach((cookie) => {
                const c = cookie.toJSON()

                if (c.key === 'XSRF-TOKEN') {
                  options.headers['X-XSRF-TOKEN'] = decodeURIComponent(c.value)
                }
              })
            }
          },
        ],
        afterResponse: [
          (response) => {
            const rawSetCookie = response.headers['set-cookie']

            if (rawSetCookie) {
              rawSetCookie.forEach((setCookie) => {
                this.cookieJar.setCookieSync(setCookie, response.requestUrl)
              })
            }

            return response
          },
        ],
        beforeError: [
          (error) => {
            const upstreamStatusCode = _.get(error, 'response.status', 500)
            const upstreamMessage = _.get(error, 'response.body.message')

            Boom.boomify(error, {
              message: upstreamMessage,
              statusCode: upstreamStatusCode,
            })

            return error
          },
        ],
      },
    })
  }

  async login(): Promise<void> {
    await this.preflight()

    const res = await this.client.post<{ code: number; message: string }>(
      'https://flomoapp.com/api/user/login',
      {
        json: {
          email: process.env.FLOMO_EMAIL as string,
          password: process.env.FLOMO_PASSWORD as string,
        },
      },
    )

    if (res.body.message !== '已登录') {
      throw new Error('登录失败')
    }

    this.isLogin = true
  }

  private async preflight(): Promise<void> {
    await this.client.get('https://flomoapp.com/login', {
      responseType: 'text',
    })
  }
}

export default Flomo
