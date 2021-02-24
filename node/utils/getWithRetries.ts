export const getWithRetriesHelper = (handler: any) => async (retries: number, ctx: Context) => {
  let error = null
  while (retries--) {
      try {
          return await handler(ctx)
      } catch (err) {
          err.response ?
              ctx.vtex.logger.error(`Error ${err.response.status} on ${handler}, ${retries} retries left`) :
              ctx.vtex.logger.error(`Error on ${handler}, ${retries} retries left`)
          error = err
      }
  }
  throw error
}