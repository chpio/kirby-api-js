import api from "../api.js";

export default {
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
