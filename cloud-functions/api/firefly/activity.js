import {createEdgeOneStore} from '../../../src/server/edgeone-store.mjs';
import {buildHandler} from '../../../src/server/http.mjs';
export async function onRequest({request,env={}}) {
  return buildHandler(await createEdgeOneStore({env}),{writesEnabled:false})(request);
}
