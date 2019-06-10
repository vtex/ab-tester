import Router from '../clients/router'
import { InitialParameters } from '../utils/workspace'

export async function InitializeParameters(account: string, testingWorkspaces: ABTestWorkspace[], router: Router): Promise<void> {
    await router.setParameters(account, InitialParameters(testingWorkspaces))
}