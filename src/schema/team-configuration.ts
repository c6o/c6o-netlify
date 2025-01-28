import { z } from "zod";

export const teamSettingsSchema = z.object({
  userTokenSecret: z.string().min(1),
  selectedOrgId: z.string(),
  selectedSpaceId: z.string(),
});

export type TeamSettings = z.infer<typeof teamSettingsSchema>;


export const SiteSettings = z.object({
  userTokenSecret: z.string().min(1),
  selectedOrgId: z.string(),
  selectedSpaceId: z.string(),

  enabled: z.boolean(),
  siteSetting: z.string(),
});
export type SiteSettings = z.infer<typeof SiteSettings>;


export const ConnectSettings = z.object({});
export type ConnectSettings = z.infer<typeof ConnectSettings>;
