// Documentation: https://sdk.netlify.com/docs
import type { Config, Context } from "@netlify/functions";


export default async (req: Request, context: Context): Promise<Response> => {
  return new Response ("Hello world\n" + context.url.toString() + "\n" + JSON.stringify(context.params)) 
  //return new Response("Hello, world!");
};


export const config: Config = {
  path: "/hello",
};
