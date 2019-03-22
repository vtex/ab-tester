import { map } from 'ramda'
import { ttcAbTestForWorkspace, initializeAbTestForWorkspace, abTestStatus, finishAbTestForWorkspace } from './abTest/manager';
import { Resources } from './resources/index'

const testManager = (handler: any) => async (ctx: ColossusContext) => {
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
  }
}

export default {
  events: {
    onAppsLinked: async (ctx) => {
      console.log(`onAppsLinked body: ${ctx.body}`)
    }
  },
  routes:
    map(testManager, {
      ttcAbTestForWorkspace,
      initializeAbTestForWorkspace,
      abTestStatus,
      finishAbTestForWorkspace
    })
}