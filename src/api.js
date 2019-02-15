import request from "./request.js";

import auth from "./endpoints/auth.js";
import files from "./endpoints/files.js";
import pages from "./endpoints/pages.js";
import roles from "./endpoints/roles.js";
import system from "./endpoints/system.js";
import site from "./endpoints/site.js";
import translations from "./endpoints/translations.js";
import users from "./endpoints/users.js";

export default {
  config: {
    endpoint: null,
    csrf: null,
    onStart() {},
    onComplete() {},
    onRequest: options => options,
    onSuccess() {},
    onError(error) {
      window.console.log(error.message);
      throw error;
    }
  },
  auth: auth,
  files: files,
  pages: pages,
  roles: roles,
  system: system,
  site: site,
  translations: translations,
  users: users,
  ...request
};
