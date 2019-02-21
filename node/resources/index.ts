import { ColossusContext } from 'colossus'
import VBase from '../vbase'

export class Resources {
    public vbase: VBase

    constructor(ctx: ColossusContext) {
        this.vbase = new VBase(ctx.vtex)
    }
}