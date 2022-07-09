export interface JSONRequestInit extends RequestInit {
  body?: any | null
}

export class JSONRequest extends Request {
  public constructor(
    input: RequestInfo,
    { body = null, ...init}: JSONRequestInit = {}
  ) {
    super(input, { body: JSON.stringify(body), ...init })
    this.headers.set('Content-Type', 'text/json')
  }
}

function fetchJSON(
  input: URL | Request | string,
  { body = null, ...init }: JSONRequestInit = {}
): Promise<Response> {
  let request: Request

  if (input instanceof Request) {
    request = input
  } else if (body && typeof body === 'object' && !(
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
  )) {
    request = new JSONRequest(input.toString(), { body, ...init })
  } else {
    request = new Request(input.toString(), { body, ...init })
  }

  return fetch(request)
}

export { fetchJSON as fetch }
