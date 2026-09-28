# syntax=docker/dockerfile:1
# Debian 13 / glibc in both stages; registry index digests verified 2026-09-29.
FROM node:22-trixie-slim@sha256:b26b04c123d9ff8ab646ceb18b9d75a1173acf64b9a401094b906d27b29338d4 AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm install --global pnpm@10.24.0

# Include development dependencies: Next, Prisma generators and native tooling
# are build inputs. Existing lifecycle allowlists remain authoritative.
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false
COPY . .

# Build only; do not add database migration or seed commands here.
RUN pnpm build
# Writable cache, copied with the same UID/GID as the nonroot runner.
RUN mkdir -p .next/standalone/.next/cache

FROM gcr.io/distroless/nodejs22-debian13:nonroot@sha256:5ef534d3db0ac0c43bee379af4ae49cfbfc0ef38a46c94c52d87c68f32f34d8a AS runner
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
