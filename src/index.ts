// Documentation: https://sdk.netlify.com/docs
import { NetlifyExtension } from "@netlify/sdk";

const extension = new NetlifyExtension();

extension.addFunctions("./src/functions", {
  prefix: "lm0he2wq-codezero-extension",
  shouldInjectFunction: ({ name }) => {
    return !!process.env.CZ_SPACE_ID;
  },
});

export { extension };

