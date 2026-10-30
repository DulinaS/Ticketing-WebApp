# EventSphere – TODO

## 1. Repo cleanup
- [x] Remove hardcoded Stripe secret key from payments tests (use Stripe mock)
- [x] Stop tracking `node_modules`
- [x] Fix GitHub Actions trigger syntax so test workflows run
- [ ] Roll the Stripe test secret key in the Stripe dashboard (old key is in git history)
- [x] Untrack `.env` on `migration/kafka`

## 2. Finish the Kafka migration
- [x] Merge `main` into `migration/kafka` (keep `node_modules` deleted)
- [x] Remove NATS from services: wrappers, old listeners/publishers, `nats-test/`, NATS server, NATS env vars
- [x] Publish events with a partition key (ticket id, or order id for expiration/payment events)
- [x] Use `fromBeginning: true` so events published before a consumer group exists aren't lost
- [x] Add Kafka to the Kubernetes manifests (`infra/k8s/kafka-depl.yaml`)
- [ ] Remove NATS from `common` (`base-listener`, `base-publisher`, `node-nats-streaming`) and publish a new version
- [ ] Optional: drop the `Kafka` suffix from listener/publisher class and file names
- [ ] Merge into `main`

## 3. Payment & order bugs
- [ ] Prevent paying for the same order twice
- [ ] Block cancelling a completed (paid) order, or refund it
- [ ] Publish an order-updated event when an order completes so versions stay in sync
- [ ] Stop tickets listeners from acking messages that failed
- [ ] Return 500 (not 400) for unexpected errors in the common error handler

## 4. Go live on eventssphere.work
The app currently assumes the dev hostname `ticketing.dev`.
- [ ] Choose hosting (VM with docker-compose, or a managed Kubernetes cluster)
- [ ] DNS: point `eventssphere.work` (and `www`) at the server / load balancer IP
- [ ] Replace `ticketing.dev` with the domain:
  - `infra/k8s/ingress-srv.yaml` (`host:`)
  - `client/api/build-client.js` (`Host` header for server-side requests)
  - `client/next.config.mjs` (`allowedDevOrigins`)
  - `nginx.conf` on `migration/kafka` (`server_name`)
- [ ] HTTPS: cert-manager + Let's Encrypt (Kubernetes) or certbot (nginx); cookies are `secure`, so login only works over HTTPS
- [ ] Production builds: run the client with `next build && next start` instead of `next dev`
- [ ] Store secrets (JWT key, Stripe keys) as Kubernetes Secrets / server env vars, not in files
- [ ] Add the domain to Stripe account settings
- [ ] Update the README with the live URL

## 5. Features from the README
- [ ] Roles: `ADMIN`, `SELLER`, `BUYER`, `SUPPORT`
- [ ] Ticket states (DRAFT → PUBLISHED → RESERVED → SOLD → CANCELLED)
- [ ] Order `EXPIRED` state; payment states and refunds
- [ ] Notification, Audit Log and Analytics services
- [ ] Health endpoints, structured logging, correlation IDs
- [ ] Role-based dashboards, admin views, analytics UI
