import { TSMap } from 'typescript-map'
import Router from '../clients/router'
import { createTestingParameters } from '../typings/testingParameters'

export async function InitializeParameters(account: string, testingWorkspaces: ABTestWorkspace[], proportion: number, testType: TestType, 
    testId: string, router: Router): Promise<void> {
        
    const testingParameters = createTestingParameters(testType, testingWorkspaces)
    testingParameters.UpdateWithFixedParameters(proportion)
    const tsmap = new TSMap<string, ABTestParameters>([...testingParameters.Get()])
    await router.setParameters(account, {
        Id: testId,
        parameterPerWorkspace: tsmap,
    })
}