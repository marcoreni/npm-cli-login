const RegClient = require('npm-registry-client');
const os = require('os');

const client = new RegClient({});
const fs = require('fs');
const path = require('path');

module.exports = {
  processArguments(npmUser, npmPass, npmEmail, npmRegistry, npmScope, quotes, configPath) {
    const registry = npmRegistry || 'https://registry.npmjs.org';
    const homePath = os.homedir();
    const finalPath = configPath || path.join(homePath, '.npmrc');

    const hasQuotes = quotes || false;

    return {
      user: npmUser,
      pass: npmPass,
      email: npmEmail,
      registry,
      scope: npmScope,
      quotes: hasQuotes,
      configPath: finalPath,
    };
  },

  login(args, callback) {
    client.adduser(args.registry, {
      auth: {
        username: args.user,
        password: args.pass,
        email: args.email,
      },
    }, (err, data) => {
      if (err) {
        return callback(err);
      }
      return callback(null, data);
    });
  },

  readFile(args, callback) {
    fs.readFile(args.configPath, 'utf-8', (err, contents) => callback(null, err ? '' : contents));
  },

  generateFileContents(args, contents, response) {
    let registryString = `${args.registry.slice(args.registry.search(/:\/\//, '') + 1)}`; // eg. `//registry.npmjs.org`
    if (!registryString.endsWith('/')) {
      registryString = `${registryString}/`; // eg. `//registry.npmjs.org/`
    }
    registryString = `${registryString}:_authToken=`; // eg. `//registry.npmjs.org/:_authToken=`

    // `contents` holds the initial content of the NPMRC file
    // Convert the file contents into an array
    const lines = contents ? contents.split('\n') : [];

    if (typeof args.scope !== 'undefined') {
      const scopeWrite = lines.findIndex(element => element.indexOf(`${args.scope}:registry=${args.registry}`) !== -1);

      if (scopeWrite === -1) {
        // If no entry for the scope is found, add one
        lines.push(`${args.scope}:registry=${args.registry}`);
      } else {
        // else replace the entry for the scope
        lines[scopeWrite] = `${args.scope}:registry=${args.registry}`;
      }
    }

    const authWrite = lines.findIndex(element => element.indexOf(registryString) !== -1);

    const tokenString = `${args.quotes ? '"' : ''}${response.token}${args.quotes ? '"' : ''}`;

    // If no entry for the auth token is found, add one
    if (authWrite === -1) {
      lines.push(`${registryString}${tokenString}`);
    } else {
      lines[authWrite] = lines[authWrite].replace(/authToken=.*/, `authToken=${tokenString}`);
    }

    const toWrite = lines.filter(element => element !== '');

    return toWrite;
  },

  writeFile(args, lines) {
    fs.writeFile(args.configPath, `${lines.join('\n')}\n`);
  },
};
