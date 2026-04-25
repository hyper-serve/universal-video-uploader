FROM oven/bun:1.3.10 AS build

WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
COPY packages/core/package.json packages/core/
COPY packages/react/package.json packages/react/
COPY packages/react-native/package.json packages/react-native/
COPY packages/upload-adapter-hyperserve/package.json packages/upload-adapter-hyperserve/
COPY packages/docs/package.json packages/docs/
COPY examples/web/package.json examples/web/
COPY examples/react-native/package.json examples/react-native/

RUN bun install --frozen-lockfile

COPY tsconfig.base.json ./
COPY packages/core/ packages/core/
COPY packages/react/ packages/react/
COPY packages/docs/ packages/docs/

RUN bun run --filter '@hyperserve/upload' build && \
    bun run --filter '@hyperserve/upload-react' build && \
    bun run --filter '@hyperserve/upload-docs' build

COPY packages/docs/nginx.conf /app/packages/docs/

FROM nginx:alpine as serve

WORKDIR /app

COPY --from=build /app/packages/docs/dist /usr/share/nginx/html
COPY --from=build /app/packages/docs/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
