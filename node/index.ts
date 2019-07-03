import { Service } from '@vtex/api'
import { map } from 'ramda'
import { abTestStatus, finishAbTestForWorkspace, initializeAbTestForWorkspace, LegacyInitializeAbTestForWorkspace, timeToCompleteAbTest, updateParameters } from './abTest/controller'
import { Resources } from './resources/index'

const tester = (handler: any) => async (ctx: ColossusContext) => {
  ctx.resources = new Resources(ctx.vtex)
  try {
    await handler(ctx)
  } catch (err) {
    if (err.code && err.message && err.status) {
      ctx.logger.sendErrorLog({ status: ctx.status, message: err.message })
      ctx.body = {
        code: err.code,
        message: err.message,
      }
      return
    }

    if (err.response) {
      ctx.body = ctx.status === 404 ? 'Not Found' : err.response.data
      ctx.logger.sendErrorLog({ status: ctx.status, message: err.response.data })
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
    map(tester, {
      LegacyInitializeAbTestForWorkspace,
      abTestStatus,
      finishAbTestForWorkspace,
      initializeAbTestForWorkspace,
      timeToCompleteAbTest,
    }),
})