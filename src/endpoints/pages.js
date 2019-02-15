import api from "../api.js";

export default {
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
