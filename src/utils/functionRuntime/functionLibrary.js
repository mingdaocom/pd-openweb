import dayjs from 'dayjs';
import _, { isArray, isFunction } from 'lodash';
import { filterEmptyChildTableRows } from '../core/childTable';
import { wgs84togcj02 } from '../core/geo';
import { countChar } from '../core/string';
import { getSelectedOptions } from '../domain/control/optionSelection';

/**
 * 将控件值转换为公式函数运行时可计算的数字、文本、布尔值或数组。
 * `nullzero` 控制空数值在函数计算中的默认值。
 */
export function formatControlValue(cell, nullzero = '0') {
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

    if (type === 53) {
      type = cell.enumDefault2;
    }

    // 公式（数值）恒为数值；公式（日期）中"日期间的时长(1)/距离此刻的时长(3)"输出数值，"为日期加减时间(2)"输出日期
    if (type === 31 || (type === 38 && (cell.enumDefault === 1 || cell.enumDefault === 3))) {
      type = 6;
    }

    switch (type) {
      case 6: // NUMBER 数值
      case 8: // MONEY 金额
        return String(value).trim() !== '' && _.isNumber(Number(value)) && !_.isNaN(Number(value))
          ? Number(value)
          : nullzero === '1'
            ? 0
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
            const matchText = JSON.parse(cell.value || '[]').find(i => i.indexOf('other:') > -1);
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

          if (isArray(department.departmentPath)) {
            return department.departmentPath
              .reverse()
              .map(path => path.departmentName)
              .concat([department.departmentName])
              .join('/');
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
        if (_.isObject(value)) {
          return filterEmptyChildTableRows(_.get(value, 'rows', []));
        } else if (isFunction(cell.store?.getState)) {
          return filterEmptyChildTableRows(cell.store.getState()?.rows || []);
        } else {
          return [...new Array(value ? Number(value) : 0)];
        }

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
