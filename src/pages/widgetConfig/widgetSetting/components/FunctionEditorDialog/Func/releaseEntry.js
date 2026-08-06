import { Base64 } from 'js-base64';
import exec from './exec';

function runWithParams(control, formData, langCode) {
  if (!control.advancedSetting && control.expression) {
    try {
      control.advancedSetting = {
        defaultfunc: JSON.stringify({ expression: control.expression }),
      };
    } catch (err) {
      console.log(err);
    }
  }

  const result = exec(control, formData, { type: 'lib', langCode });

  if (!result.error) {
    return result.value;
  } else {
    if (typeof console !== 'undefined') {
      console.log(result.error);
    }

    return '';
  }
}

function mobileRun(base64Str) {
  const params = JSON.parse(Base64.decode(base64Str));
  return runWithParams(params.control, params.formData, params.langCode);
}

function strRun(str) {
  const params = JSON.parse(str);
  return runWithParams(params.control, params.formData, params.langCode);
}

function objRun(obj) {
  return runWithParams(obj.control, obj.formData, obj.langCode);
}

export function run(str, type = 'mobile') {
  if (type === 'mobile') {
    return mobileRun(str);
  } else if (type === 'str') {
    return strRun(str);
  } else if (type === 'obj') {
    return objRun(str);
  }
}
