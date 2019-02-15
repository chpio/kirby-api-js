import api from "../api.js";

export default {
  async list() {
    return api.get("roles");
  },
  async get(name) {
    return api.get("roles/" + name);
  }
};
