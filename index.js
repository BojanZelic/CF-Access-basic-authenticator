/**
 * RegExp for basic auth credentials
 *
 * credentials = auth-scheme 1*SP token68
 * auth-scheme = "Basic" ; case insensitive
 * token68     = 1*( ALPHA / DIGIT / "-" / "." / "_" / "~" / "+" / "/" ) *"="
 */

const CREDENTIALS_REGEXP = /^ *(?:[Bb][Aa][Ss][Ii][Cc]) +([A-Za-z0-9._~+/-]+=*) *$/

/**
 * RegExp for basic auth user/pass
 *
 * user-pass   = userid ":" password
 * userid      = *<TEXT excluding ":">
 * password    = *TEXT
 */

const USER_PASS_REGEXP = /^([^:]*):(.*)$/

/**
 * Object to represent user credentials.
 */

const Credentials = function(name, pass) {
  this.name = name
  this.pass = pass
}

/**
 * Parse basic auth to object.
 */

const parseAuthHeader = function(string) {
  if (typeof string !== 'string') {
    return undefined
  }

  // parse header
  const match = CREDENTIALS_REGEXP.exec(string)

  if (!match) {
    return undefined
  }

  // decode user pass
  const userPass = USER_PASS_REGEXP.exec(atob(match[1]))

  if (!userPass) {
    return undefined
  }

  // return credentials object
  return new Credentials(userPass[1], userPass[2])
}

const unauthorizedResponse = function(body) {
  return new Response(
    null, {
      status: 401,
      statusText: "'Authentication required.'",
      body: body,
      headers: {
        "WWW-Authenticate": 'Basic realm="User Visible Realm"'
      }
    }
  )
}

/**
 * Handle request
 */

async function handle(request) {
  let url = new URL(request.url)
  url.hostname = url.hostname.split("-auth").join('')
  request = new Request(url, request)

  const credentials = parseAuthHeader(request.headers.get("Authorization"))
  const has_query_credentials = (url.searchParams.has('cfuser') && url.searchParams.has('cfpass'))

  if (credentials) {
    request.headers.append('CF-Access-Client-ID', credentials.name)
    request.headers.append('CF-Access-Client-Secret', credentials.pass)
    return fetch(request)
  }

  if (has_query_credentials) {
    request.headers.append('CF-Access-Client-ID', url.searchParams.get('cfuser'))
    request.headers.append('CF-Access-Client-Secret', url.searchParams.get('cfpass'))
    return fetch(request)
  }

  return unauthorizedResponse("Unauthorized")
}

addEventListener('fetch', event => {
  event.respondWith(handle(event.request))
})