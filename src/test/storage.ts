export const createRefusingStorage = (): Storage => {
  const storage = window.localStorage;
  return {
    get length() {
      return storage.length;
    },
    key: (index) => storage.key(index),
    getItem: (key) => storage.getItem(key),
    removeItem: (key) => storage.removeItem(key),
    clear: () => storage.clear(),
    setItem: () => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    },
  };
};
