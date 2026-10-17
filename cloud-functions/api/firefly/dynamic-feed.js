/** Wire dynamicConfig.apiUrl to /api/firefly/dynamic-feed AFTER importing records.
 * Avoid /api/dynamic.json: upstream Astro emits that static asset, which has
 * routing precedence over Makers Functions.
 */
import {createEdgeOneStore} from '../../../src/server/edgeone-store.mjs';
import {buildHandler} from '../../../src/server/http.mjs';
export async function onRequest({request,env={}}) {
  return buildHandler(await createEdgeOneStore({env}),{writesEnabled:false})(request);
}
