#!/bin/bash
set -e

if [ -x .env.local ]; then
  . ./.env.local
  echo "Configuration '.env.local' already exists - abborting!"
  exit 1;
fi

echo "Generating enviroment configuration to '.env.local' file..."
# This is our '.env.local' config file, we're writing it now .
cat >> .env.local <<CONFIG
AWS_ACCESS_KEY_ID=You aws access key, you can get it there https://serverless.com/framework/docs/providers/aws/guide/credentials/
AWS_SECRET_ACCESS_KEY=You aws secret, you can get it there https://serverless.com/framework/docs/providers/aws/guide/credentials/
SERVERLESS_ACCESS_KEY=Your Serverless access key, you can setup it there: https://serverless.com/framework/docs/dashboard/cicd/running-in-your-own-cicd#create-an-access-key-in-the-serverless-framework-dashboard
CONFIG

echo "Configuration written to .env.local"

# To source our .env.local file from the shell it has to be executable.
chmod +rw .env.local
