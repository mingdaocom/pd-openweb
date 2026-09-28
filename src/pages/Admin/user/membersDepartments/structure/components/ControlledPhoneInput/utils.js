import { isValidPhoneNumber } from 'libphonenumber-js/max';
import {
  getDefaultCode,
  parseDialCode,
  parseFullNumberInput,
} from 'ming-ui/components/PhoneNumberInput/DialCodeSelect/utils';

export const getControlledPhoneValue = (phoneNumber = '', defaultCountry = 'cn') => {
  const normalizedValue = String(phoneNumber || '').replace(/\s/g, '');
  const defaultDialCode = getDefaultCode(defaultCountry);
  const parsed = parseFullNumberInput({
    inputValue: normalizedValue,
    defaultCountry,
    fallbackCode: defaultDialCode,
  });

  if (parsed) {
    return { dialCode: parsed.code, value: parsed.numberValue || '' };
  }

  const dialCode = parseDialCode({ value: normalizedValue, defaultCountry, currentCode: defaultDialCode });

  return {
    dialCode,
    value: normalizedValue.startsWith(dialCode) ? normalizedValue.slice(dialCode.length) : normalizedValue,
  };
};

export const getFullPhoneNumber = (dialCode, value) => {
  const normalizedValue = String(value || '').replace(/\s/g, '');

  if (!normalizedValue) return '';
  if (normalizedValue.startsWith('+')) return normalizedValue;

  return `${dialCode || ''}${normalizedValue}`;
};

export const getControlledInputNumber = ({ dialCode, value, showDialCode }) => {
  return showDialCode ? getFullPhoneNumber(dialCode, value) : String(value || '').replace(/\s/g, '');
};

export const createControlledPhoneAdapter = ({ dialCode, value, showDialCode = true }) => {
  const getNumber = () => getControlledInputNumber({ dialCode, value, showDialCode });

  return {
    getNumber,
    getSelectedCountryData: () => ({ dialCode: String(dialCode || '').replace(/^\+/, '') }),
    isValidNumber: () => {
      const phoneNumber = getNumber();
      return !!phoneNumber && isValidPhoneNumber(phoneNumber);
    },
  };
};

export const normalizeControlledPhoneChange = (value, defaultCountry, currentDialCode) => {
  const normalizedValue = String(value || '').replace(/\s/g, '');
  const parsed = parseFullNumberInput({
    inputValue: normalizedValue,
    defaultCountry,
    fallbackCode: currentDialCode,
  });

  return parsed
    ? { dialCode: parsed.code, value: parsed.numberValue || '' }
    : { dialCode: currentDialCode, value: normalizedValue };
};
