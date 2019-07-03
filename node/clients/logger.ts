import { InstanceOptions, IOContext, Logger, LogLevel } from '@vtex/api'

const DEFAULT_SUBJECT = '-'

export default class LoggerClient {
  private client: Logger

  constructor(ctx: IOContext, opts: InstanceOptions) {
    this.client = new Logger(ctx, opts)
  }

  public info = (message: string, data: {}): Promise<void> => {
    data = {...data, message}
    return this.client.sendLog(DEFAULT_SUBJECT, data, LogLevel.Info)
  }

  public error = (message: string | {}): Promise<void> => {
    const data = (typeof message === 'string' || message instanceof String) ? { message } : message
    return this.client.error(data)
  }
}