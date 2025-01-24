// Documentation: https://sdk.netlify.com/docs

import { Config} from "@netlify/functions";

export default async () => {
  return new Response("Hello, world!");
};


export const config: Config = {
  path: "/hello",
};
