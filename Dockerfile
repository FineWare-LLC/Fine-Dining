FROM node:20-alpine
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY frontend/package.json frontend/package-lock.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend .
RUN npm run build
EXPOSE 3000
CMD ["npm","start"]
