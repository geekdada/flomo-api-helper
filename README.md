# flomo-api-helper

[![NPM version][npm-image]][npm-url]
[![TAONPM version][taonpm-image]][taonpm-url]
![Nodejs][nodejs-version]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]
[![install size][pp-image]][pp-result]

[npm-image]: https://img.shields.io/npm/v/flomo-api-helper.svg?style=flat-square
[npm-url]: https://npmjs.org/package/flomo-api-helper
[david-image]: https://img.shields.io/david/geekdada/flomo-api-helper.svg?style=flat-square
[david-url]: https://david-dm.org/geekdada/flomo-api-helper
[snyk-image]: https://snyk.io/test/npm/flomo-api-helper/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/flomo-api-helper
[download-image]: https://img.shields.io/npm/dm/flomo-api-helper.svg?style=flat-square
[download-url]: https://npmjs.org/package/flomo-api-helper
[taonpm-image]: https://npm.taobao.org/badge/v/flomo-api-helper.svg
[taonpm-url]: https://npm.taobao.org/package/flomo-api-helper
[nodejs-version]: https://img.shields.io/node/v/flomo-api-helper
[pp-image]: https://packagephobia.now.sh/badge?p=flomo-api-helper
[pp-result]: https://packagephobia.now.sh/result?p=flomo-api-helper

一个 flomo 的接口拓展工具，方便你开发自己的拓展工具。

> 本项目基于 flomo 的非公开接口开发，随时有可能挂掉，使用请悉知。

## 安装

安装前请确保你的 Node.js 版本大于等于 12.0.0。

```bash
$ npm install flomo-api-helper -g
```

## 配置

在任意位置新建一个目录。本文以 `~/flomo-api-helper` 为例。

新建文件 `~/flomo-api-helper/.env`：

```
FLOMO_EMAIL=johnappleseed@apple.com
FLOMO_PASSWORD=123456qwerty
API_TOKEN=this-project-is-awesome
```

**注意：**

`API_TOKEN` 用于外部接口访问的鉴权。

## 运行

```bash
$ cd ~/flomo-api-helper
$ flomo start [--address 127.0.0.1 --port 8080]
```

### `--address`

- 可选
- 默认值：`127.0.0.1`（仅能本地访问，若要公网访问设为 0.0.0.0，建议用反代暴露 HTTPS 接口）

### `--port`

- 可选
- 默认值：`8080`

## 使用

### 鉴权

在请求头中增加：

```
X-Token: this-project-is-awesome
```

### API

#### `/api/*`

所有 `https://flomoapp.com/api/*` 的接口都暴露在了 `/api/*` 路由上，你可以直接发起请求。因为这些接口非公开，恕不提供文档。

#### `PUT /helper/memo`

新建一个 memo。

```
curl -X "PUT" "https://example.com/helper/memo" \
     -H 'X-Token: this-project-is-awesome' \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
          "content": "测试内容",
          "tags": "书摘",
          "contentType": "text"
        }'
```

- `content`
    - 必须
- `tags`
    - 可选
    - 描述：半角逗号分隔多个 tag（tag 必须连续没有空格分隔）
- `contentType`
    - 可选
    - 默认值：`text`
    - 可选值：`text` | `html`
    - 描述：`text` 类型会对 `content` 中的换行符进行处理，并且将内容转换成 flomo 能展示的内容；`html` 类型不会对 `content` 进行转换。flomo 支持展示少量的 HTML 标签，如果你想保存 Markdown 生成的 HTML 请将这里改为 `html`。

## 拓展工具

[Wiki](https://github.com/geekdada/flomo-api-helper/wiki/%E6%8B%93%E5%B1%95) 页面列出了目前基于此 API 开发的拓展工具，欢迎使用。

## License

[MIT](https://github.com/geekdada/flomo-api-helper/blob/master/LICENSE)
