import { initializeAbTestForWorkspace as initialize, ABTestStatus as status, TTCAbTest as timeToComplete, finishAbTestForWorkspace as finish } from '../../TestCase'

export const timeToCompleteAbTest = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  const time = await timeToComplete(ctx)

  ctx.status = 200
  ctx.body = time
}

export const initializeAbTestForWorkspace = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  await initialize(ctx)

  ctx.status = 200
  ctx.body = 'A/B Test beginning saved successfully'
}

export const abTestStatus = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  const ResultAB = await status(ctx)

  ctx.status = 200
  ctx.body = ResultAB
}

export const finishAbTestForWorkspace = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  await finish(ctx)

  ctx.status = 200
  ctx.body = 'A/B Test finished'
}