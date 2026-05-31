#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# Brick API — build & push to AWS ECR
#
# Usage:
#   ./push-ecr.sh                 # build + push latest
#   ./push-ecr.sh --build-only    # only build, skip push
#
# Requirements:
#   brew install awscli
#   aws configure   (or export AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY)
# ─────────────────────────────────────────────────────────────
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-southeast-2}"
APP_NAME="brick-api"
BUILD_ONLY=false

for arg in "$@"; do [[ "$arg" == "--build-only" ]] && BUILD_ONLY=true; done

echo "🔍  Fetching AWS account ID..."
AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_REPO="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}"

echo "📦  Building image: ${APP_NAME}:latest (linux/amd64)..."
docker build --platform linux/amd64 -t "${APP_NAME}:latest" .

if $BUILD_ONLY; then
  echo "✅  Build complete (push skipped)."
  exit 0
fi

echo "🏗️   Ensuring ECR repository exists..."
aws ecr describe-repositories --repository-names "$APP_NAME" \
    --region "$AWS_REGION" --output text &>/dev/null \
  || aws ecr create-repository --repository-name "$APP_NAME" \
       --region "$AWS_REGION" \
       --image-scanning-configuration scanOnPush=true \
       --output text

echo "🔑  Logging in to ECR..."
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin \
      "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "🏷️   Tagging & pushing..."
docker tag "${APP_NAME}:latest" "${ECR_REPO}:latest"
docker push "${ECR_REPO}:latest"

echo ""
echo "✅  Done!"
echo "   Image: ${ECR_REPO}:latest"
