#!/bin/bash

# Exit on any error
set -e

echo "Installing dependencies..."
npm install

echo "Building NestJS application..."
npx @nestjs/cli build

echo "Build completed successfully!" 