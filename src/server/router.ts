import { TRPCError } from "@trpc/server";
import { procedure, router } from "./trpc.js";
import { teamSettingsSchema, SiteSettingsSchema } from "../schema/team-configuration.js";
import type { TeamSettings, SiteSettings, ConnectSettings } from "../schema/team-configuration.js";
import { NetlifyExtensionClient, z } from "@netlify/sdk";

export const appRouter = router({
  teamSettings: {
    query: procedure.query(async ({ ctx: { teamId, client } }) => {
      if (!teamId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "teamId is required",
        });
      }
      const teamConfig = await client.getTeamConfiguration(teamId);
      if (!teamConfig) {
        return;
      }
      const result = teamSettingsSchema.safeParse(teamConfig.config);
      if (!result.success) {
        console.warn(
          "Failed to parse team settings",
          JSON.stringify(result.error, null, 2)
        );
      }
      return result.data;
    }),

    mutate: procedure
      .input(teamSettingsSchema)
      .mutation(async ({ ctx: { teamId, client }, input }) => {
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "teamId is required",
          });
        }

        try {
          const existingConfig = await client.getTeamConfiguration(teamId);
          if (!existingConfig) {
            await client.createTeamConfiguration(teamId, input);
          } else {
            await client.updateTeamConfiguration(teamId, {
              ...(existingConfig?.config || {}),
              ...input,
            });
          }
        } catch (e) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to save team configuration",
            cause: e,
          });
        }
      }),
  },


  siteSettings: {
    read: procedure.query(async ({ ctx: { teamId, siteId, client: c } }) => {
      try {
        const client = c as ShowcaseNetlifyClient;
        if (!teamId || !siteId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "teamId and siteId and required",
          });
        }
        return (await client.getSiteConfiguration(teamId, siteId))?.config;
      } catch (e) {
        throw maskInternalErrors(e as Error);
      }
    }),
    update: procedure
      .input(SiteSettingsSchema.strict())
      .mutation(async ({ ctx: { teamId, siteId, client: c }, input }) => {
        try {
          const client = c as ShowcaseNetlifyClient;
          if (!teamId || !siteId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "teamId and siteId and required",
            });
          }
          const config = (await client.getSiteConfiguration(teamId, siteId))
            ?.config;
          const newConfig = {
            ...config,
            ...input,
          };
          if (config) {
            await client.updateSiteConfiguration(teamId, siteId, newConfig);
          } else {
            await client.createSiteConfiguration(teamId, siteId, newConfig);
          }
          await client.createOrUpdateVariables({
            accountId: teamId,
            siteId,
            variables: {
              CZ_ORG_ID: newConfig.orgID,
              CZ_SPACE_ID: newConfig.spaceID,
            },
          });
          await client.createOrUpdateVariable({
            accountId: teamId,
            siteId,
            key: 'CZ_ORG_API_KEY',
            value: {
              dev: "",
              production: newConfig.orgAPIKey,
              deployPreview: newConfig.orgAPIKey,
              branchDeploys: newConfig.orgAPIKey,
            },
            scopes: ['functions', 'builds', 'runtime'],
            isSecret: true
          });
        } catch (e) {
          console.log('NSX ERROR', e)
          throw maskInternalErrors(e as Error);
        }
      }),
  },
  
});

function maskInternalErrors(e: Error) {
  if (e instanceof TRPCError) {
    return e;
  }
  return new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    cause: e,
  });
}

export type AppRouter = typeof appRouter;

export type ShowcaseNetlifyClient = NetlifyExtensionClient<
  SiteSettings,
  TeamSettings,
  ConnectSettings
>;
