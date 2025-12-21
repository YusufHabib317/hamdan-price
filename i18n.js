const localLocales = ['common', 'errors'];
module.exports = {
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  pages: {
    '*': ['common', 'errors'],
  },
  // eslint-disable-next-line consistent-return
  loadLocaleFrom: async (lang, ns) => {
    if (localLocales.includes(ns)) {
      return import(`./locales/${lang}/${ns}`).then((v) => v.default);
    }
  },
};
