import { createRemoteJWKSet, jwtVerify } from 'jose';
import sharp from '@img/sharp-wasm32/sharp.node';

export interface Env {
  IMAGES: R2Bucket;
  FIREBASE_PROJECT_ID: string;
  IMG_BASE_URL: string;
}

const CACHE_CONTROL = 'public, max-age=31536000, immutable';
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const WIDTH = 1000;
const HEIGHT = 400;

const jwks = createRemoteJWKSet(
  new URL('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com')
);

class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function objectKey(recipeId: string): string {
  return `recipes/${recipeId}.jpg`;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function cors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  return new Response(response.body, { status: response.status, headers });
}

async function verifyIdToken(env: Env, authorization: string | null): Promise<string> {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new HttpError(401, 'Missing bearer token');
  }

  const token = authorization.slice('Bearer '.length);

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
      audience: env.FIREBASE_PROJECT_ID,
    });
    if (!payload.sub) {
      throw new Error('Token missing subject');
    }
    return payload.sub;
  } catch {
    throw new HttpError(401, 'Invalid token');
  }
}

async function handleUpload(request: Request, env: Env, recipeId: string): Promise<unknown> {
  const form = await request.formData();
  const file = form.get('file');

  if (!(file instanceof File)) {
    throw new HttpError(400, 'Missing file');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new HttpError(413, 'File too large');
  }

  const input = new Uint8Array(await file.arrayBuffer());

  const output = await sharp(input)
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();

  const key = objectKey(recipeId);

  await env.IMAGES.put(key, output, {
    httpMetadata: { contentType: 'image/jpeg', cacheControl: CACHE_CONTROL },
  });

  return { url: `${env.IMG_BASE_URL}/${key}`, key };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return cors(new Response(null, { status: 204 }));
    }

    const url = new URL(request.url);

    if (!url.pathname.startsWith('/upload/')) {
      return cors(json({ error: 'Not found' }, 404));
    }

    const recipeId = decodeURIComponent(url.pathname.slice('/upload/'.length));

    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(recipeId)) {
      return cors(json({ error: 'Invalid recipe id' }, 400));
    }

    try {
      await verifyIdToken(env, request.headers.get('Authorization'));
    } catch (error) {
      if (error instanceof HttpError) {
        return cors(json({ error: error.message }, error.status));
      }
      return cors(json({ error: 'Unauthorized' }, 401));
    }

    if (request.method === 'POST') {
      try {
        const result = await handleUpload(request, env, recipeId);
        return cors(json(result, 201));
      } catch (error) {
        if (error instanceof HttpError) {
          return cors(json({ error: error.message }, error.status));
        }
        return cors(json({ error: 'Upload failed' }, 500));
      }
    }

    if (request.method === 'DELETE') {
      await env.IMAGES.delete(objectKey(recipeId));
      return cors(json({ status: 'deleted' }));
    }

    return cors(json({ error: 'Method not allowed' }, 405));
  },
} satisfies ExportedHandler<Env>;
