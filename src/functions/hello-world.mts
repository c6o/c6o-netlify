// Documentation: https://sdk.netlify.com/docs

import { Config} from "@netlify/functions";

import { trpc } from "../ui/trpc";


export default async () => {
  const teamSettingsQuery = trpc.teamSettings.query.useQuery();
  await teamSettingsQuery.isLoading
  return new Response ("Hello world" + JSON.stringify(teamSettingsQuery.data)) 
  return new Response("Hello, world!");
};


export const config: Config = {
  path: "/hello",
};
