#!/bin/bash
source "$NVM_DIR/nvm.sh"
nvm use 24

__dirname=$(dirname "$0")
echo "__dirname: $__dirname"

__ROOT_DIR=$__dirname/..

node $__ROOT_DIR/scripts/i18n/flatten-json.cjs
node $__ROOT_DIR/scripts/i18n/unflatten-json.cjs
