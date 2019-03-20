import { Workspaces } from '@vtex/api'

const DEFAULT_WORKSPACE = 'master'

const routes = {
  Account: (account: string) => `/${account}`,
  Promote: (account: string) => `${routes.Workspace(account, DEFAULT_WORKSPACE)}/_promote`,
  Workspace: (account: string, workspace: string) => `${routes.Account(account)}/${workspace}`,
}

export class ABWorkspaces extends Workspaces {
  public list = (account: string) => {
    return this.http.get<ABWorkspaceMetadata[]>(routes.Account(account), {metric: 'workspaces-list'})
  }

  public get = (account: string, workspace: string) => {
    return this.http.get<ABWorkspaceMetadata>(routes.Workspace(account, workspace), {metric: 'workspaces-get'})
  }

  public set = (account: string, workspace: string, metadata: Partial<ABWorkspaceMetadata>) => {
    return this.http.put(routes.Workspace(account, workspace), metadata, {metric: 'workspaces-set'})
  }

  public reset = (account: string, workspace: string, metadata: Partial<ABWorkspaceMetadata> = {}) => {
    const params = {reset: true}
    const metric = 'workspaces-reset'
    return this.http.put(routes.Workspace(account, workspace), metadata, {params, metric})
  }
}