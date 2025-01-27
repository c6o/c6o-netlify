// Documentation: https://sdk.netlify.com/docs
import { Config } from "@netlify/functions";
import { teamSettingsSchema } from "../schema/team-configuration.js";


export default async (_, context) => {
  const { teamId, config } = context;

  const teamConfig = config.getTeamConfiguration(teamId)
  const result = teamSettingsSchema.safeParse(teamConfig.config);

  return new Response ("Hello world" + JSON.stringify(result.data)) 
  //return new Response("Hello, world!");
};


export const config: Config = {
  path: "/hello",
};
