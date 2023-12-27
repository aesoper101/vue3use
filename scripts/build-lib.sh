#!/usr/bin/env bash

lerna run build \
  --scope @aesoper/shared \
  --scope @aesoper/logger \
  --scope @aesoper/storage
