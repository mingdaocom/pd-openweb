import _, { isNumber } from 'lodash';
import dayjs from 'dayjs';
import qs from 'query-string';
import { formatControlValue } from 'src/pages/worksheet/util-purejs';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { functions } from './enum';
import { asyncRun } from 'worksheet/util';
import { handleDotAndRound } from 'src/components/newCustomFields/tools/DataFormat';
import { toFixed } from 'src/util';

function replaceControlIdToValue(expression, formData, inString) {
  expression = expression.replace(/\$(.+?)\$/g, matched => {
    const controlId = matched.match(/\$(.+?)\$/)[1];
    const control = _.find(formData, obj => obj.controlId === controlId);
    if (!control) {
      return;
    }
    let value = formatControlValue(control);
    if (typeof value === 'string' && !inString) {
      value = `'${value.replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
    } else if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return typeof value === 'string' ? value : `(${value})`;
  });
  if (expression.indexOf('SYSTEM_URL_PARAMS') > -1) {
    try {
      expression = `var SYSTEM_URL_PARAMS=${JSON.stringify(qs.parse(location.search))};` + expression;
    } catch (err) {}
  }
  return expression;
}

function formatFunctionResult(control, value) {
  const controlType = _.get(control, 'type') === 53 ? _.get(control, 'enumDefault2') : control.type;
  let result = value;
  switch (controlType) {
    case WIDGETS_TO_API_TYPE_ENUM.TEXT:
      result = _.isUndefined(result) ? '' : result;
      break;
    case WIDGETS_TO_API_TYPE_ENUM.SWITCH:
      result = String(result).toLowerCase() === 'true' ? 1 : 0;
      break;
    case WIDGETS_TO_API_TYPE_ENUM.NUMBER:
    case WIDGETS_TO_API_TYPE_ENUM.MONEY:
      try {
        result = (result || '').toString().match(/^-?[\d\.]+/)[0];
        if (_.isNumber(Number(result)) && !_.isNaN(Number(result))) {
          result = String(Number(toFixed(result, 10)));
        }
      } catch (err) {}
      break;
    case WIDGETS_TO_API_TYPE_ENUM.DATE:
      result = result && dayjs(result).isValid() ? dayjs(result).format('YYYY-MM-DD') : undefined;
      break;
    case WIDGETS_TO_API_TYPE_ENUM.DATE_TIME:
      result = result && dayjs(result).isValid() ? dayjs(result).format('YYYY-MM-DD HH:mm:ss') : undefined;
      break;
    case WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU:
    case WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT:
    case WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN:
      const filterOptions = (control.options || []).filter(i => !i.isDeleted);
      const tempValue = (_.isString(result) ? result.split(',') : [].concat(result))
        .map(item => {
          return _.get(
            _.find(filterOptions, option => option.value === item),
            'key',
          );
        })
        .filter(_.identity);

      result = _.isEmpty(tempValue) ? '' : JSON.stringify(tempValue);
      break;
    case WIDGETS_TO_API_TYPE_ENUM.TIME:
      const formatMode = _.includes(['6', '9'], control.unit) ? 'HH:mm:ss' : 'HH:mm';
      result = result
        ? dayjs(result).year() && dayjs(result).isValid()
          ? dayjs(result).format(formatMode)
          : dayjs(result, dayjs(result).second() ? 'HH:mm:ss' : 'HH:mm').format(formatMode)
        : undefined;
      if (result === 'Invalid date') {
        result = undefined;
      }
      break;
    case WIDGETS_TO_API_TYPE_ENUM.LOCATION:
      const resultArr = _.isString(result) ? result.split(',') : [].concat(result);
      const [x, y, title, address] = resultArr;
      result = x && y && !_.isNaN(Number(x)) && !_.isNaN(Number(y)) ? JSON.stringify({ x, y, title, address }) : '';
      break;
  }
  return result;
}

export default function (control, formData, { update, type, forceSyncRun = false } = {}) {
  const run = functions;
  let expressionData = {};
  try {
    expressionData = JSON.parse(control.advancedSetting.defaultfunc);
  } catch (err) {}
  let expression = _.get(expressionData, 'expression');
  let fnType = _.get(expressionData, 'type');
  if (!expression) {
    throw new Error('expression is undefined');
  }
  let existDeletedControl, existUndefinedFunction;
  if (fnType !== 'javascript') {
    expression = expression.replace(/([A-Z]+)(?=\()/g, name => {
      if (run[name]) {
        return 'run.' + name;
      } else {
        // 不执行未定义函数
        existUndefinedFunction = true;
        return 'E_R_R_O_R';
      }
    });
  }
  if (existUndefinedFunction) {
    return {
      error: 'EXIST_UNDEFINED_FUNCTION',
      expression,
    };
  }
  // TODO 作用不明 先注释
  // let matched;
  // const re = /['"][^'"]+['"]/g;
  // while ((matched = re.exec(expression)) !== null) {
  //   const matchStart = matched.index;
  //   const matchEnd = matched.index + matched[0].length;
  //   expression =
  //     expression.slice(0, matchStart) +
  //     replaceControlIdToValue(expression.slice(matchStart, matchEnd), formData, true) +
  //     expression.slice(matchEnd);
  // }
  expression = replaceControlIdToValue(expression, formData);
  if (!expression || existDeletedControl) {
    return {
      error: 'EXIST_UNDEFINED_CONTROL_OR_VALUE',
      expression,
    };
  }
  return (function () {
    try {
      let result;

      if (window.isIphone && fnType === 'javascript' && !forceSyncRun) {
        // iOS15以下不支持web worker，改为直接运行
        result = eval('function run() { ' + expression + ' } run()');
        update(
          _.isUndefined(result) || _.isNaN(result) || _.isNull(result)
            ? ''
            : String(formatFunctionResult(control, result)),
        );
        return;
      }
      if (type === 'lib' || forceSyncRun) {
        result = eval(fnType === 'javascript' ? 'function run() { ' + expression + ' } run()' : expression);
      } else {
        if (fnType === 'javascript') {
          // 打包函数库时花括号内这段代码注释掉
          result = asyncRun(
            expression,
            (err, value) => {
              if (!err) {
                update(
                  _.isUndefined(value) || _.isNaN(value) || _.isNull(value)
                    ? ''
                    : String(formatFunctionResult(control, value)),
                );
              } else {
                console.log(err);
              }
            },
            { timeout: 1000 },
          );
        } else {
          result = eval(expression);
        }
      }
      result = formatFunctionResult(control, result);
      if (_.isNaN(result)) {
        result = undefined;
      }
      if (type === 'lib' && typeof result === 'undefined') {
        result = '';
      }
      return {
        value: result,
        expression,
      };
    } catch (err) {
      return {
        error: err,
        expression,
      };
    }
  })();
}
