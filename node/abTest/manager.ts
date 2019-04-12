import { getWithRetriesHelper } from '../utils/getWithRetries'
import { FinishAbTestForWorkspace as finish } from './commands/finish'
import { InitializeAbTestForWorkspace as initialize } from './commands/initialize'
import { keep } from './commands/keepUpdating'
import { ABTestStatus as status } from './commands/status'
import { TTCAbTest as timeToComplete } from './commands/timeToComplete'

export const timeToCompleteAbTest = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  const time = await await getWithRetriesHelper(timeToComplete)(3, ctx)

  ctx.status = 200
  ctx.body = time
}

export const initializeAbTestForWorkspace = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  await await getWithRetriesHelper(initialize)(3, ctx)

  ctx.status = 200
  ctx.body = 'A/B Test beginning saved successfully'
}

export const abTestStatus = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  const ResultAB = await getWithRetriesHelper(status)(3, ctx)

  ctx.status = 200
  ctx.body = ResultAB
}

export const keepStatus = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  ctx.status = 200
  ctx.body = 'Keeping A/B Test updated'

  await keep(ctx)
}

export const finishAbTestForWorkspace = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  await await getWithRetriesHelper(finish)(3, ctx)

  ctx.status = 200
  ctx.body = 'A/B Test finished'
}