import { TTCAbTest as timeToComplete } from './commands/timeToComplete'
import { InitializeAbTestForWorkspace as initialize } from './commands/initialize'
import { ABTestStatus as status } from './commands/status'
import { FinishAbTestForWorkspace as finish } from './commands/finish'

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