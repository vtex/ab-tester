export const getWithRetriesHelper = (handler: any) => async (retries: number, ctx: ColossusContext) => {
  let error = null
  while (retries--) {
      try {
          return await handler(ctx)
      } catch (err) {
          err.response ?
              console.error(`Error ${err.response.status} on ${handler}, ${retries} retries left`) :
              console.error(`Error on ${handler}, ${retries} retries left`)
          error = err
      }
  }
  throw error
}