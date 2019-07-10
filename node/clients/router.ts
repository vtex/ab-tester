import { InfraClient, InstanceOptions, IOContext } from '@vtex/api'
import { TSMap } from 'typescript-map'

const routes = {
    Parameters: (account: string) => `/${account}/_abtest/parameters`,
    Workspaces: (account: string) => `/${account}/_abtest/workspaces`,
}

export default class Router extends InfraClient {
    constructor(ctx: IOContext, options?: InstanceOptions) {
        super('router', ctx, options, true)
    }

    public getWorkspaces = async (account: string): Promise<ABTestWorkspacesMetadata> => {
        return this.http.get<ABTestWorkspacesMetadata>(routes.Workspaces(account), { metric: 'abtest-get' })
    }

    public setWorkspaces = (account: string, metadata: Partial<ABTestWorkspacesMetadata>) => {
        return this.http.put(routes.Workspaces(account), metadata, { metric: 'abtest-set-workspaces' })
    }
    public setParameters = (account: string, metadata: Partial<ABTestParametersMetadata>) => {
        return this.http.put(routes.Parameters(account), metadata, { metric: 'abtest-set-parameters' })
    }

    public deleteWorkspaces = (account: string) => {
        return this.http.delete(routes.Workspaces(account), { metric: 'abtest-delete-workspaces' })
    }
    public deleteParameters = (account: string) => {
        return this.http.delete(routes.Parameters(account), { metric: 'abtest-delete-parameters' })
    }
}

interface ABTestParametersMetadata {
    Id: string
    Workspaces: TSMap<string, Workspace>
}