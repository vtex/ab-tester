import {ColossusContext} from 'colossus'
import {ABtest} from '../TestCase'

export default {
  events: {
    onAppsLinked: async (ctx) => {
      console.log(`onAppsLinked body: ${ctx.body}`)
    }
  },
  routes: {
    abTest: async (ctx: ColossusContext) => {
      ctx.set('Cache-Control', 'no-cache')
      ctx.response.status = 200
      ctx.response.body = ABtest()
    }
  }
}