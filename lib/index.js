const ncl = require('./login.js');

module.exports = (user, pass, email, registry, scope, quotes, configPath) => {
  const finalArgs = ncl.processArguments(user, pass, email, registry, scope, quotes, configPath);
  let response;
  let contents;
  let newContents;

  ncl.login(finalArgs, (err, data) => {
    if (err) {
      throw new Error(err);
    } else {
      response = data;
      ncl.readFile(finalArgs, (nclerr, ncldata) => {
        if (nclerr) {
          throw new Error(nclerr);
        } else {
          contents = ncldata;
          newContents = ncl.generateFileContents(finalArgs, contents, response);
          ncl.writeFile(finalArgs, newContents);
        }
      });
    }
  });
};
