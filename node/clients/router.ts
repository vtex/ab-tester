import { InfraClient, InstanceOptions, IOContext } from '@vtex/api'
import { TSMap } from 'typescript-map'
import TestingWorkspaces from '../typings/testingWorkspace'
import { concatErrorMessages } from '../utils/errorHandling'

const routes = {
    Proportions: (account: string) => `/${account}/_abtest/parameters`,
    Workspaces: (account: string) => `/${account}/_abtest/workspaces`,
}

export default class Router extends InfraClient {
    constructor(ctx: IOContext, options?: InstanceOptions) {
        super('router', ctx, options, true)
    }

    public getWorkspaces = async (account: string): Promise<TestingWorkspaces> => {
        try {
            const workspaceMetadata = await this.http.get<ABTestWorkspacesMetadata>(routes.Workspaces(account), { metric: 'abtest-get' })
            return new TestingWorkspaces(workspaceMetadata)
        } catch (err) {
            err.message = concatErrorMessages('Error getting workspaces from Router', err.message)
            throw err
        }
    }

    public setWorkspaces = async (account: string, metadata: Partial<ABTestWorkspacesMetadata>) => {
        try {
            return await this.http.put(routes.Workspaces(account), metadata, { metric: 'abtest-set-workspaces' })
        } catch (err) {
            err.message = concatErrorMessages('Error setting workspaces to Router', err.message)
            throw err
        }
    }
    public setProportions = async (account: string, metadata: Partial<ABTestMetadata>) => {
        try {
            return await this.http.put(routes.Proportions(account), metadata, { metric: 'abtest-set-parameters' })
        } catch (err) {
            err.message = concatErrorMessages('Error setting proportions to Router', err.message)
            throw err
        }
    }

    public deleteWorkspaces = async (account: string) => {
        try {
            return await this.http.delete(routes.Workspaces(account), { metric: 'abtest-delete-workspaces' })
        } catch (err) {
            err.message = concatErrorMessages('Error deleting workspaces from Router', err.message)
            throw err
        }
    }
    public deleteProportions = async (account: string) => {
        try {
            return await this.http.delete(routes.Proportions(account), { metric: 'abtest-delete-parameters' })
        } catch (err) {
            err.message = concatErrorMessages('Error deleting proportions from Router', err.message)
            throw err
        }
    }
}

interface ABTestMetadata {
    Id: string
    parameterPerWorkspace: TSMap<string, proportion>
}