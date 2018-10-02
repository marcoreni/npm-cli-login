#!/usr/bin/env bash
set -e;

echo "eslint";
yarn eslint lib bin;

echo;

yarn jshint --version;
yarn jshint lib bin;
echo "No code lint issues found.";

mocha tests
