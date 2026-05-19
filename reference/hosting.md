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

## GitHub Actions deploy role

The [deploy workflow](../.github/workflows/deploy.yml) authenticates to AWS via OIDC rather than long-lived access keys. It assumes an IAM role; GitHub exchanges a short-lived OIDC token for temporary AWS credentials at run time.

**Trust policy** — allows GitHub Actions to assume the role, scoped to this repo:

```json
{
  "Effect": "Allow",
  "Principal": {
    "Federated": "arn:aws:iam::YOUR-ACCOUNT-ID:oidc-provider/token.actions.githubusercontent.com"
  },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
    },
    "StringLike": {
      "token.actions.githubusercontent.com:sub": "repo:YOUR-ORG/wiki-website:*"
    }
  }
}
```

**Permission policy** — the minimum permissions the role needs:

```json
{
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR-BUCKET/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::YOUR-BUCKET"
    },
    {
      "Effect": "Allow",
      "Action": "cloudfront:CreateInvalidation",
      "Resource": "arn:aws:cloudfront::YOUR-ACCOUNT-ID:distribution/YOUR-DIST-ID"
    }
  ]
}
```

The role ARN is stored as the `AWS_ROLE_ARN` secret in the GitHub repo.

The OIDC provider (`token.actions.githubusercontent.com`) is added to IAM → Identity providers in your AWS account.

## Deploying

```bash
npm run build
aws s3 sync out/ s3://YOUR-BUCKET --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

The `--delete` flag removes files from S3 that no longer exist in `out/`. The invalidation clears CloudFront's cache so visitors see the new build immediately (without it, cached pages can persist for up to 24 hours).
