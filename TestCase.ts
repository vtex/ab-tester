import { TestWorkspaces } from './node/abTest/evaluate'
import { FindWorkspace, TestingWorkspaces } from './node/workspace/list'
import { InitializeABTestMaster, InitializeABTestParams, FinishABTestMaster, FinishABTestParams } from './node/workspace/modify'
import { firstOrDefault } from './node/utils/firstOrDefault'
import { TimeToCompleteAbTest } from './node/abTest/time-to-complete'

const bucket = 'ABTest'
const fileName = 'currentABTest.json'

// TODO: `Id` should be determined in a general way based on account and workspaces
const testId = '0001'

export async function TTCAbTestForWorkspace(ctx: ColossusContext): Promise<number> {
    const { vtex: { account, route: { params: { probability } } } } = ctx
    return await TimeToCompleteAbTest(account, Number(probability), ctx)
}

export async function initializeABtest(probability: number, ctx: ColossusContext): Promise<void> {
    const { resources: { vbase } } = ctx
    const beginning = new Date().toISOString().substr(0, 10)

    return vbase.save(bucket, fileName, {
        Id: testId,
        timeStart: beginning,
        probability: probability
    } as ABTestData)
}

export async function initializeAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
    const { vtex: { account, route: { params: { probability, workspace } } } } = ctx

    const testingWorkspaces = await TestingWorkspaces(account, ctx)
    if (!testingWorkspaces) {
        await InitializeABTestMaster(account, ctx)
    }

    const workspaceName = firstOrDefault(workspace)
    if (!FindWorkspace(account, workspaceName, ctx)) {
        ctx.body = `workspace "${workspace}" doesn't exists.`,
            ctx.status = 401
    }

    await InitializeABTestParams(account, workspaceName, ctx)

    await initializeABtest(Number(probability), ctx)
}

export async function ABTestStatus(ctx: ColossusContext): Promise<TestResult[]> {
    const { vtex: { account }, resources: { vbase } } = ctx

    const data = await vbase.get(bucket, fileName)
    if (!data) {
        return [{
            ABTestBeginning: 'Test not initialized',
            WorkspaceA: 'none',
            WorkspaceB: 'none',
            Winner: 'none',
            ExpectedLossChoosingA: 0,
            ConversionA: 0,
            ExpectedLossChoosingB: 0,
            ConversionB: 0,
            ProbabilityAlternativeBeatMaster: 0,
            KullbackLeibler: 0
        }]
    }
    const beginning = data.timeStart
    const probability = data.probability
    const tResult = await TestWorkspaces(account, beginning, probability, ctx)
    return tResult

}

export async function finishAbTestForWorkspace(ctx: ColossusContext): Promise<void> {
    const { vtex: { account, route: { params: { workspace } } } } = ctx

    const testingWorkspaces = await TestingWorkspaces(account, ctx)
    if (testingWorkspaces.length == 2) {
        await FinishABTestMaster(account, ctx)
    }

    const workspaceName = firstOrDefault(workspace)
    if (!FindWorkspace(account, workspaceName, ctx)) {
        ctx.body = `workspace "${workspace}" doesn't exists.`,
            ctx.status = 401
    }

    await FinishABTestParams(account, workspaceName, ctx)
}