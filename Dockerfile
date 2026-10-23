# syntax=docker/dockerfile:1
# Debian 13 / glibc in both stages; registry index digests verified 2026-10-23.
FROM node:22.23.4-trixie-slim@sha256:8eb619e402eaede1748a3c8173bffab391592812e85136452f781741c7242ddf AS builder
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

FROM gcr.io/distroless/nodejs22-debian13:nonroot@sha256:b0b1352373f14fe86376d423e6d283ea6b85b912ff55ca89bed8d2fe11c257b8 AS runner
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
