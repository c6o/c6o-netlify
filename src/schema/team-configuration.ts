import { z } from "zod";

export const teamSettingsSchema = z.object({
  userTokenSecret: z.string().min(1),
  exampleString: z.string().min(1),
  exampleSecret: z.string().min(1),
  exampleBoolean: z.boolean(),
  exampleNumber: z.number(),
  selectedOrgId: z.string(),
  selectedSpaceId: z.string(),
});
