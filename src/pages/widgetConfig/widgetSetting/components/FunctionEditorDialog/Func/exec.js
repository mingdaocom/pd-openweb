import _ from 'lodash';
import dayjs from 'dayjs';
import qs from 'query-string';
import { formatControlValue } from 'src/pages/worksheet/util-purejs';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { functions } from './enum';
import { asyncRun } from 'worksheet/util';

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

function formatFunctionResult(controlType, value) {
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
        result = result.match(/^-?[\d\.]+/)[0];
      } catch (err) {}
      break;
    case WIDGETS_TO_API_TYPE_ENUM.DATE:
      result = result && dayjs(result).isValid() ? dayjs(result).format('YYYY-MM-DD') : undefined;
      break;
    case WIDGETS_TO_API_TYPE_ENUM.DATE_TIME:
      result = result && dayjs(result).isValid() ? dayjs(result).format('YYYY-MM-DD HH:mm:ss') : undefined;
      break;
  }
  return result;
}

export default function (control, formData, { update, type } = {}) {
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
  expression = expression.replace(/([A-Z]+)(?=\()/g, name => {
    if (run[name]) {
      return 'run.' + name;
    } else {
      // 不执行未定义函数
      existUndefinedFunction = true;
      return 'E_R_R_O_R';
    }
  });
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
      const is_iOS = /iphone/.test(navigator.userAgent.toLowerCase());
      if (is_iOS && fnType === 'javascript') {
        // iOS15以下不支持web worker，改为直接运行
        result = eval('function run() { ' + expression + ' } run()');
        update(_.isUndefined(result) || _.isNaN(result) || _.isNull(result) ? '' : String(result));
        return;
      }
      if (type === 'lib') {
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
                    : String(formatFunctionResult(control.type, value)),
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
      result = formatFunctionResult(control.type, result);
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
