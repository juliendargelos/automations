export interface ClientRequestInit extends RequestInit {
  body?: any | null
  json?: true | false | 'auto'
  params?: { [key: string]: any }
}

export class ClientRequest extends Request {
  public constructor(input: RequestInfo, {
    params = {},
    body = null,
    json = 'auto',
    ...init
  }: ClientRequestInit = {}) {
    if (typeof input === 'string') {
      const url = new URL(input)
      searchParams(params, url)
      input = url.toString()
    }

    if (json === true || (json && body && typeof body === 'object' && !(
      body instanceof Blob ||
      body instanceof Int8Array ||
      body instanceof Uint8Array ||
      body instanceof Int16Array ||
      body instanceof Uint16Array ||
      body instanceof Int32Array ||
      body instanceof Uint32Array ||
      body instanceof Float32Array ||
      body instanceof Float64Array ||
      body instanceof ArrayBuffer ||
      body instanceof FormData ||
      body instanceof URLSearchParams ||
      body instanceof ReadableStream
    ))) {
      body = JSON.stringify(body)
    } else {
      json = false
    }

    super(input, { body, ...init })

    json && this.headers.set('content-type', 'application/json')
  }
}

export function searchParams(
  params: { [key: string]: any },
  url: URL = new URL('http://_')
): URLSearchParams {
  for (const param in params) {
    url.searchParams.set(param, params[param])
  }

  return url.searchParams
}

async function clientFetch<
  T extends boolean = true
>(input: URL | Request | string, {
  unwrap = true as T,
  ...init
}: ClientRequestInit & { unwrap?: T } = {}): Promise<
  T extends true ? any : Response
> {
  const response = await (input instanceof Request
    ? fetch(input, init)
    : fetch(new ClientRequest(input.toString(), init))
  )

  const type = response.headers.get('content-type')

  if (unwrap && type && /^(?:application|text)\/json\b/.test(type)) {
    try {
      return await response.json()
    } catch (_) {

    }
  }

  return response
}

export { clientFetch as fetch }
