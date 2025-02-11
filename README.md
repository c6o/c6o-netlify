# Codezero Zero Trust Extension for Netlify

An extension that lets you use connect to your [Codezero](https://codezero.io) Teamspace.

After installing the extension, you'll need to configure it:

1. In the Netlify app, navigate to the site you want to give access to your Codezero Teamspace
2. Under _Extensions_, click on _Codezero Zero Trust Extension_
3. Copy your Organization ID and Organization API Key from the [Codezero Hub](https://hub.codezero.io/api-keys)
4. Select the Teamspace and click on _Save_
5. Trigger a new production deploy of your site

After the deployment, you can now make requests to your Teamspace like this:

```js
const response = await fetch('/.netlify/functions/codezero_proxy', {
    headers: { 'x-c6o-target': 'http://service-a.namespace:8080' }
})
```
