import { TSMap } from 'typescript-map'
import { createGenericTestingParameters } from '../typings/testingParameters'

export async function InitializeParameters(ctx: Context, id: string, testingWorkspaces: ABTestWorkspace[], proportion: number): Promise<void> {
    const [ router, account ] = [ ctx.clients.abTestRouter, ctx.vtex.account ]

    const testingParameters = createGenericTestingParameters(testingWorkspaces)
    testingParameters.UpdateWithFixedParameters(proportion)
    const tsmap = new TSMap<string, ABTestParameters>([...testingParameters.Get()])
    
    await router.setParameters(account, {
        Id: id,
        parameterPerWorkspace: tsmap,
    })
}

export async function InitializeWorkspaces(ctx: Context, id: string, testingWorkspaces: ABTestWorkspace[]): Promise<void> {
    await ctx.clients.abTestRouter.setWorkspaces(ctx.vtex.account, {
        id: (id),
        workspaces: testingWorkspaces,
    })
}