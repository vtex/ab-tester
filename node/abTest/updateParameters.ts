import Router from '../clients/router'
import Storedash from '../clients/storedash'
import TestingParameters from '../typings/testingParameters'
import TestingWorkspaces from '../typings/testingWorkspace'
import { RandomRestart } from '../utils/randomExploration'
import { FilteredWorkspacesData } from '../utils/workspace'
import { MapWorkspaceData } from '../utils/workspacesInfo/workspaceData'
import { IsInitialStage } from './analysis/time/initialStage'
import { BuildCompleteData } from './data/buildData'
import { InitializeParameters } from './initializeParameters'


const MasterWorkspaceName = 'master'

export async function UpdateParameters(account: string, aBTestBeginning: string, workspacesData: WorkspaceData[], testingWorkspaces: TestingWorkspaces, router: Router, storedash: Storedash): Promise<void> {
    if (await IsInitialStage(workspacesData, storedash)) {
        return
    }
    const testingParameters = new TestingParameters(testingWorkspaces.ToArray())

    const workspacesCompleteData = await BuildCompleteData(account, aBTestBeginning, FilteredWorkspacesData(workspacesData, testingWorkspaces.WorkspacesNames()), storedash, router)
    const masterWorkspace = workspacesCompleteData.get(MasterWorkspaceName)
    let randomRestart: boolean = false
    for (const workspaceCompleteData of workspacesCompleteData) {
        randomRestart = workspaceCompleteData[0] === MasterWorkspaceName ? false : RandomRestart(workspaceCompleteData[1], masterWorkspace!)
        if (!randomRestart) {
            testingParameters.Set(MapWorkspaceData(workspacesData))
            await router.setParameters(account, testingParameters.ToArray())
            return
        }
    }

    await InitializeParameters(account, testingWorkspaces.ToArray(), router)
}