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
  async user() {
    return api.get("auth");
  },
  async login(user) {
    let data = {
      long: user.remember || false,
      email: user.email,
      password: user.password
    };

    const auth = await api.post("auth/login", data);
    return auth.user;
  },
  async logout() {
    return api.post("auth/logout");
  }
};

var files = {
  async get(parent, filename, query) {
    const file = await api.get(this.url(parent, filename), query);
    if (Array.isArray(file.content) === true) {
      file.content = {};
    }
    return file;
  },
  async update(parent, filename, data) {
    return api.patch(this.url(parent, filename), data);
  },
  async rename(parent, filename, to) {
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
  async link(parent, filename, path) {
    return "/" + this.url(parent, filename, path);
  },
  async delete(parent, filename) {
    return api.delete(this.url(parent, filename));
  }
};

var pages = {
  async create(parent, data) {
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
  async get(id, query) {
    const page = await api.get(this.url(id), query);
    if (Array.isArray(page.content) === true) {
      page.content = {};
    }
    return page;
  },
  async preview(id) {
    const page = await this.get(id, { select: "previewUrl" });
    return page.previewUrl;
  },
  async update(id, data) {
    return api.patch(this.url(id), data);
  },
  async children(id, query) {
    return api.post(this.url(id, "children/search"), query);
  },
  async files(id, query) {
    return api.post(this.url(id, "files/search"), query);
  },
  async delete(id, data) {
    return api.delete(this.url(id), data);
  },
  async slug(id, slug) {
    return api.patch(this.url(id, "slug"), { slug: slug });
  },
  async title(id, title) {
    return api.patch(this.url(id, "title"), { title: title });
  },
  async template(id, template) {
    return api.patch(this.url(id, "template"), { template: template });
  },
  async search(parent, query) {
    if (parent) {
      return api.post('pages/' + parent.replace('/', '+') + '/children/search?select=id,title,hasChildren', query);
    } else {
      return api.post('site/children/search?select=id,title,hasChildren', query);
    }
  },
  async status(id, status, position) {
    return api.patch(this.url(id, "status"), {
      status: status,
      position: position
    });
  }
};

var roles = {
  async list() {
    return api.get("roles");
  },
  async get(name) {
    return api.get("roles/" + name);
  }
};

var system = {
  async info(options) {
    return api.get("system", options);
  },
  async install(user) {
    const auth = await api.post("system/install", user);
    return auth.user;
  },
  async register(info) {
    return api.post("system/register", info);
  }
};

var site = {
  async get(query) {
    return api.get("site", query);
  },
  async update(data) {
    return api.post("site", data);
  },
  async title(title) {
    return api.patch("site/title", { title: title });
  },
  async children(query) {
    return api.post("site/children/search", query);
  },
  async blueprint() {
    return api.get("site/blueprint");
  },
  async blueprints() {
    return api.get("site/blueprints");
  }
};

var translations = {
  async list() {
    return api.get("translations");
  },
  async get(locale) {
    return api.get("translations/" + locale);
  },
  async options() {
    const translations = await this.list();
    return translations.data.map(translation => ({
      value: translation.id,
      text: translation.name
    }));
  }
};

var users = {
  async create(data) {
    return api.post(this.url(), data);
  },
  async list(query) {
    return api.post(this.url(null, "search"), query);
  },
  async get(id, query) {
    return api.get(this.url(id), query);
  },
  async update(id, data) {
    return api.patch(this.url(id), data);
  },
  async delete(id) {
    return api.delete(this.url(id));
  },
  async changeEmail(id, email) {
    return api.patch(this.url(id, "email"), { email: email });
  },
  async changeLanguage(id, language) {
    return api.patch(this.url(id, "language"), { language: language });
  },
  async changeName(id, name) {
    return api.patch(this.url(id, "name"), { name: name });
  },
  async changePassword(id, password) {
    return api.patch(this.url(id, "password"), { password: password });
  },
  async changeRole(id, role) {
    return api.patch(this.url(id, "role"), { role: role });
  },
  async deleteAvatar(id) {
    return api.delete(this.url(id, "avatar"));
  },
  async blueprint(id) {
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
  translations: translations,
  users: users,
  ...request
};

export default api;
