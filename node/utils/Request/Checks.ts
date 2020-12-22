import { concatErrorMessages } from '../../utils/errorHandling'
import { WorkspaceMetadata } from '@vtex/api'
import TestingWorkspaces from '../../typings/testingWorkspace'

const expectedFields = ['InitializingWorkspaces', 'Hours', 'Proportion', 'Type', 'Approach', 'IsMAB']

export const checkForExpectedFields = (object: object) => {
    for (let idx = 0; idx < expectedFields.length; idx++) {
        const field = expectedFields[idx]
        if (!(field in object)) {
            const err = new Error(`Error getting request's parameters: make sure to set the ${field} field`) as any
            err.status = 400
            throw err
        }
    }
}

export const checkTestType = (Type: string) => {
    if (Type !== 'conversion' && Type !== 'revenue') {
        const err = new Error(`Error setting test type: please make sure to spell it correctly (either 'conversion' or 'revenue')`) as any
        err.status = 400
        throw err
    }
}

export const checkTestApproach = (Approach: string) => {
    if (Approach !== 'frequentist' && Approach !== 'bayesian') {
        const err = new Error(`Error setting analysis approach: please make sure to spell it correctly (either 'frequentist' or 'bayesian')`) as any
        err.status = 400
        throw err
    }
}

export const checkIfNaN = (hours: string, proportion: string) => {
    if (Number.isNaN(Number(hours))) {
        const err = new Error(`Error reading time parameter: make sure to insert a number`) as any
        err.status = 400
        throw err
    }
    if (Number.isNaN(Number(proportion))) {
        const err = new Error(`Error reading proportion parameter: make sure to insert a number`) as any
        err.status = 400
        throw err
    }
}

export const CheckProportion = (proportion: number): number => {
    return proportion >= 0 && proportion <= 10000 ? Math.round(proportion) : 10000
}

export const CheckInitializingWorkspaces = async (workspacesNames: string[], ctx: Context) => {
    for (const workspace of workspacesNames) {
        await CheckInitializingWorkspace(workspace, ctx)
    }
}

const CheckInitializingWorkspace = async (workspaceName: string, ctx: Context) => {    
    if (workspaceName === 'master') {
        const err = new Error(`Bad workspace name: please, do not select the master workspace; the master workspace will be part of the test anyway`) as any
        err.status = 400
        throw err
    }
    const account = ctx.vtex.account
    let workspaces: WorkspaceMetadata[]
    try {
        workspaces = await ctx.clients.workspaces.list(account)
    } catch (err) {
        err.message = concatErrorMessages(`Error checking workspace name: Error fetching list of account's workspaces`, err.message)
        throw err
    }

    for (const workspace of workspaces) {
        if (workspace.production && workspaceName === workspace.name) return
    }

    const err = new Error(`Bad workspace name: the workspace ${workspaceName} is not one of your account's production workspaces`) as any
    err.status = 400
    throw err
}

export const CheckFinishingWorkspace = (workspaceName: string, testingWorkspaces: TestingWorkspaces) => {
    if (workspaceName === 'master') {
        const err = new Error(`Bad workspace name: the master workspace cannot be removed from the test`) as any
        err.status = 400
        throw err
    }
    if (!(testingWorkspaces.Includes(workspaceName))) {
        const err = new Error(`Bad workspace name: make sure to select one of the workspaces under test`) as any
        err.status = 400
        throw err
    }
}