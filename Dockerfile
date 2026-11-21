# syntax=docker/dockerfile:1
# Debian 13 / glibc in both stages; registry index digests verified 2026-11-21.
FROM node:22-trixie-slim@sha256:68c76cfad89921b927eae28ba21407475e29d0ce450afcdbe70c1532db042b64 AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm install --global pnpm@10.34.9

# Include development dependencies: Next, Prisma generators and native tooling
# are build inputs. Existing lifecycle allowlists remain authoritative.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false
COPY . .

# Build only; do not add database migration or seed commands here.
RUN pnpm build
# Writable cache, copied with the same UID/GID as the nonroot runner.
RUN mkdir -p .next/standalone/.next/cache

FROM gcr.io/distroless/nodejs22-debian13:nonroot@sha256:39c66687298417dbf3ff2fb8b6012c20554494e16414ef7afd07b9abbb45b501 AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=builder --chown=65532:65532 /app/.next/standalone ./
COPY --from=builder --chown=65532:65532 /app/.next/static ./.next/static
# Copy after the build to retain generated public assets (including PWA files).
COPY --from=builder --chown=65532:65532 /app/public ./public

USER 65532:65532
EXPOSE 3000
# Existing static route bypasses auth/locale middleware and performs no writes.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD ["/nodejs/bin/node", "-e", "const r=require('node:http').request({hostname:'127.0.0.1',port:process.env.PORT||3000,path:'/manifest.json',method:'HEAD'},s=>{s.resume();process.exit(s.statusCode===200?0:1)});r.setTimeout(3000,()=>{r.destroy();process.exit(1)});r.on('error',()=>process.exit(1));r.end()"]
CMD ["server.js"]
