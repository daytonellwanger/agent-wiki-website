# Hosting

The site is a static Next.js export served from AWS S3 + CloudFront.

## Build

```bash
npm run build
```

Produces an `out/` directory of plain HTML, CSS, and JS. No server required.

## Infrastructure

**S3** holds the files. The bucket has static website hosting enabled (index document: `index.html`). Public read access is allowed via bucket policy.

**CloudFront** sits in front of S3. The origin is the S3 *website endpoint* (not the REST endpoint) — this is important because S3's website endpoint handles extensionless paths like `/concepts/agentic-loop` by serving the corresponding `index.html`, which the REST endpoint does not do.

**ACM** provides the TLS certificate. The certificate must be provisioned in `us-east-1` regardless of where the bucket lives, because CloudFront only reads ACM certs from that region.

**DNS**: the custom domain points to the CloudFront distribution via a Route 53 A (Alias) record.

## Deploying

```bash
npm run build
aws s3 sync out/ s3://YOUR-BUCKET --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

The `--delete` flag removes files from S3 that no longer exist in `out/`. The invalidation clears CloudFront's cache so visitors see the new build immediately (without it, cached pages can persist for up to 24 hours).
