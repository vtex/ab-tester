import { getWithRetriesHelper } from '../utils/getWithRetries'
import { FinishAbTestForWorkspace as finish } from './commands/finish'
import { InitializeAbTestForWorkspace as initialize } from './commands/initialize'
import { ABTestStatus as status } from './commands/status'
import { TTCAbTest as timeToComplete } from './commands/timeToComplete'
import { UpdateStatusOnEvent as update } from './commands/update'

export const timeToCompleteAbTest = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  const time = await await getWithRetriesHelper(timeToComplete)(3, ctx)

  ctx.status = 200
  ctx.body = time
}

export const initializeAbTestForWorkspace = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  await getWithRetriesHelper(initialize)(3, ctx)

  ctx.status = 200
  ctx.body = 'A/B Test beginning saved successfully'
}

export const abTestStatus = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  const ResultAB = await getWithRetriesHelper(status)(3, ctx)

  ctx.status = 200
  ctx.body = ResultAB
}

export const finishAbTestForWorkspace = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  await getWithRetriesHelper(finish)(3, ctx)

  ctx.status = 200
  ctx.body = 'A/B Test finished'
}

export const updateParameters = async (ctx: EventsContext) => {
  await update(ctx)
}