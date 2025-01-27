// Documentation: https://sdk.netlify.com/docs
import type { Config, Context } from "@netlify/functions";


export default async (req: Request, context: Context): Promise<Response> => {
  return new Response ("Hello world<br/>" + context.url.toString() + "<br/>" + context.params.toString()) 
  //return new Response("Hello, world!");
};


export const config: Config = {
  path: "/hello",
};
