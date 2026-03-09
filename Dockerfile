FROM node:20-slim

WORKDIR /app

# Install form-api deps
COPY form-api/package.json form-api/package-lock.json form-api/
RUN cd form-api && npm ci --omit=dev && npm cache clean --force

# Copy server and form-api source
COPY wiki-serve.js ./
COPY form-api/server.js form-api/server.js

# Non-root user
RUN groupadd -g 1001 wiki && useradd -u 1001 -g wiki -s /bin/sh wiki
RUN mkdir -p /app/.retype /app/form-api /app/data && chown -R wiki:wiki /app
USER wiki

EXPOSE 5175 3737

CMD sh -c "node wiki-serve.js 5175 & node form-api/server.js & wait"
