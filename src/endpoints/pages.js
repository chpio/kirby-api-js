import api from "../api.js";

export default {
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
