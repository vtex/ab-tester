import { IOContext } from '@vtex/api'
import VBase from '../clients/vbase'

export class Resources {
    public vbase: VBase

    constructor(ctx: IOContext) {
        this.vbase = new VBase(ctx)
    }
}