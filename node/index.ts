import { Service } from '@vtex/api'
import { map } from 'ramda'
import { abTestStatus, finishAbTestForWorkspace, initializeAbTestForWorkspace, timeToCompleteAbTest, updateParameters } from './abTest/controller'
import { LoggerClient as Logger } from './clients/logger'
import { Resources } from './resources/index'

const testManager = (handler: any) => async (ctx: ColossusContext) => {
  ctx.resources = new Resources(ctx.vtex)
  try {
    await handler(ctx)
  } catch (err) {
    const logger = new Logger(ctx.vtex, {})

    if (err.code && err.message && err.status) {
      logger.sendLog(err, { status: ctx.status, message: err.message })
      ctx.body = {
        code: err.code,
        message: err.message,
      }
      return
    }

    if (err.response) {
      ctx.body = ctx.status === 404 ? 'Not Found' : err.response.data
      logger.sendLog(err, { status: ctx.status, message: err.response.data })
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

export default new Service({
  events: {
    periodicUpdate: async (ctx: EventsContext) => {
      ctx.resources = new Resources(ctx)
      updateParameters(ctx)
    },
  },
  routes:
    map(testManager, {
      abTestStatus,
      finishAbTestForWorkspace,
      initializeAbTestForWorkspace,
      timeToCompleteAbTest,
    }),
})