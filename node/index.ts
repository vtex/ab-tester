import { ClientsConfig, Service } from '@vtex/api'
import { map } from 'ramda'
import { abTestStatus, finishAbTestForWorkspace, initializeAbTestForWorkspace, initializeAbTestForWorkspaceWithParameters, LegacyInitializeAbTestForWorkspace, timeToCompleteAbTest, updateParameters, initializeAbTest } from './abTest/controller'
import { Clients } from './clients/index'

const THREE_SECONDS_MS = 3000

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    logger: {
      timeout: THREE_SECONDS_MS,
    },
    routes: {
      timeout: THREE_SECONDS_MS,
    },
    storage: {
      retries: 2,
      timeout: THREE_SECONDS_MS,
    },
    storedash: {
      retries: 2,
      timeout: THREE_SECONDS_MS,
    },
  },
}

const tester = (handler: any) => async (ctx: Context) => {
  try {
    await handler(ctx)
  } catch (err) {
    if (err.code && err.message && err.status) {
      ctx.vtex.logger.error({ status: ctx.status, message: err.message })
      ctx.body = {
        code: err.code,
        message: err.message,
      }
      return
    }

    if (err.response) {
      ctx.body = ctx.status === 404 ? 'Not Found' : err.response.data
      ctx.vtex.logger.error({ status: ctx.status, data: err.response.data, message: err.message })
      return
    }

    if (err.status) ctx.status = err.status

    if (ctx.status === 400 || ctx.status === 404) return

    throw err
  }
}

export default new Service<Clients>({
  clients,
  events: {
    periodicUpdate: async (ctx: Context) => {
      await updateParameters(ctx)
    },
  },
  routes:
    map(tester, {
      LegacyInitializeAbTestForWorkspace,
      abTestStatus,
      finishAbTestForWorkspace,
      initializeAbTestForWorkspace,
      initializeAbTestForWorkspaceWithParameters,
      initializeAbTest,
      timeToCompleteAbTest,
    }),
})