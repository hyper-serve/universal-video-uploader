FROM node:22-slim AS build

WORKDIR /app

COPY package.json ./
COPY packages/universal-video-uploader/package.json packages/universal-video-uploader/
COPY packages/universal-video-uploader-react/package.json packages/universal-video-uploader-react/
COPY packages/universal-video-uploader-native/package.json packages/universal-video-uploader-native/
COPY packages/docs/package.json packages/docs/

RUN npm install --workspaces --include-workspace-root

COPY packages/universal-video-uploader/ packages/universal-video-uploader/
COPY packages/universal-video-uploader-react/ packages/universal-video-uploader-react/
COPY packages/universal-video-uploader-native/ packages/universal-video-uploader-native/
COPY packages/docs/ packages/docs/
COPY tsconfig.json tsconfig.base.json ./

RUN npm run build --workspace=packages/universal-video-uploader && \
    npm run build --workspace=packages/universal-video-uploader-react && \
    npm run build --workspace=packages/docs

FROM node:22-slim

RUN npm install -g serve@14

COPY --from=build /app/packages/docs/dist /srv

EXPOSE 8080

CMD ["serve", "/srv", "-l", "8080", "-s"]
