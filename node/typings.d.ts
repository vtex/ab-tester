import { Context as KoaContext } from 'koa'
import { IOContext, ErrorLog } from '@vtex/api'
import { Resources } from './resources/index'
declare global{
  export interface ColossusContext extends KoaContext {
    vtex: IOContext
    resources: Resources
  }

  export interface ABTestData {
    Id: string
    timeStart: string
  }
}