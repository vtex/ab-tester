import { IOContext } from '@vtex/api'
import LoggerClient from '../clients/logger'
import Router from '../clients/router'
import Storedash from '../clients/storedash'
import VBase from '../clients/vbase'

export class Resources {
    public logger: LoggerClient
    public router: Router
    public storedash: Storedash
    public vbase: VBase

    constructor(ctx: IOContext) {
        this.logger = new LoggerClient(ctx, {})
        this.router = new Router(ctx)
        this.storedash = new Storedash(ctx)
        this.vbase = new VBase(ctx)
    }
}