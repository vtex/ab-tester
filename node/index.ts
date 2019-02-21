import { ColossusContext } from 'colossus'
import { initializeABtest, ABTestStatus } from '../TestCase'

export default {
  events: {
    onAppsLinked: async (ctx) => {
      console.log(`onAppsLinked body: ${ctx.body}`)
    }
  },
  routes: {
    initializeAbTest: async (ctx: ColossusContext) => {
      ctx.set('Cache-Control', 'no-cache')
      ctx.response.status = 200

      await initializeABtest(ctx)

      ctx.response.body = 'A/B Test initialized'
    },
    abTestStatus: async (ctx: ColossusContext) => {
      ctx.set('Cache-Control', 'no-cache')
      ctx.response.status = 200

      var ResultAB = await ABTestStatus(ctx)

      ctx.response.body = ResultAB
    }
  }
}