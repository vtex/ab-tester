import { map } from 'ramda'
import { ColossusContext } from 'colossus'
import { initializeAbTest, abTestStatus } from '../ab-test/abtest-manager'
import { Resources } from './resources/index'

const prepare = (handler: any) => async (ctx: ColossusContext) => {
  ctx.resources = new Resources(ctx)
  try {
    await handler(ctx)
  } catch (err) {
    if (err.code && err.message && err.status) {
      console.log({ err })
      ctx.status = err.status
      ctx.body = {
        code: err.code,
        message: err.message,
      }
      return
    }

    if (err.response) {
      ctx.status = err.response.status
      ctx.body = ctx.status === 404 ? 'Not Found' : err.response.data
      console.log(
        `Error from HTTP request. ${err.response.config
          ? `method=${err.response.config.method} url=${err.response.config.url} `
          : ''} status=${err.response.status} data=${err.response.data}`
      )
      return
    }

    throw err
  } finally {
    // const end = process.hrtime(start)
    // if (ctx.status >= 200 && ctx.status < 300) {
    //   metrics.batchHrTimeMetric('http-2xx', start, production)
    // }
    // else if (ctx.status >= 400 && ctx.status < 500) {
    //   metrics.batchHrTimeMetric('http-4xx', start, production)
    // }
    // else if (ctx.status >= 500) {
    //   metrics.batchHrTimeMetric('http-5xx', start, production)
    // }
  }
}

export default {
  events: {
    onAppsLinked: async (ctx) => {
      console.log(`onAppsLinked body: ${ctx.body}`)
    }
  },
  routes:
    map(prepare, {
      initializeAbTest,
      abTestStatus
    })
}