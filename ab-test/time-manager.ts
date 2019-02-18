import VBaseClient from '../node/vbase';

export async function updateTest (testId, ctx)
{
  const vbase = await VBaseClient(ctx.vtex)

  console.log('saving')
  return vbase.saveAsBeginning({
    name: testId,
    startTime: new Date().getTime()
  })
}

export async function setBeginning(testId, ctx)
{
  const vbase = await VBaseClient(ctx.vtex)

  const data = await vbase
    .loadBeginning()
    .catch(err => console.log(err))

  if (data !== undefined) {
    await updateTest(data.name, ctx)
  }
  else{
    await updateTest(testId, ctx)
  }

  return true
}

export async function setBeginningWithTimeout(testId, timeout, ctx)
{
  const vbase = await VBaseClient(ctx.vtex)

  const data = await vbase
    .loadBeginning()
    .catch(err => console.log(err))

  if (data !== undefined) {
    await updateTest(data.name, ctx)
  }
  else{
    await updateTest(testId, ctx)
  }

  sleep(timeout).then(() => {
    updateTest(testId, ctx)
  })
  return true
}

export async function finish(ctx)
{
  const vbase = await VBaseClient(ctx.vtex)
  await vbase
    .finishABTest()
    .catch(err => console.log(err))

  return true
}

export async function getTimeElapsed(ctx)
{
  const vbase = await VBaseClient(ctx.vtex)

  const data = await vbase
    .loadBeginning()
    .catch(err => console.log(err))

  return data === undefined
    ? undefined
    : new Date().getTime() - data.startTime
}

const sleep = async timeInMs => {
  return new Promise(resolve => setTimeout(resolve, timeInMs))
}