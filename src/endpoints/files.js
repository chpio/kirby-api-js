import api from "../api.js";

export default {
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
