// Documentation: https://sdk.netlify.com/docs
import { NetlifyExtension } from "@netlify/sdk";


const extension = new NetlifyExtension();

extension.addFunctions("./src/functions", {
  prefix: "lm0he2wq-codezero-extension",
  shouldInjectFunction: (x, y, z) => {
    console.log("NSX should", x, y, z)
    // If the function is not enabled, return early
    //if (!process.env["C6O_NETLIFY_ENABLED"]) {
    //  return;
    //}
    return true;
  },
});

extension.addBuildEventHandler('onPreBuild', async (x, y, z) => {
  console.log("NSX", x, y, z)
});

export { extension };

