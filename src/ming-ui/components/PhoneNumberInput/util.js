import _ from 'lodash';
import { MDIntlTelInput } from './DialCodeSelect';

export const specialTelVerify = value => {
  return /\+61\d{9,10}$|\+861[3-9]\d{9}$|\+84\d{9,10}$/.test(value || '');
};

export const getDefaultCountry = () => {
  return window.localStorage.getItem('DefaultCountry') || _.get(md, 'global.Config.DefaultRegion') || 'cn';
};

export const getPhoneInputLocale = () => {
  return getCookie('i18n_langtag') || window.getDefaultLangKey();
};

export const getPreferredCountries = () => {
  return _.get(md, 'global.Config.DefaultConfig.preferredCountries') || [getDefaultCountry()];
};

export const createIntlTelInput = (element, options = {}) => {
  return MDIntlTelInput(element, {
    initialCountry: getDefaultCountry(),
    preferredCountries: getPreferredCountries(),
    locale: getPhoneInputLocale(),
    ...options,
  });
};

export const initIntlTelInput = () => {
  if (window.initIntlTelInput) {
    return window.initIntlTelInput;
  }

  const con = document.createElement('div');
  const input = document.createElement('input');
  con.style.display = 'none';
  con.appendChild(input);
  document.body.appendChild(con);

  window.initIntlTelInput = createIntlTelInput(input);

  return window.initIntlTelInput;
};

export const telIsValidNumber = value => {
  const iti = initIntlTelInput();
  iti.setNumber(value);

  return iti.isValidNumber() && _.get(iti.getSelectedCountryData(), 'dialCode') === '86'
    ? specialTelVerify(_.startsWith(value, '+86') ? value : '+86' + value)
    : iti.isValidNumber() || specialTelVerify(value);
};
