import { concatErrorMessages } from '../../utils/errorHandling'
import { WorkspaceMetadata } from '@vtex/api'

const expectedFields = ['InitializingWorkspace', 'Hours', 'Proportion']

export const checkForExpectedFields = (object: object) => {
    for (let idx = 0; idx < expectedFields.length; idx++) {
        const field = expectedFields[idx]
        if (!(field in object)) {
            throw new Error(`Error getting request's parameters: make sure to set the ${field} field`)
        }
    }
}

export const checkTestType = (Type: string) => {
    if (Type !== 'conversion' && Type !== 'revenue') {
        throw new Error(`Error setting test type: please make sure to spell it correctly (either 'conversion' or 'revenue')`)
    }
}

export const checkIfNaN = (hours: string, proportion: string) => {
    if (Number.isNaN(Number(hours))) {
        throw new Error(`Error reading time parameter: make sure to insert a number`)
    }
    if (Number.isNaN(Number(proportion))) {
        throw new Error(`Error reading proportion parameter: make sure to insert a number`)
    }
}

export const CheckProportion = (proportion: number): number => {
    return proportion >= 0 && proportion <= 10000 ? Math.round(proportion) : 10000
}

export const CheckWorkspace = async (workspaceName: string, ctx: Context) => {    
    if (workspaceName === 'master') {
        throw new Error(`Bad workspace name: please select a workspace different from the master; the master workspace will be part of the test anyway`)
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

    throw new Error(`Bad workspace name: make sure to select one of your account's production workspaces`)
}