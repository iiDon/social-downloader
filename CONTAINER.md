# Container deployment

Build: `docker build -t social-downloader:VERSION .`

No app-specific build arguments or runtime credentials. Probe: `/manifest.json`.
No ffmpeg, yt-dlp or external process dependency exists in the current app.
Public assets are copied after build so generated PWA workers can be included.
Verify `/manifest.json`, icons, service-worker registration and the existing
client download flows in addition to HTTP readiness. The production build uses Next 15's Webpack default because next-pwa hooks
into Webpack; Turbopack skips that hook and generates no worker. Development
still uses Turbopack. Confirm `public/sw.js` and `public/workbox-*.js` exist
after the build, and verify them through the running container.

The image uses pinned official Node 22 / Debian 13 build and distroless Node 22
nonroot runtime images. pnpm 10.24.0 installs the existing frozen lockfile with
build dependencies. No migration or seed command runs during build or startup.
The runner starts the generated Next standalone `server.js` in `/app`, uses
UID/GID 65532, listens on `0.0.0.0:${PORT:-3000}`, and includes explicit copies of
both `.next/static` and `public` from the builder. `.next/cache` is writable.

Build on Linux with Docker/BuildKit; outbound npm and Google Fonts access is
required. Supply runtime credentials through the deployment environment only.
Do not place production environment files in the build context or use secret
build arguments. Deployment tooling must honor the image's JSON healthcheck:
there is no shell, curl, package manager, or Prisma CLI in the final image.

The healthcheck sends HEAD to an existing static URL and requires HTTP 200; it
proves the server and packaged assets are available, not database readiness.
Before cutover, additionally test the home page and its CSS/fonts/images, app
login/reads where applicable, actual native modules in the Linux runner,
nonroot permissions, and graceful SIGTERM. Preserve the previous image digest,
configuration and any data-volume backup for rollback before changing a service.

Base-image provenance: index digests were fetched from the official Docker Hub
`library/node:22-trixie-slim` and `gcr.io/distroless/nodejs22-debian13:nonroot`
registries on 2026-09-29. See the [official Node image](https://hub.docker.com/_/node)
and [distroless Node documentation](https://github.com/GoogleContainerTools/distroless/tree/main/nodejs).

## Verification record — 2026-09-29

Frozen install, compilation, lint/type validation and prerendering passed. The original Turbopack build skipped the PWA hook and produced no worker. The production Webpack build now generates public/sw.js and public/workbox-e9849328.js. Both build paths hit Windows EPERM symlink errors at standalone finalization, so a complete Linux image build is still required. Existing lint warnings are unrelated to these changes.

Local checks used Windows Node 24.20.0 and pnpm 10.24.0, not the target Linux
Node 22.23.3 builder. Host module resolution can fall back to the clone's
node_modules; these checks do not prove isolated runtime dependency completeness.
The actual Docker healthcheck expression passed HTTP 200 and failure cases
(redirect, authentication, missing route, server error, refused connection);
the shared request timeout also passed. Native ABI, distroless shared libraries,
nonroot ownership, Linux standalone completeness and production environment
configuration still require isolated image verification before deployment.
