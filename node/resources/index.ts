import { Events, IOContext } from '@vtex/api'
import VBase from '../clients/vbase'

export class Resources {
    public events: Events
    public vbase: VBase

    constructor(ctx: IOContext) {
        this.events = new Events(ctx, { metrics }),
        this.vbase = new VBase(ctx)
    }
}