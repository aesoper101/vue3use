#!/usr/bin/env bash

lerna run build \
  --scope @aesoper/shared \
  --scope @aesoper/logger \
  --scope @aesoper/storage \
  --scope @aesoper/hooks \
  --scope @aesoper/i18n \
  --scope @aesoper/eventbus
