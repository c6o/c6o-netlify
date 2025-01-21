import { z } from "zod";

export const teamSettingsSchema = z.object({
  userTokenSecret: z.string().min(1),
  selectedOrgId: z.string(),
  selectedSpaceId: z.string(),
});
