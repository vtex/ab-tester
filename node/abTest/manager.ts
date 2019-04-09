import { getWithRetriesHelper as finish } from './commands/finish'
import { getWithRetriesHelper as initialize } from './commands/initialize'
import { keep } from './commands/keepUpdating'
import { getWithRetriesHelper as status } from './commands/status'
import { getWithRetriesHelper as timeToComplete } from './commands/timeToComplete'

export const timeToCompleteAbTest = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  const time = await timeToComplete(3, ctx)

  ctx.status = 200
  ctx.body = time
}

export const initializeAbTestForWorkspace = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  await initialize(3, ctx)

  ctx.status = 200
  ctx.body = 'A/B Test beginning saved successfully'
}

export const abTestStatus = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  const ResultAB = await status(3, ctx)

  ctx.status = 200
  ctx.body = ResultAB
}

export const keepStatus = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  ctx.status = 200
  ctx.body = 'Keeping A/B Test updtated'

  await keep(ctx)
}

export const finishAbTestForWorkspace = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  await finish(3, ctx)

  ctx.status = 200
  ctx.body = 'A/B Test finished'
}