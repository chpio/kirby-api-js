(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global['getkirby/api-js'] = factory());
}(this, function () { 'use strict';

  var request = {
    running: 0,
    request(path, options) {
      options = Object.assign(options || {}, {
        credentials: "same-origin",
        headers: {
          "x-requested-with": "xmlhttprequest",
          "content-type": "application/json",
          ...options.headers,
        }
      });

      options = api.config.onRequest(options);

      // add the csrf token to every request if it has been set
      options.headers["x-csrf"] = api.config.csrf;

      api.config.onStart();
      this.running++;

      return fetch(api.config.endpoint + "/" + path, options)
        .then(response => {
          return response.text();
        })
        .then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            throw new Error("The JSON response from the API could not be parsed. Please check your API connection.");
          }
        })
        .then(json => {
          if (json.status && json.status === "error") {
            throw json;
          }

          let response = json;

          if (json.data && json.type && json.type === "model") {
            response = json.data;
          }

          this.running--;
          api.config.onComplete();
          api.config.onSuccess(json);
          return response;
        })
        .catch(error => {
          this.running--;
          api.config.onComplete();
          api.config.onError(error);
          throw error;
        });
    },
    get(path, query, options) {
      if (query) {
        path +=
          "?" +
          Object.keys(query)
            .map(key => key + "=" + query[key])
            .join("&");
      }

      return this.request(path, Object.assign(options || {}, { method: "GET" }));
    },
    post(path, data, options, method = "POST") {
      return this.request(
        path,
        Object.assign(options || {}, {
          method: method,
          body: JSON.stringify(data)
        })
      );
    },
    patch(path, data, options) {
      return this.post(path, data, options, "PATCH");
    },
    delete(path, data, options) {
      return this.post(path, data, options, "DELETE");
    }
  };

  var auth = {
    user() {
      return api.get("auth");
    },
    login(user) {
      let data = {
        long: user.remember || false,
        email: user.email,
        password: user.password
      };

      return api.post("auth/login", data).then(auth => {
        return auth.user;
      });
      
    },
    logout() {
      return api.post("auth/logout");
    }
  };

  var files = {
    get(parent, filename, query) {
      return api.get(this.url(parent, filename), query).then(file => {
        if (Array.isArray(file.content) === true) {
          file.content = {};
        }
        return file;
      });
    },
    update(parent, filename, data) {
      return api.patch(this.url(parent, filename), data);
    },
    rename(parent, filename, to) {
      return api.patch(this.url(parent, filename, "name"), {
        name: to
      });
    },
    url(parent, filename, path) {
      let url = parent + "/files/" + filename;

      if (path) {
        url += "/" + path;
      }

      return url;
    },
    link(parent, filename, path) {
      return "/" + this.url(parent, filename, path);
    },
    delete(parent, filename) {
      return api.delete(this.url(parent, filename));
    }
  };

  var pages = {
    create(parent, data) {
      if (parent === null || parent === "/") {
        return api.post("site/children", data);
      }

      return api.post(this.url(parent, "children"), data);
    },
    url(id, path) {
      let url = id === null ? "pages" : "pages/" + id.replace(/\//g, "+");

      if (path) {
        url += "/" + path;
      }

      return url;
    },
    link(id) {
      return "/" + this.url(id);
    },
    get(id, query) {
      return api.get(this.url(id), query).then(page => {
        if (Array.isArray(page.content) === true) {
          page.content = {};
        }
        return page;
      });
    },
    preview(id) {
      return this.get(id, { select: "previewUrl" }).then(page => {
        return page.previewUrl;
      });
    },
    update(id, data) {
      return api.patch(this.url(id), data);
    },
    children(id, query) {
      return api.post(this.url(id, "children/search"), query);
    },
    files(id, query) {
      return api.post(this.url(id, "files/search"), query);
    },
    delete(id, data) {
      return api.delete(this.url(id), data);
    },
    slug(id, slug) {
      return api.patch(this.url(id, "slug"), { slug: slug });
    },
    title(id, title) {
      return api.patch(this.url(id, "title"), { title: title });
    },
    template(id, template) {
      return api.patch(this.url(id, "template"), { template: template });
    },
    search(parent, query) {
      if (parent) {
        return api.post('pages/' + parent.replace('/', '+') + '/children/search?select=id,title,hasChildren', query);
      } else {
        return api.post('site/children/search?select=id,title,hasChildren', query);
      }
    },
    status(id, status, position) {
      return api.patch(this.url(id, "status"), {
        status: status,
        position: position
      });
    }
  };

  var roles = {
    list() {
      return api.get("roles");
    },
    get(name) {
      return api.get("roles/" + name);
    }
  };

  var system = {
    info(options) {
      return api.get("system", options);
    },
    install(user) {
      return api.post("system/install", user).then(auth => {
        return auth.user;
      });
    },
    register(info) {
      return api.post("system/register", info);
    }
  };

  var site = {
    get(query) {
      return api.get("site", query);
    },
    update(data) {
      return api.post("site", data);
    },
    title(title) {
      return api.patch("site/title", { title: title });
    },
    children(query) {
      return api.post("site/children/search", query);
    },
    blueprint() {
      return api.get("site/blueprint");
    },
    blueprints() {
      return api.get("site/blueprints");
    }
  };

  var translations$1 = {
    list() {
      return api.get("translations");
    },
    get(locale) {
      return api.get("translations/" + locale);
    },
    options() {
      return this.list().then(translation => {
        return translations.data.map(translation => ({
          value: translation.id,
          text: translation.name
        }));
      });
    }
  };

  var users = {
    create(data) {
      return api.post(this.url(), data);
    },
    list(query) {
      return api.post(this.url(null, "search"), query);
    },
    get(id, query) {
      return api.get(this.url(id), query);
    },
    update(id, data) {
      return api.patch(this.url(id), data);
    },
    delete(id) {
      return api.delete(this.url(id));
    },
    changeEmail(id, email) {
      return api.patch(this.url(id, "email"), { email: email });
    },
    changeLanguage(id, language) {
      return api.patch(this.url(id, "language"), { language: language });
    },
    changeName(id, name) {
      return api.patch(this.url(id, "name"), { name: name });
    },
    changePassword(id, password) {
      return api.patch(this.url(id, "password"), { password: password });
    },
    changeRole(id, role) {
      return api.patch(this.url(id, "role"), { role: role });
    },
    deleteAvatar(id) {
      return api.delete(this.url(id, "avatar"));
    },
    blueprint(id) {
      return api.get(this.url(id, "blueprint"));
    },
    url(id, path) {
      let url = !id ? "users" : "users/" + id;

      if (path) {
        url += "/" + path;
      }

      return url;
    },
    link(id, path) {
      return "/" + this.url(id, path);
    }
  };

  var api = {
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
    translations: translations$1,
    users: users,
    ...request
  };

  return api;

}));
