import Router from '../clients/router'
import { InitialParameters } from '../utils/workspace'

export async function InitializeParameters(account: string, testingWorkspaces: ABTestWorkspace[], testId: string, router: Router): Promise<void> {
    await router.setParameters(account, {
        Id: testId,
        Workspaces: InitialParameters(testingWorkspaces),
    })
}