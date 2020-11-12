
# Cloudflare Basic Auth to CF Access Headers

This worker will allow you to integrate 
cloudflare access based applications in environments where you can't 
pass custom headers. It allows you to pass in Query paramaters or Basic auth headers instead.

#### Why?
I developed this for use with the NZB360 Android application. 
The app doesn't let you pass in custom headers... but it does let you pass Basic Auth headers.
It can be used for other purposes.

#### Wrangler

Deploy with Wrangler or just copy the index.js file to your worker.
```
wrangler publish
```

#### Architecture
The worker should listen on the following additional routes:
`
*-auth.yourdomain.com
`
Next... setup 2 Domains/DNS records ex:
```
A radarr.yourdomain.com
A radarr-auth.yourdomain.com
```
First one ( radarr.yourdomain.com ) is protected by CF access. 
You should configure access via an Access Service Token.

Second one will be intercepted by this worker, accept Basic Auth/query paramaters, and proxy it to the first domain.
