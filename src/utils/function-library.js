import dayjs from 'dayjs';
import _ from 'lodash';

/** 获取选项 */
export function getSelectedOptions(options, value, control) {
  if (!value || value === '[]') {
    return [];
  }
  let selectedKeys = [];
  try {
    selectedKeys = JSON.parse(value);
    return (
      _.get(control, 'advancedSetting.checktype') === '0'
        ? _.filter(
            options,
            option =>
              _.find(selectedKeys, selectedKey => {
                if (selectedKey.indexOf('other') > -1 || selectedKey.indexOf('add_') > -1) {
                  return selectedKey.indexOf(option.key) > -1;
                }
                return selectedKey === option.key;
              }) && !option.isDeleted,
          ).map(option => option.key)
        : selectedKeys
    )
      .map(key =>
        _.find(options, option => {
          if (key.indexOf('other') > -1 || key.indexOf('add_') > -1) {
            return key.indexOf(option.key) > -1;
          }
          return key === option.key;
        }),
      )
      .filter(_.identity);
  } catch (err) {
    console.log(err);
    return [];
  }
}

function transformLat(lng, lat) {
  var pi = 3.14159265358979324;
  var dLat = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  dLat += ((20.0 * Math.sin(6.0 * lng * pi) + 20.0 * Math.sin(2.0 * lng * pi)) * 2.0) / 3.0;
  dLat += ((20.0 * Math.sin(lat * pi) + 40.0 * Math.sin((lat / 3.0) * pi)) * 2.0) / 3.0;
  dLat += ((160.0 * Math.sin((lat / 12.0) * pi) + 320 * Math.sin((lat * pi) / 30.0)) * 2.0) / 3.0;
  return dLat;
}

function transformLng(lng, lat) {
  var pi = 3.14159265358979324;
  var dLng = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  dLng += ((20.0 * Math.sin(6.0 * lng * pi) + 20.0 * Math.sin(2.0 * lng * pi)) * 2.0) / 3.0;
  dLng += ((20.0 * Math.sin(lng * pi) + 40.0 * Math.sin((lng / 3.0) * pi)) * 2.0) / 3.0;
  dLng += ((150.0 * Math.sin((lng / 12.0) * pi) + 300.0 * Math.sin((lng / 30.0) * pi)) * 2.0) / 3.0;
  return dLng;
}

export function wgs84togcj02(longitude, latitude) {
  var lng = parseFloat(longitude);
  var lat = parseFloat(latitude);
  var a = 6378245.0;
  var ee = 0.00669342162296594323;
  var pi = 3.14159265358979324;
  var dLat = transformLat(lng - 105.0, lat - 35.0);
  var dLng = transformLng(lng - 105.0, lat - 35.0);
  var radLat = (lat / 180.0) * pi;
  var magic = Math.sin(radLat);
  magic = 1 - ee * magic * magic;
  var sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((a * (1 - ee)) / (magic * sqrtMagic)) * pi);
  dLng = (dLng * 180.0) / ((a / sqrtMagic) * Math.cos(radLat) * pi);
  var mgLat = lat + dLat;
  var mgLng = lng + dLng;
  return [mgLng, mgLat];
}

export function calcDate(date, expression) {
  if (!date) {
    return { error: true };
  }
  if (!/^[+-]/.test(expression)) {
    expression = '+' + expression;
  }
  try {
    let result = dayjs(date);
    const regexp = /([/+/-]){1}(\d+(\.\d+)?)+([YQMwdhms]){1}/g;
    let match = regexp.exec(expression);
    while (match) {
      const operator = match[1];
      const number = Number(match[2]);
      const unit = match[4];
      if (/^[+-]$/.test(operator) && number && typeof number === 'number' && /^[YQMwdhms]$/.test(unit)) {
        result = result[operator === '+' ? 'add' : 'subtract'](Math.round(number), unit.replace(/Y/, 'y'));
      }
      match = regexp.exec(expression);
    }
    return { result };
  } catch (err) {
    return { error: err };
  }
}

export function countChar(str = '', char) {
  if (!str || !char) {
    return 0;
  }
  try {
    return str.match(new RegExp(char, 'g')).length;
  } catch (err) {
    console.log(err);
    return 0;
  }
}

/**
 * 对将复杂字段数据处理成简单数据 用来呈现或参与计算
 * return undefined string number bool [string] [number]
 */
export function formatControlValue(cell) {
  try {
    if (!cell) {
      return;
    }
    let newPos = [];
    let { type, value } = cell;
    let parsedData, selectedOptions;
    if (type === 37) {
      if (cell.advancedSetting && cell.advancedSetting.summaryresult === '1') {
        type = 2;
        value = Math.round(parseFloat(cell.value) * 100) + '%';
      } else {
        type = cell.enumDefault2 || 6;
      }
    }
    switch (type) {
      case 6: // NUMBER 数值
      case 8: // MONEY 金额
        return String(value).trim() !== '' && _.isNumber(Number(value)) && !_.isNaN(Number(value))
          ? Number(value)
          : undefined;
      case 19: // AREA_INPUT 地区
      case 23: // AREA_INPUT 地区
      case 24: // AREA_INPUT 地区
        return JSON.parse(value).name;
      case 17: // DATE_TIME_RANGE 时间段
      case 18: // DATE_TIME_RANGE 时间段
        if (value === '' || value === '["",""]') {
          return;
        }
        return JSON.parse(value);
      case 40: // LOCATION 定位
        parsedData = JSON.parse(value) || {};
        if (!_.isObject(parsedData)) {
          return undefined;
        }
        if ((parsedData.coordinate || '').toLowerCase() === 'wgs84') {
          newPos = wgs84togcj02(parsedData.x, parsedData.y);
          return {
            ...parsedData,
            x: newPos[0],
            y: newPos[1],
          };
        }
        return parsedData;
      // 组件
      case 9: // OPTIONS 单选 平铺
      case 10: // MULTI_SELECT 多选
      case 11: // OPTIONS 单选 下拉
        selectedOptions = getSelectedOptions(cell.options, cell.value, cell);
        return selectedOptions.map(option => {
          if (_.get(option, 'key') === 'other') {
            const matchText = safeParse(cell.value || '[]').find(i => i.indexOf('other:') > -1);
            return matchText ? matchText.replace('other:', '') : option.value;
          }
          return option.value;
        });
      case 26: // USER_PICKER 成员
        parsedData = JSON.parse(value);
        if (!_.isArray(parsedData)) {
          parsedData = [parsedData];
        }
        return parsedData.filter(user => !!user).map(user => (typeof user === 'string' ? user : user.fullname));
      case 27: // GROUP_PICKER 部门
        return JSON.parse(cell.value).map(department => {
          if (typeof department === 'string') {
            return department;
          }
          return department.departmentName ? department.departmentName : _l('该部门已删除');
        });
      case 48: // ORG_ROLE 组织角色
        return JSON.parse(cell.value).map(organization => {
          if (typeof organization === 'string') {
            return organization;
          }
          return organization.organizeName ? organization.organizeName : _l('该组织已删除');
        });
      case 36: // SWITCH 检查框
        return value === '1' || value === 1;
      case 14: // ATTACHMENT 附件
        return JSON.parse(value).map(attachment => `${attachment.originalFilename + attachment.ext}`);
      case 35: // CASCADER 级联
        parsedData = JSON.parse(value);
        return _.isArray(parsedData) && parsedData.length ? parsedData[0].name : undefined;
      case 29: // RELATESHEET 关联表
        if (_.isNumber(+value) && !_.isNaN(+value)) {
          parsedData = new Array(+value).fill();
        } else {
          parsedData = JSON.parse(value);
          parsedData =
            _.isArray(parsedData) &&
            parsedData
              .map(record =>
                formatControlValue(_.assign({}, cell, { type: cell.sourceControlType || 2, value: record.name })),
              )
              .filter(_.identity);
        }
        return cell.enumDefault === 1 ? parsedData.slice(0, 1) : parsedData;
      case 34: // SUBLIST 子表
        return _.isObject(value) ? _.get(value, 'rows') : [...new Array(value ? Number(value) : 0)];
      case 30: // SHEETFIELD 他表字段
        return formatControlValue(
          _.assign({}, cell, {
            type: cell.sourceControlType || 2,
            advancedSetting: _.get(cell, 'sourceControl.advancedSetting') || {},
          }),
        );
      case 46: // TIME 时间
        if (_.isEmpty(value)) {
          return '';
        }
        return dayjs(value, countChar(value, ':') === 2 ? 'HH:mm:ss' : 'HH:mm').format(
          cell.unit === '6' || cell.unit === '9' ? 'HH:mm:ss' : 'HH:mm',
        );
      default:
        return value;
    }
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.log(err);
    }
    return;
  }
}
