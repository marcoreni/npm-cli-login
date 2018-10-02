const RegClient = require('npm-registry-client');

const client = new RegClient({});
const fs = require('fs');
const path = require('path');

module.exports = {
  processArguments(npmUser, npmPass, npmEmail, npmRegistry, npmScope, quotes, configPath) {
    const registry = npmRegistry || 'https://registry.npmjs.org';
    const homePath = process.env.HOME ? process.env.HOME : process.env.USERPROFILE;
    const finalPath = configPath || path.join(homePath, '.npmrc');
    const hasQuotes = quotes || false;
    const args = {
      user: npmUser,
      pass: npmPass,
      email: npmEmail,
      registry,
      scope: npmScope,
      quotes: hasQuotes,
      configPath: finalPath,
    };

    return args;
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
    // `contents` holds the initial content of the NPMRC file
    // Convert the file contents into an array
    const lines = contents ? contents.split('\n') : [];

    if (args.scope !== undefined) {
      const scopeWrite = lines.findIndex(element => element.indexOf(`${args.scope}:registry=${args.registry}`) !== -1);

      // If no entry for the scope is found, add one
      if (scopeWrite === -1) {
        lines.push(`${args.scope}:registry=${args.registry}`);
      } else {
        // replace the entry for the scope
        lines[scopeWrite] = `${args.scope}:registry=${args.registry}`;
      }
    }

    const authWrite = lines.findIndex(element => element.indexOf(`${args.registry.slice(args.registry.search(/:\/\//, '') + 1)}/:_authToken=`) !== -1);

    // If no entry for the auth token is found, add one
    if (authWrite === -1) {
      lines.push(`${args.registry.slice(args.registry.search(/:\/\//, '')
            + 1)}/:_authToken=${args.quotes ? '"' : ''}${response.token}${args.quotes ? '"' : ''}`);
    } else {
      lines[authWrite] = lines[authWrite].replace(/authToken=.*/, `authToken=${args.quotes ? '"' : ''}${response.token}${args.quotes ? '"' : ''}`);
    }

    const toWrite = lines.filter(element => element !== '');

    return toWrite;
  },

  writeFile(args, lines) {
    fs.writeFile(args.configPath, `${lines.join('\n')}\n`);
  },
};
