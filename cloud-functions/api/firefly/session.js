import {sessionHandler} from '../../../src/server/auth.mjs';
export async function onRequest({request,env={}}){return sessionHandler(request,env)}
