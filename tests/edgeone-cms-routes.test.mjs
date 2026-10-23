import test from 'node:test';
import assert from 'node:assert/strict';
import {createCms,createMemoryStore} from '../src/server/live-cms.mjs';
import {overlayPublicDynamic} from '../src/server/live-dynamic-feed.mjs';
import {issueSession,SESSION_COOKIE} from '../src/server/auth.mjs';
import {onRequest as capabilities} from '../cloud-functions/api/firefly/capabilities.js';
import {onRequest as content} from '../cloud-functions/api/firefly/content.js';
import {onRequest as legacy} from '../cloud-functions/api/live-content.js';
import {onRequest as adminIndex} from '../cloud-functions/api/admin-content-index.json.js';
import {onRequest as adminPrivate} from '../cloud-functions/api/admin/private-index.js';
import {onRequest as preview} from '../cloud-functions/api/firefly/preview.js';
import {onRequest as settings} from '../cloud-functions/api/firefly/settings.js';
import {onRequest as gallery} from '../cloud-functions/api/firefly/gallery.js';
import {onRequest as backup} from '../cloud-functions/api/firefly/backup.js';
const origin='https://preview.edgeone.cool';
const env={FIREFLY_ADMIN_SESSION_KEY:'test-session-key-'.repeat(4),
 FIREFLY_ENABLE_WRITES:'1',FIREFLY_SERIALIZED_WRITES_ACK:'1'};
const cookie=SESSION_COOKIE+'='+issueSession(env.FIREFLY_ADMIN_SESSION_KEY);
function req(path,method='GET',authenticated=false,extra={}){
 return new Request(origin+path,{
  method,headers:{...(authenticated?{cookie}:{}),
   ...(method!=='GET'?{origin,'x-firefly-cms':'1'}:{}),...extra},
  .¶»§q«^