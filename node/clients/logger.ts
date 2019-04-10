import { InstanceOptions, Logger } from '@vtex/api'

const noSubject = '-'

export class LoggerClient {
  private client: Logger

  constructor(private ctx: ColossusContext, opts: InstanceOptions) {
    this.client = new Logger(ctx.vtex, opts)
  }

  public sendLog = (level: LogLevel, message: string | {}): Promise<void> => {
    const { vtex: { account, userAgent } } = this.ctx
    console.warn(`Try this query at Splunk to retrieve error log: 'index=colossus key=log_error subject=${userAgent} account=${account} workspace=${this.ctx.header['x-vtex-workspace']}'`)
    const data = (typeof message === 'string' || message instanceof String)
      ? { message }
      : message

    return this.client.sendLog(noSubject, data, level)
  }
}