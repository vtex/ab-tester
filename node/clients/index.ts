import { IOClients } from '@vtex/api'

import Router from './router'
import Storedash from './storedash'
import VBase from './vbase'

export class Clients extends IOClients {
    public get abTestRouter(): Router {
        return this.getOrSet('router', Router)
    }

    public get storedash(): Storedash {
        return this.getOrSet('storedash', Storedash)
    }

    public get storage(): VBase {
        return this.getOrSet('storage', VBase)
    }
}