import { TSMap } from 'typescript-map'
import { createGenericTestingProportions } from '../typings/testingProportions'

export async function InitializeProportions(ctx: Context, id: string, testingWorkspaces: ABTestWorkspace[], masterProportion: number): Promise<void> {
    const [ router, account ] = [ ctx.clients.abTestRouter, ctx.vtex.account ]

    const testingProportions = createGenericTestingProportions(testingWorkspaces)
    testingProportions.UpdateWithFixedProportions(masterProportion)
    const tsmap = new TSMap<string, proportion>([...testingProportions.Get()])
    
    await router.setProportions(account, {
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