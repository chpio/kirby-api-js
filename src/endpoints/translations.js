import api from "../api.js";

export default {
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
