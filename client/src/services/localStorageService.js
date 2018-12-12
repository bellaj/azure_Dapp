export default class LocalStorageService {
  constructor() {
    this.storage = window.localStorage;
  }

  async getItem(key) {
    if (!key) {
      return;
    }

    const data = this.storage.getItem(key);
    if (!data) {
      return;
    }

    try {
      // eslint-disable-next-line consistent-return
      return JSON.parse(data);
    } catch (err) {
      console.error(err, 'Error');
      // eslint-disable-next-line consistent-return
      return data;
    }
  }

  async addItem(key, data) {
    if (!key || !data) {
      return;
    }

    let jsonData;

    try {
      jsonData = JSON.stringify(data);
    } catch (err) {
      console.log(err, 'Error');
      jsonData = data;
    }

    this.storage.setItem(key, jsonData);
  }
}
