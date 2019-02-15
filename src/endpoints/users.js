import api from "../api.js";

export default {
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
