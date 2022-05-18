import _ from 'lodash';
import dayjs from 'dayjs';
import { formatControlValue } from 'src/pages/worksheet/util-purejs';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { functions } from './enum';

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
  let existDeletedControl, controlIsUndefined, existUndefinedFunction;
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
  expression = expression.replace(/\$(.+?)\$/g, matched => {
    const controlId = matched.match(/\$(.+?)\$/)[1];
    const control = _.find(formData, obj => obj.controlId === controlId);
    if (!control) {
      existDeletedControl = true;
      return;
    }
    let value = formatControlValue(control);
    if (typeof value === 'string') {
      value = `'${value.replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
    } else if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return value;
  });
  if (existDeletedControl || controlIsUndefined) {
    return {
      error: 'EXIST_UNDEFINED_CONTROL_OR_VALUE',
      expression,
    };
  }
  return (function () {
    try {
      let result;
      if (type === 'lib') {
        result = eval(fnType === 'javascript' ? 'function run() { ' + expression + ' } run()' : expression);
      } else {
        if (fnType === 'javascript') {
          // 打包函数库时花括号内这段代码注释掉
          const { asyncRun } = require('worksheet/util');
          result = asyncRun(
            expression,
            (err, value) => {
              if (!err) {
                update(_.isUndefined(value) || _.isNaN(value) || _.isNull(value) ? '' : String(value));
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
      switch (control.type) {
        case WIDGETS_TO_API_TYPE_ENUM.TEXT:
          result = _.isUndefined(result) ? '' : result;
          break;
        case WIDGETS_TO_API_TYPE_ENUM.SWITCH:
          result = String(result).toLowerCase() === 'true' ? 1 : 0;
          break;
        case WIDGETS_TO_API_TYPE_ENUM.NUMBER:
        case WIDGETS_TO_API_TYPE_ENUM.MONEY:
          try {
            result = result.match(/[\d\.]+/)[0];
          } catch (err) {}
          break;
        case WIDGETS_TO_API_TYPE_ENUM.DATE:
        case WIDGETS_TO_API_TYPE_ENUM.DATE_TIME:
          result = result && dayjs(result).isValid() ? dayjs(result).format('YYYY-MM-DD HH:mm:ss') : undefined;
          break;
      }
      if (_.isNaN(result)) {
        result = undefined;
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
