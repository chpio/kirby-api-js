import api from "../api.js";

export default {
  list() {
    return api.get("translations");
  },
  get(locale) {
    return api.get("translations/" + locale);
  },
  options() {
    return this.list().then(translation => {
      return translations.data.map(translation => ({
        value: translation.id,
        text: translation.name
      }));
    });
  }
};
