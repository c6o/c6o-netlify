// Documentation: https://sdk.netlify.com/docs
import { NetlifyExtension } from "@netlify/sdk";


const extension = new NetlifyExtension();

extension.addFunctions("./src/functions", {
  prefix: "my_unique_prefix",
  shouldInjectFunction: () => {
    // If the function is not enabled, return early
    if (!process.env["C6O_NETLIFY_ENABLED"]) {
      return;
    }
    return true;
  },
});

export { extension };

