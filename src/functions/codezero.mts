import type { Config, Context } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { request } from 'https';
import { request as httpRequest } from 'http';
import { hubURL } from '../server/hub'

export const config: Config = {
  path: ['/codezero'],
};

interface SpaceCredentials {
  host: string,
  token: string,
  cert: string
}

const blobStoreKey = 'codezero-teampsace-config'

const getSpaceCredentials = async () => {
  // Get the store for space credentials
  const store = getStore(blobStoreKey)
  
  // Try to get existing credentials
  const existingCreds = await store.get('current', { type: 'json' }) as SpaceCredentials | null
  
  if (existingCreds)
    return existingCreds

  // If no credentials exist, fetch new ones
  const spaceResponse = await fetch(`${hubURL}/api/c6o/connect/c6oapi.v1.C6OService/GetSpaceConnection`, {
    method: 'POST',
    headers: {
      'Authorization': `${process.env.CZ_ORG_ID}:${process.env.CZ_ORG_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      spaceId: process.env.CZ_SPACE_ID
    }),
  })
  const credentials = await spaceResponse.json() as SpaceCredentials
  // Fix certificate formatting
  credentials.cert = credentials.cert.replace(/\\r\\n/g, '\n')
  
  // Store the credentials
  await store.setJSON('current', credentials)
  
  return credentials
}

export default async (req: Request, context: Context): Promise<Response> => {
  console.log('Received request for', req.url)

  const spaceCredentials = await getSpaceCredentials();

  const target = req.headers.get('x-c6o-target')
  console.log('Received target', target)
  if (!target)
    return new Response(undefined, {
      status: 400,
      statusText: 'Missing required x-c6o-target header'
    }) 
  const targetURL = new URL(target)
  console.log('Proxy is', spaceCredentials.host)
  console.log('Target is', targetURL)

  return new Promise((resolve) => {
    const proxyOptions = {
      hostname: spaceCredentials.host,
      port: 8800,
      method: 'CONNECT',
      // ca: spaceCredentials.cert,
      rejectUnauthorized: false,
      path: targetURL.host, // Add default port
      headers: {
        'Proxy-Authorization': spaceCredentials.token,
        'x-c6o-variant': '',
      },
    }
    console.log('Using proxy', proxyOptions)
    const proxyReq = request(proxyOptions)

    proxyReq.on('connect', (res, socket, head) => {
      console.log('HTTP CONNECT successful with status:', res.statusCode)
      
      if (res.statusCode === 407) {
        const store = getStore(blobStoreKey)
        store.delete('current')
        return
      }

      if (res.statusCode !== 200) {
        resolve(
          new Response(
            JSON.stringify({
              message: 'Failed to establish proxy connection',
              statusCode: res.statusCode,
            }),
            { status: res.statusCode || 502, headers: { 'Content-Type': 'application/json' } }
          )
        )
        return
      }

      console.log('Proxy connection established. Sending request to target server...')

      // Use the existing socket to send the HTTP request to the target server
      const targetOptions = {
        createConnection: () => socket,
        method: req.method,
        headers: {
          ...Object.fromEntries(req.headers),
          host: targetURL.hostname // Ensure host header is set correctly
        },
        hostname: targetURL.hostname,
        port: targetURL.port || '80',
        path: targetURL.pathname + targetURL.search, // Include query parameters
      }

      const targetReq = httpRequest(targetOptions, (targetRes) => {
        let data = ''

        console.log('Received response from target server:', {
          statusCode: targetRes.statusCode,
          headers: targetRes.headers,
        })

        targetRes.on('data', (chunk) => {
          console.log('Receiving data chunk from target server...')
          data += chunk
        })

        targetRes.on('end', () => {
          console.log('Target server response fully received. Sending back to client.')
          resolve(
            new Response(data, {
              status: targetRes.statusCode || 200,
              headers: {
                'Content-Type': targetRes.headers['content-type'] || 'application/json',
              },
            })
          )
        })
      })

      targetReq.on('error', (err) => {
        console.error('Error during request to target server:', err.message)
        resolve(
          new Response(
            JSON.stringify({
              error: 'Request to target server failed',
              message: err.message,
            }),
            { status: 502, headers: { 'Content-Type': 'application/json' } }
          )
        )
      })

      if (req.body) {
        console.log('Piping request body to target server...')
        req.body.pipe(targetReq)
      } else {
        console.log('No request body. Ending target request...')
        targetReq.end()
      }
    })

    proxyReq.on('error', (err) => {
      console.error('Error during HTTP CONNECT:', err.message)
      resolve(
        new Response(
          JSON.stringify({
            error: 'Proxy connection failed',
            message: err.message,
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
      )
    })

    console.log('Sending HTTP CONNECT request...')
    proxyReq.end()
  })
}
