import { initializeAbTestForWorkspace as initialize, ABTestStatus, TTCAbTestForWorkspace as ttcForWorkspace } from '../../TestCase'

export const ttcAbTestForWorkspace = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  const time = await ttcForWorkspace(ctx).then(success => console.log(success))
    .catch(err => console.log(err))

  ctx.status = 200
  ctx.body = 'Expected time: ' + String(time)
}

export const initializeAbTestForWorkspace = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  await initialize(ctx).then(success => console.log(success))
    .catch(err => console.log(err))

  ctx.status = 200
  ctx.body = 'A/B Test beginning saved successfully'
}

export const abTestStatus = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  const ResultAB = await ABTestStatus(ctx)

  ctx.status = 200
  ctx.body = ResultAB
}

export const finishAbTestForWorkspace = async (ctx: ColossusContext) => {
  ctx.set('Cache-Control', 'no-cache')

  await initialize(ctx).then(success => console.log(success))
    .catch(err => console.log(err))

  ctx.status = 200
  ctx.body = 'A/B Test beginning saved successfully'
}