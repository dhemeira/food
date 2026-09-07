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

interface Claims {
  uid: string;
  email: string;
}

interface FirestoreValue {
  stringValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
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

async function verifyIdToken(env: Env, authorization: string | null): Promise<Claims> {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new HttpError(401, 'Missing bearer token');
  }

  const token = authorization.slice('Bearer '.length);

  let payload: { sub?: string; email?: unknown };

  try {
    const result = await jwtVerify(token, jwks, {
      issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
      audience: env.FIREBASE_PROJECT_ID,
    });
    payload = result.payload;
  } catch {
    throw new HttpError(401, 'Invalid token');
  }

  if (typeof payload.sub !== 'string' || typeof payload.email !== 'string' || payload.email === '') {
    throw new HttpError(401, 'Invalid token');
  }

  return { uid: payload.sub, email: payload.email.toLowerCase() };
}

function extractStringArray(field: FirestoreValue | undefined): string[] {
  const values = field?.arrayValue?.values ?? [];
  const result: string[] = [];

  for (const item of values) {
    if (typeof item?.stringValue === 'string') {
      result.push(item.stringValue.toLowerCase());
    }
  }

  return result;
}

async function assertFamilyMember(env: Env, token: string, email: string): Promise<void> {
  const configUrl =
    `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}` +
    '/databases/(default)/documents/settings/config';

  const response = await fetch(configUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) {
    throw new HttpError(403, 'Not a family member');
  }

  if (!response.ok) {
    throw new HttpError(503, 'Membership check unavailable');
  }

  const doc = (await response.json()) as { fields?: Record<string, FirestoreValue> };
  const allowedEmails = extractStringArray(doc.fields?.allowedEmails);

  if (!allowedEmails.includes(email)) {
    throw new HttpError(403, 'Not a family member');
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

    const authorization = request.headers.get('Authorization');

    try {
      const claims = await verifyIdToken(env, authorization);
      await assertFamilyMember(env, authorization!.slice('Bearer '.length), claims.email);

      if (request.method === 'POST') {
        const result = await handleUpload(request, env, recipeId);
        return cors(json(result, 201));
      }

      if (request.method === 'DELETE') {
        await env.IMAGES.delete(objectKey(recipeId));
        return cors(json({ status: 'deleted' }));
      }
    } catch (error) {
      if (error instanceof HttpError) {
        return cors(json({ error: error.message }, error.status));
      }
      return cors(json({ error: 'Request failed' }, 500));
    }

    return cors(json({ error: 'Method not allowed' }, 405));
  },
} satisfies ExportedHandler<Env>;
