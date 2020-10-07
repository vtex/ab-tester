import { TSMap } from 'typescript-map'
import { createTestingParameters } from '../typings/testingParameters'
import TestingWorkspaces from '../typings/testingWorkspace'
import { RandomRestart } from '../utils/randomExploration'
import { FilteredWorkspacesData } from '../utils/workspace'
import { MapWorkspaceData } from '../utils/workspacesInfo/workspaceData'
import { IsInitialStage } from './analysis/time/initialStage'
import { BuildCompleteData } from './data/buildData'
import { InitializeParameters } from './initialize-Router'

const MasterWorkspaceName = 'master'

export async function UpdateParameters(ctx: Context, aBTestBeginning: string, hoursOfInitialStage: number, proportionOfTraffic: number,
    workspacesData: WorkspaceData[], testingWorkspaces: TestingWorkspaces, testId: string, testType: TestType): Promise<void> {
    try { 
        const { clients: { abTestRouter, storedash, storage } } = ctx
        const testingParameters = createTestingParameters(testType, testingWorkspaces.ToArray())

        if (await IsInitialStage(hoursOfInitialStage, workspacesData, storedash)) {
            testingParameters.UpdateWithFixedParameters(proportionOfTraffic)
            const tsmap = new TSMap<string, ABTestParameters>([...testingParameters.Get()])
            await abTestRouter.setParameters(ctx.vtex.account, {
                Id: testId,
                parameterPerWorkspace: tsmap,
            })
            return
        }
        const workspacesCompleteData = await BuildCompleteData(ctx.vtex.account, aBTestBeginning, FilteredWorkspacesData(workspacesData, testingWorkspaces.WorkspacesNames()), storedash, abTestRouter)
        const masterWorkspace = workspacesCompleteData.get(MasterWorkspaceName)
        let randomRestart: boolean = false
        for (const workspaceCompleteData of workspacesCompleteData) {
            randomRestart = workspaceCompleteData[0] === MasterWorkspaceName ? false : RandomRestart(workspaceCompleteData[1], masterWorkspace!)
        }
        if (!randomRestart) {
            testingParameters.Update(MapWorkspaceData(workspacesData))
            const tsmap = new TSMap<string, ABTestParameters>([...testingParameters.Get()])
            await abTestRouter.setParameters(ctx.vtex.account, {
                Id: testId,
                parameterPerWorkspace: tsmap,
            })
            return
        }
        await InitializeParameters(ctx, testId, testingWorkspaces.ToArray(), proportionOfTraffic, testType)
        await storage.initializeABtest(hoursOfInitialStage, proportionOfTraffic, testType, ctx)

    } catch (err) {
        err.message = 'Error updating parameters: ' + err.message
        throw err
    }
}