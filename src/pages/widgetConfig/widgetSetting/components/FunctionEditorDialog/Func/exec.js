import { formatControlValue, checkCellIsEmpty } from 'src/pages/worksheet/util';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { functions } from './enum';

export default function (expression, formData, control = {}) {
  const run = functions;
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
  expression = expression.replace(/\$((\w{8}(-\w{4}){3}-\w{12})|[0-9a-z]{24})\$/g, matched => {
    const controlId = matched.match(/\$(.+?)\$/)[1];
    const control = _.find(formData, obj => obj.controlId === controlId);
    if (!control) {
      existDeletedControl = true;
      return;
    }

    if (typeof control.value === 'undefined' && /\.(IF|OR|AND|NOT)\(/.test(expression)) {
      controlIsUndefined = true;
      return;
    }
    let value = formatControlValue(control);
    if (typeof value === 'string') {
      value = `'${value.replace(/'/g, "\\'")}'`;
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
      let result = eval(expression);
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
          result = result && moment(result).isValid() ? moment(result).format() : undefined;
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
