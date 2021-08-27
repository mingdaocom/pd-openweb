import moment from 'moment';
import { getAccessToken } from 'src/api/plus';
import { checkFieldUnique } from 'src/api/worksheet';
import { ACCOUNT_FIELD } from './constants/';

export const setLicense = (license) => {
  let dossierLicense = window.localStorage.getItem('plus_dossier_license');
  const projectId = window.localStorage.getItem('plus_projectId');
  if (dossierLicense) {
    try {
      dossierLicense = JSON.parse(dossierLicense);
      dossierLicense[projectId] = license;
    } catch (err) {
      dossierLicense = {
        [projectId]: license,
      };
    }
  } else {
    dossierLicense = {
      [projectId]: license,
    };
  }
  window.localStorage.setItem('plus_dossier_license', JSON.stringify(dossierLicense));
};

export const getLicense = () => {
  let dossierLicense = window.localStorage.getItem('plus_dossier_license');
  const projectId = window.localStorage.getItem('plus_projectId');
  if (dossierLicense) {
    try {
      dossierLicense = JSON.parse(dossierLicense);
      return dossierLicense[projectId];
    } catch (err) {
      return undefined;
    }
  } else {
    return undefined;
  }
};

export const getJobCategoryTxt = (jobCategory) => {
  switch (jobCategory) {
    case '1':
      return _l('全职');
    case '2':
      return _l('兼职');
    case '4':
      return _l('实习');
    default :
      return jobCategory;
  }
};

/** 得到各个字段显示的值 */
export const getFieldLabelFromValue = (id, type, value, options) => {
  switch (type) {
    // Dropdown
    case 11: {
      const option = options.filter(item => value === item.key)[0];
      if (option) {
        return option.value;
      }
      return '';
    }
    // DateTimeRange
    case 17:
    case 18: {
      return value.join(' ~ ');
    }
    // DateTime
    case 15:
    case 16:
      return moment(value).format('YYYY-MM-DD');
    // AreaPicker
    case 19:
    case 23:
    case 24: {
      if (value && Array.isArray(value)) {
        return value.map(item => item.name).join(' / ');
      }
      if (!value || (typeof value === 'object')) {
        return '';
      }
      return value.map(item => item.name).join(' / ');
    }
    // UserPicker
    case 26: {
      return value.fullname;
    }
    // DepartmentPicker
    case 27: {
      return value.departmentName;
    }
  }
  switch (id) {
    case ACCOUNT_FIELD.POSITION:
    case ACCOUNT_FIELD.RANK:
    case ACCOUNT_FIELD.WORK_SPACE:
    case ACCOUNT_FIELD.CONTRACT_COMPANY: {
      const option = options.filter(item => value === item.key)[0];
      if (option) {
        return option.value;
      }
      return '';
    }
    default:
      if (typeof value !== 'string') {
        console.warn(`Recoder getFieldLabelFromValue Error: id = ${id}, type = ${type}, value = ${value}`);
        return value.toString();
      } else {
        return value;
      }
  }
};

export const scrollEnd = fn => (e) => {
  if (e.target.scrollTop !== 0 && e.target.scrollHeight - e.target.scrollTop - e.target.offsetHeight <= 5 && fn) {
    fn(e);
  }
};

export const changeProject = projectId =>
  new Promise((resolve, reject) => {
    getAccessToken({ projectId })
      .then((data) => {
        if (data.accessToken && data.projectId) {
          window.localStorage.setItem('plus_accessToken', data.accessToken);
          window.localStorage.setItem('plus_projectId', data.projectId);
          resolve(data);
        } else {
          reject();
        }
      })
      .fail(() => {
        reject();
      });
  });

export const getUnit = (unitType) => {
  switch (unitType) {
    case 2:
      return _l('小时');
    case 3:
      return _l('天');
    default:
      return '';
  }
};

export function getVacationNum(type, limit) {
  if (limit === -999) {
    return _l('无假期限制');
  } else if (limit === 0) {
    return _l('无可用假期');
  }
  return limit + getUnit(type);
}

/**
 * 保留一位小数
 */
export function tofix(value) {
  let str = '';
  let i = 0;
  while (i !== value.length) {
    if (/\d|\./.test(value[i])) {
      str = str + value[i];
    }
    i++;
  }
  if (str) {
    str = parseFloat(str).toFixed(1);
  }
  return str;
}

export function checkControlUnique(worksheetId, controlId, controlType, controlValue) {
  return checkFieldUnique({
    worksheetId,
    controlId,
    controlType,
    controlValue,
  });
}
