import { ColossusContext } from 'colossus'
import { initializeABtest as initialize, ABTestStatus } from '../TestCase'

export const initializeAbTest = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  await initialize(ctx)

  ctx.status = 200
  ctx.body = 'A/B Test initialized'
}

export const abTestStatus = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  var ResultAB = await ABTestStatus(ctx)

  ctx.status = 200
  ctx.body = ResultAB
}