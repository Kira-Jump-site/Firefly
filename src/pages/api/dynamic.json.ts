import data from "../../data/recovered-public-dynamic.json";
export async function GET():Promise<Response>{return new Response(JSON.stringify(data),{headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"public,max-age=120"}})}
