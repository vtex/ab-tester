import { IOContext } from '@vtex/api'
import Router from '../clients/router'
import Storedash from '../clients/storedash'
import VBase from '../clients/vbase'

export class Resources {
    public router: Router
    public storedash: Storedash
    public vbase: VBase

    constructor(ctx: IOContext) {
        this.router = new Router(ctx)
        this.storedash = new Storedash(ctx)
        this.vbase = new VBase(ctx)
    }
}