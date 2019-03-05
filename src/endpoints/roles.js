import api from "../api.js";

export default {
  list() {
    return api.get("roles");
  },
  get(name) {
    return api.get("roles/" + name);
  }
};
