# Codezero Zero Trust Extension for Netlify

An extension that lets you use connect to your [Codezero](https://codezero.io) Teamspace.

After installing the extension, you'll need to configure it:

1. In the Netlify app, navigate to the site you want to give access to your Codezero Teamspace
2. Under _Extensions_, click on _Codezero Zero Trust Extension_
3. Copy your Organization ID and Organization API Key from the [Codezero Hub](https://hub.codezero.io/api-keys)
4. Select the Teamspace and click on _Save_
5. In your code add the NPM package `@c6o/codezero-agent`

After the deployment, you can now make requests in your Netlify Function to your Teamspace like this:

```js
import fetch from "node-fetch";
import { CodezeroAgent } from "@c6o/codezero-agent";

const agent = new CodezeroAgent();
const response = await fetch("http://my-service.namespace/path", { agent });)
```

## Example

A full example of a Netlify Function that forwards calls to `http://my-service.namespace/path` is below:

```js
import fetch from 'node-fetch'
import { CodezeroAgent } from '@c6o/codezero-agent';

const agent = new CodezeroAgent();

const api = async (request, context) => {
    const response = await fetch('http://my-service.namespace/path', { agent });

    if (!response.ok) {
        return new Response('Failed to fetch data', {
            status: response.status,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    return new Response(await response.text(), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export const config = {};

export default api;
```
