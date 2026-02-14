# Cloud Run deployment

This project runs as a Node.js service on Cloud Run. The server serves static files and API endpoints from one container.

## Required environment variables

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `GALLERY_ROOT_FOLDER` (example: `expressbanners/gallery`)
- `SERVICES_ROOT_FOLDER` (example: `expressbanners/services`)
- `GALLERY_CACHE_TTL_SECONDS` (example: `3600`)

## Deploy with source

```bash
gcloud run deploy <service> \
  --source . \
  --region <region> \
  --allow-unauthenticated \
  --set-env-vars CLOUDINARY_CLOUD_NAME=<value>,CLOUDINARY_API_KEY=<value>,CLOUDINARY_API_SECRET=<value>,GALLERY_ROOT_FOLDER=expressbanners/gallery,SERVICES_ROOT_FOLDER=expressbanners/services,GALLERY_CACHE_TTL_SECONDS=3600
```

## Deploy with Docker image

```bash
docker build -t <image> .
gcloud run deploy <service> \
  --image <image> \
  --region <region> \
  --allow-unauthenticated \
  --set-env-vars CLOUDINARY_CLOUD_NAME=<value>,CLOUDINARY_API_KEY=<value>,CLOUDINARY_API_SECRET=<value>,GALLERY_ROOT_FOLDER=expressbanners/gallery,SERVICES_ROOT_FOLDER=expressbanners/services,GALLERY_CACHE_TTL_SECONDS=3600
```

## Test locally with Docker

```bash
docker build -t expressbanners-local .
docker run --rm -e PORT=8080 -p 8080:8080 expressbanners-local
```

Then open `http://localhost:8080` and verify:

- `GET /healthz` returns `200 OK`
- `GET /api/gallery` and `GET /api/services-media` return data when Cloudinary env vars are set
- static routes and client-side fallback still resolve

> Cloud Run injects `PORT` at runtime. The server must always listen on `process.env.PORT`.
