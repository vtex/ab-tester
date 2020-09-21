import TestingWorkspaces from '../typings/testingWorkspace'
 import { TestWorkspaces } from './testWorkspaces'
 import { firstOrDefault } from '../utils/firstOrDefault'

 export default async (testingWorkspaces: TestingWorkspaces, ctx: Context) => {
     const { vtex: { account, route: { params: { finishingWorkspace } } }, clients: { abTestRouter, storage } } = ctx
     const workspaceName = firstOrDefault(finishingWorkspace)

     try {
       await abTestRouter.deleteParameters(account).catch(logErrorTest(ctx))
       await abTestRouter.deleteWorkspaces(account).catch(logErrorTest(ctx))

       const testData = await storage.getTestData(ctx).catch(logErrorTest(ctx))
       const beginning = testData && testData.dateOfBeginning
         ? testData.dateOfBeginning
         : new Date().toISOString().substr(0, 16)

       const results = await TestWorkspaces(account, beginning, testingWorkspaces, ctx).catch(logErrorTest(ctx))

       await storage.finishABtest(ctx, results).catch(logErrorTest(ctx))
       ctx.vtex.logger.info({ message: `A/B Test finished in ${account} for workspace ${workspaceName}`, account: `${account}`, workspace: `${workspaceName}`, method: 'TestFinished' })
       return
     } catch (err) {
       if (err.status === 404) {
         err.message = 'Workspace not found'
       }
       ctx.vtex.logger.error({ status: ctx.status, message: err.message })
       throw err
     } 
 }

 const logErrorTest = (ctx: Context) => (err: any) => {
     if (err.status === 404) {
       err.message = 'Test not found'
     }
     ctx.vtex.logger.error({ status: ctx.status, message: err.message })
     throw err
 } 