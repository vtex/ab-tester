import { TSMap } from 'typescript-map'
import { createTestingProportions } from '../typings/testingProportions'
import TestingWorkspaces from '../typings/testingWorkspace'
import { RandomRestart } from '../utils/randomExploration/randomRestart'
import { FilteredWorkspacesData } from '../utils/workspace'
import { MapWorkspaceData } from '../utils/workspace'
import { IsInitialStage } from './analysis/time/initialStage'
import { BuildCompleteData } from './data/buildData'
import { InitializeProportions } from './initialize-Router'

const MasterWorkspaceName = 'master'

export async function UpdateProportions(ctx: Context, aBTestBeginning: string, hoursOfInitialStage: number, masterProportion: number,
    workspacesData: WorkspaceData[], testingWorkspaces: TestingWorkspaces, testId: string, testType: TestType, approach: TestApproach): Promise<void> {
    try { 
        const { clients: { abTestRouter, storedash, storage } } = ctx
        const testingProportions = createTestingProportions(testType, approach, testingWorkspaces.ToArray())

        if (await IsInitialStage(hoursOfInitialStage, workspacesData, storedash)) {
            testingProportions.UpdateWithFixedProportions(masterProportion)
            const tsmap = new TSMap<string, proportion>([...testingProportions.Get()])
            await abTestRouter.setProportions(ctx.vtex.account, {
                Id: testId,
                parameterPerWorkspace: tsmap,
            })
            return
        }
        const workspacesCompleteData = await BuildCompleteData(ctx.vtex.account, aBTestBeginning, FilteredWorkspacesData(workspacesData, testingWorkspaces.WorkspacesNames()), storedash, abTestRouter)
        const masterWorkspace = workspacesCompleteData.get(MasterWorkspaceName)
        let randomRestart: boolean = false
        for (const workspaceCompleteData of workspacesCompleteData) {
            randomRestart = workspaceCompleteData[0] === MasterWorkspaceName ? false : RandomRestart(approach, testType, workspaceCompleteData[1], masterWorkspace!)
        }
        if (!randomRestart) {
            testingProportions.Update(MapWorkspaceData(workspacesData))
            const tsmap = new TSMap<string, proportion>([...testingProportions.Get()])
            await abTestRouter.setProportions(ctx.vtex.account, {
                Id: testId,
                parameterPerWorkspace: tsmap,
            })
            return
        }
        await InitializeProportions(ctx, testId, testingWorkspaces.ToArray(), masterProportion)
        await storage.initializeABtest(hoursOfInitialStage, masterProportion, testType, approach, ctx)

    } catch (err) {
        err.message = 'Error updating proportions: ' + err.message
        throw err
    }
}