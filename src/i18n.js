import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import translationUS from './translations/us/translation.json';
import translationES from './translations/es/translation.json';

// the translations
// move them in a JSON file and import them eventually
const resources = {
  us: {
    translation: translationUS
  },
  es: {
    translation: translationES
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "us",
    fallbackLng: "us",

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
