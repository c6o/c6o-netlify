# Connect your site to your Codezero Teamspace

Make requests to your Codezero Teamspace via the Codezero Zero Trust tunnel.

```js
import fetch from "node-fetch";
import { CodezeroAgent } from "@c6o/codezero-agent";

const agent = new CodezeroAgent();
const response = await fetch("http://my-service.namespace/path", { agent });
```

## Installation

To get started, install the extension by selecting **Install** at the top of this page.

## Connect to your Teamspace

To connect your site to your Codezero Teamspace:

1. Navigate to the site you want to give access to your Codezero Teamspace
2. Under _Extensions_, click on _Codezero Zero Trust_
3. Copy your Organization ID and Organization API Key from the [Codezero Hub](https://hub.codezero.io/api-keys)
4. Select the Teamspace and click on _Save_
5. In your code add the NPM package [@c6o/codezero-agent](https://www.npmjs.com/package/@c6o/codezero-agent)

Learn more about next steps in the [Codezero Zero Trust extension docs](https://docs.codezero.io/references/netlify-extension).
