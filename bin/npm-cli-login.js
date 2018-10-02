#!/usr/bin/env node
const mainModule = require('../lib');

const getArg = (marker, isBoolean) => {
  const pos = process.argv.indexOf(marker);
  return (pos === -1) ? -1 : (isBoolean ? pos : pos + 1);
};

const login = () => {
  let found = getArg('-u', false);
  const user = (found === -1) ? process.env.NPM_USER : process.argv[found];

  found = getArg('-p', false);
  const pass = (found === -1) ? process.env.NPM_PASS : process.argv[found];

  found = getArg('-e', false);
  const email = (found === -1) ? process.env.NPM_EMAIL : process.argv[found];

  found = getArg('-r', false);
  const registry = (found === -1) ? process.env.NPM_REGISTRY : process.argv[found];

  found = getArg('-s', false);
  const scope = (found === -1) ? process.env.NPM_SCOPE : process.argv[found];

  found = getArg('--config-path', false);
  const configPath = (found === -1) ? process.env.NPM_RC_PATH : process.argv[found];

  found = getArg('--quotes', true);
  const quotes = found !== -1;

  mainModule(user, pass, email, registry, scope, quotes, configPath);
};

login();
