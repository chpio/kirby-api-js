import api from "../api.js";

export default {
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
