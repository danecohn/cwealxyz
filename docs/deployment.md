# Railway deployment

- Repository: https://github.com/danecohn/cwealxyz
- Branch: `main`
- Railway project: `Commonweal`
- Project ID: `552a15ea-614a-4b3f-b420-321f94f499c8`
- Production environment: `c33e4b5b-40ae-4493-964a-483bc2643dd1`
- Custom domain: `cweal.xyz`

Deployment uses the repository Dockerfile and `/health` endpoint. No secrets, external runtime dependencies, or persistent storage are required. The public site serves a checked-in snapshot of the Commonweal founding documents; it is not an AI administrative runtime.

Service and domain verification details are recorded below after provisioning.

## Provisioned service

- Service ID: `f10cf009-ef32-4df6-b45f-23dd0cbb1306`
- Public Railway URL: https://cwealxyz-production.up.railway.app
- Custom domain ID: `3703c8a8-88d5-4660-9a5f-614c88de7001`
- Container target port: `8080`
- First production deployment: `3e2fb5b9-0cf8-4bb7-b55c-f99ab109c609` — successful on 28 October 2026.
- Production healthcheck returned `{"status":"ok","service":"commonweal-hub"}`.

## DNS at Porkbun

These values were returned by Railway for this service. The custom domain was awaiting DNS/ownership verification when this record was written.

| Type | Host | Required value |
| --- | --- | --- |
| CNAME | `@` (root) | `0z8lnu1n.up.railway.app` |
| TXT | `_railway-verify` | `railway-verify=e1ab88fba742e4fc9b7996a0456b3191372fb6a34a73ded6113f58b1394c53aa` |

Porkbun may represent a flattened apex CNAME as ALIAS; use its root-domain alias/CNAME facility. Existing parking records at the root must not conflict with the Railway target. Preserve unrelated mail records and other subdomains. Verify the ownership TXT record and Railway certificate before treating https://cweal.xyz as live.
