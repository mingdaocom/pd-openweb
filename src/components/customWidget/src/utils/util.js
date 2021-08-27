import config from '../config';
import global from '../config/globalConfig';
import moment from 'moment';
import _ from 'lodash';
import { getRePosFromStr } from 'ming-ui/components/TagTextarea';
import { htmlEncodeReg } from 'src/util';

// 拆分option的default
function getOptionDefault(defaultValue) {
  var arr = [];
  for (let key = 0; key < defaultValue.length; key++) {
    if (defaultValue[defaultValue.length - 1 - key] === '1') {
      arr.push('1' + new Array(key).fill('0').join(''));
    }
  }
  return arr;
}
// classset方法
export const classSet = function () {
  if (typeof arguments[0] === 'string') {
    return Array.from(arguments).join(' ');
  } else if (typeof arguments[0] === 'object') {
    let pram = arguments[0];
    return (
      Object.keys(pram)
        .map(key => {
          return pram[key] ? key : '';
        })
        .join(' ') +
      ' ' +
      Array.from(arguments)
        .slice(1)
        .join(' ')
    );
  }
  console.log('type of param error');
};

// 根据控件名得到一个控件
export const createNewWidget = function (name, param) {
  let newWidget;
  if (typeof param === 'object') {
    newWidget = Object.assign(_.cloneDeep(config.WIDGETS[name]), param);
  } else {
    newWidget = _.cloneDeep(config.WIDGETS[name]);
  }
  newWidget.id = -new Date() + '' + Math.random(1, 1000);
  return newWidget;
};

export const strlen = function (str, num, tails = '...') {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    // 单字节加1
    if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
      len++;
    } else {
      len += 2;
    }
    if (len > num) {
      return str.slice(0, i) + tails;
    }
  }
  return str;
};

function getStorageKey() {
  // return `${md.global.Account.accountId}_${config.global.sourceId}__customWidgetData`;
  return 'storage';
}

// 存进缓存
export const saveToStorage = function (data) {
  // window.localStorage.setItem(getStorageKey(), JSON.stringify(data));
  config[getStorageKey()] = JSON.stringify(data);
};

// 清楚缓存
export const clearStorage = function () {
  // window.localStorage.setItem(getStorageKey(), '');
  config[getStorageKey()] = '';
};

// 得到缓存
export const getStorage = function () {
  // if (!window.localStorage[getStorageKey()]) {
  //   return '';
  // }
  // return JSON.parse(window.localStorage[getStorageKey()]);
  if (!config[getStorageKey()]) {
    return '';
  }
  return JSON.parse(config[getStorageKey()]);
};

// 深度克隆顺便存进缓存
export const cloneDeepContainer = function (data) {
  saveToStorage(data);
  return _.cloneDeep(data);
};

// 取得撤销的数据节点
export const loadDataPoint = function (data) {
  return config.dataPoint;
};

// 处理后端单个control，得到widget
export const getWidgetByControl = function (control) {
  let widget;
  Object.keys(config.WIDGETS).forEach(key => {
    let item = config.WIDGETS[key];
    if (item.type < 1) return false;
    item = createNewWidget(item.enumName);
    if (item.typeArr) {
      item.typeArr.forEach(typeItem => {
        if (typeItem.type === control.type) {
          widget = item;
        }
      });
    } else if (item.data.type === control.type) {
      widget = item;
    }
  });
  if (!widget) {
    return;
  }
  // 兼容移动端整行半行
  if (control.type === 3 || control.tyoe === 5 || control.type === 6 || control.type === 7 || control.type === 8 || control.type === 11 || control.type === 15 || control.type === 24 || control.type === 25 || (control.type === 26 && control.enumDefault === 0) || control.type === 27 || control.type === 20) {
    control.half = true;
  }
  if (control.options) {
    let arr = getOptionDefault(control.default);
    control.options.sort((a, b) => a.index - b.index);
    control.options.map(option => {
      if (arr.indexOf(option.key) >= 0) {
        option.checked = true;
      } else {
        option.checked = false;
      }
      return option;
    });
  }
  if (widget.OAOptions) {
    if (control.validate !== undefined) {
      widget.OAOptions.validate = control.validate;
    }
    if (control.printHide !== undefined) {
      widget.OAOptions.printHide = control.printHide;
    }
    if (control.required !== undefined) {
      widget.OAOptions.required = control.required;
    }
  }
  widget.required = !!control.required;

  if (widget.TASKOptions) {
    if (control.display !== undefined) {
      widget.TASKOptions.display = control.display;
    }
  }

  widget.data = _.cloneDeep(control);
  delete widget.data.col;
  delete widget.data.row;
  return widget;
};

// 处理后端整个controls，得到widgets
export const getEditWidgetsByControls = function (controls, formControls) {
  let editWidgets = [];
  // 排序并生成二维数组
  controls.sort((a, b) => a.row * 1000 - b.row * 1000 + a.col - b.col).forEach((control) => {
    let widget = getWidgetByControl(control);
    if (control.col === 0) {
      // col为零的时候建一个新的row
      editWidgets[control.row] = [widget];
      if (widget && widget.data.half) {
        editWidgets[control.row].push(createNewWidget('EDIT_HIDE'));
      }
    } else if (control.col === 1) {
      if (editWidgets[control.row]) {
        editWidgets[control.row][control.col] = widget;
      } else {
        editWidgets[control.row] = [createNewWidget('EDIT_HIDE'), widget];
      }
    }
  });
  editWidgets = editWidgets.filter(item => !!item);
  // 填充最后一个半行控件
  let lastList = editWidgets[editWidgets.length - 1] || [];
  if (lastList.length === 1 && lastList[0] && lastList[0].data.half) {
    lastList.push(createNewWidget('EDIT_HIDE'));
  }

  // 给导入的没有half的数据给half
  editWidgets.map(widgetList => {
    if (widgetList.lengt === 1 && widgetList[0].data) {
      widgetList[0].data.half = false;
    } else if (widgetList.length === 2) {
      widgetList = widgetList.map(widget => {
        if (widget.type > 1) {
          widget.data.half = true;
        }
        return widget;
      });
    }
    return widgetList;
  });

  // 处理公式数据id 文本组合id
  const updateFormulaId = function (data) {
    data.forEach(list =>
      list.forEach(widget => {
        if (widget && (widget.type === 18 || widget.type === 31 || widget.type === 32) && widget.data.dataSource) {
          let sourceArr = _.union(widget.data.dataSource.match(/\$[\s\S]*?\$/g));
          if (sourceArr) {
            sourceArr.forEach(source => {
              let controlId = source.replace(/\$/g, '');
              data.forEach(widgets =>
                widgets.forEach(item => {
                  if (item.data && controlId === item.data.controlId) {
                    widget.data.dataSource = widget.data.dataSource.replace(new RegExp(controlId, 'g'), item.id);
                  }
                })
              );
            });
          }
        }
        if (widget.type === 18 || widget.type === 31) {
          widget.data.dataSource = widget.data.dataSource
            .replace(/cSUM/gi, 'SUM')
            .replace(/cMIN/gi, 'MIN')
            .replace(/cMAX/gi, 'MAX')
            .replace(/cPRODUCT/gi, 'PRODUCT')
            .replace(/cCOUNTA/gi, 'COUNTA')
            .replace(/cABS/gi, 'ABS')
            .replace(/cINT/gi, 'INT')
            .replace(/cMOD/gi, 'MOD')
            .replace(/cROUND/gi, 'ROUND')
            .replace(/cROUNDUP/gi, 'ROUNDUP')
            .replace(/cROUNDDOWN/gi, 'ROUNDDOWN');
        }
        if (widget.type === 18) {
          widget.data.dataSource = widget.data.dataSource.replace(/cAVG/gi, 'AVG');
        } else if (widget.type === 31) {
          widget.data.dataSource = widget.data.dataSource.replace(/cAVG/gi, 'AVERAGE');
        }
      })
    );
  };

  // 处理公式数据id
  updateFormulaId(editWidgets);

  // 处理明细数据
  editWidgets.forEach(list =>
    list.forEach(widget => {
      if (widget && widget.type === 17) {
        let formArr = [];
        formControls.forEach(formControl => {
          if (widget.data.formId === formControl.formId) {
            // 解析必填选项
            formControl.controls.forEach(forms => {
              formArr.push(getWidgetByControl(forms));
            });
          }
        });
        formArr.sort((a, b) => a.data.innerRow - b.data.innerRow);
        widget.data.controls = formArr;
      }
    })
  );

  // 处理明细公式数据
  editWidgets.forEach(list =>
    list.forEach(widget => {
      if (widget && widget.type === 17) {
        updateFormulaId([widget.data.controls]);
      }
    })
  );

  return editWidgets;
};

// 判断是不是老数据的widget
export const isOldWidget = function (widgets, id) {
  let isOld = false;
  widgets.forEach(list =>
    list.forEach(widget => {
      if (widget.id === id && widget.data && widget.data.controlId) {
        isOld = true;
      }
    })
  );
  return isOld;
};

// 找到widget
export const findWidgetById = function (widgets, id) {
  let widget;
  widgets.forEach(list =>
    list && list.forEach(item => {
      if (item && item.id === id) {
        widget = item;
        return false;
      }
    })
  );
  return widget;
};

// 对比新旧数据，是否改动了老数据
export const validateWidgetChange = function (oldWidgets, newWidgets) {
  var oldWidgetsData = [];
  var newWidgetsData = [];
  var warningTxt = [];
  var getWidgetByControlId = function (widgets, controlId) {
    var widget;
    widgets.forEach(item => {
      if (item.data.controlId === controlId) {
        widget = item;
      }
    });
    return widget;
  };

  // 取得widgets数组
  oldWidgets.forEach(list =>
    list.forEach(widget => {
      if (widget.data && widget.data.controlId) {
        oldWidgetsData.push(widget);
      }
    })
  );
  newWidgets.forEach(list =>
    list.forEach(widget => {
      if (widget.data && widget.data.controlId) {
        newWidgetsData.push(widget);
      }
    })
  );

  // 数据比较
  oldWidgetsData.forEach(oldWidget => {
    let newWidget = getWidgetByControlId(newWidgetsData, oldWidget.data.controlId);
    // 如果被删了
    if (!newWidget) {
      warningTxt.push({
        type: 'DELETE',
        widgetName: htmlEncodeReg(oldWidget.widgetName),
        controlName: htmlEncodeReg(oldWidget.data.controlName),
      });
      return false;
    } else if (!config.isWorkSheet) {
      // 如果type不对
      if (oldWidget.data.type !== newWidget.data.type) {
        let oldTypeName = '';
        let newTypeName = '';
        oldWidget.typeArr.forEach(item => {
          if (item.type === oldWidget.data.type) {
            oldTypeName = item.name;
          }
          if (item.type === newWidget.data.type) {
            newTypeName = item.name;
          }
        });
        warningTxt.push({
          type: 'EDIT',
          widgetName: htmlEncodeReg(oldWidget.widgetName),
          controlName: htmlEncodeReg(newWidget.data.controlName),
          oldTypeName: htmlEncodeReg(oldTypeName),
          newTypeName: htmlEncodeReg(newTypeName),
        });
        return false;
      }
      // 证件的enumDefault不对
      if (oldWidget.type === config.WIDGETS.CRED_INPUT.type && oldWidget.data.enumDefault !== newWidget.data.enumDefault) {
        let oldTypeName = '';
        let newTypeName = '';
        oldWidget.certArr.forEach(item => {
          if (item.value === newWidget.data.enumDefault) {
            newTypeName = item.name;
          }
          if (item.value === oldWidget.data.enumDefault) {
            oldTypeName = item.name;
          }
        });
        warningTxt.push({
          type: 'EDIT',
          widgetName: htmlEncodeReg(oldWidget.widgetName),
          controlName: htmlEncodeReg(newWidget.data.controlName),
          oldTypeName: htmlEncodeReg(oldTypeName),
          newTypeName: htmlEncodeReg(newTypeName),
        });
        return false;
      }
      // 如果有options比较options,仅比较有key的老数据
      if (oldWidget.data.options) {
        let optionNames = [];
        oldWidget.data.options.forEach(oldOption => {
          if (oldOption.key && !oldOption.isDeleted) {
            newWidget.data.options.forEach(newOption => {
              if (oldOption.key === newOption.key && newOption.isDeleted) {
                optionNames.push(htmlEncodeReg(oldOption.value));
              }
            });
          }
        });
        if (optionNames.length) {
          warningTxt.push({
            type: 'DELETE_OPTION',
            widgetName: htmlEncodeReg(oldWidget.widgetName),
            controlName: htmlEncodeReg(newWidget.data.controlName),
            optionNames: optionNames,
          });
        }
      }

      // 关联控件
      if (oldWidget.type === config.WIDGETS.RELATION.type && oldWidget.data.enumDefault !== newWidget.data.enumDefault) {
        let defaultArr = config.WIDGETS.RELATION.defaultArr;
        let oldTypeName = _.find(defaultArr, item => item.value === oldWidget.data.enumDefault).name;
        let newTypeName = _.find(defaultArr, item => item.value === newWidget.data.enumDefault).name;

        warningTxt.push({
          type: 'EDIT',
          widgetName: htmlEncodeReg(oldWidget.widgetName),
          controlName: htmlEncodeReg(newWidget.data.controlName),
          oldTypeName: htmlEncodeReg(oldTypeName),
          newTypeName: htmlEncodeReg(newTypeName),
        });
      }
    }
  });
  if (warningTxt.length) {
    return (
      warningTxt
        .map(item => {
          if (item.type === 'DELETE') {
            return `<div class="Font14">
          [<span class="limitTxt">${item.widgetName}</span>]
          <span class="limitTxt Bold">${item.controlName}</span>${_l('被删除')}
      </div>`;
          } else if (item.type === 'EDIT') {
            return `<div class="Font14">
          [<span class="limitTxt">${item.widgetName}</span>]
          <span class="limitTxt Bold">${item.controlName}</span>${_l('的控件类型：')}<span class="limitTxt">${item.oldTypeName}</span>${_l(
              '被修改为'
            )}<span class="limitTxt">${item.newTypeName}</span>
      </div>`;
          } else if (item.type === 'DELETE_OPTION') {
            return (
              `<div class="Font14">
        [<span class="limitTxt">${item.widgetName}</span>]
        <span class="limitTxt Bold">${item.controlName}</span>${_l('的选项内容：')}` +
              item.optionNames
                .map(optionName => `<span class="limitTxt">${optionName}</span>、`)
                .join('')
                .replace(/、$/, '') +
              `${_l('被删除')}</div>`
            );
          }
          return '';
        })
        .join('') +
      `
    <p class="Font14">${config.isWorkSheet ? _l('以上控件被更改或删除，若保存，则表格下现有的记录数据将被') : _l('以上控件被更改或删除，若保存，则项目下现有任务的相关选项数据将被')}<span class="Bold Italic">${_l('删除')}</span>，${_l(
        '是否继续'
      )}？</p>
  `
    );
  }
  return '';
};

// 得到最大的key
export const getSqrtOfOptionsMaxKey = function (options) {
  let maxKey = '';
  options.forEach(item => {
    if (item.key && item.key > maxKey) {
      maxKey = item.key;
    }
  });
  return maxKey;
};

// 错误提示处理
export const getErrorByCode = function (source) {
  switch (source.code) {
    case 2:
      if (source.data === 20) {
        return _l('公式验证失败');
      }
      return _l('输入验证信息失败');
    case 3:
      return _l('指定参数的数据不存在');
    case 7:
      return _l('权限不够');
    case 8:
      return _l('请求超时');
    case 10:
      return _l('数据异常，请勿多窗口编辑或者多人同时编辑，请刷新浏览器重试！');
    default:
      return _l('操作失败，请稍后重试');
  }
};

// 自定义公式返回处理后的array
export const returnCustomDataSource = function (dataSource) {
  let customDatas = dataSource ? dataSource.match(/SUM\([\s\S]*?\)|AVG\([\s\S]*?\)|MIN\([\s\S]*?\)|MAX\([\s\S]*?\)|PRODUCT\([\s\S]*?\)/gi) : [];
  let customSources = _.cloneDeep(dataSource);
  let customDataSource = [];
  let single;
  let intercept;

  // 把字符串处理成数组  格式如下：[string, $id$, MAX($id$,$id$)]
  const returnCustomData = function (customData, customSource) {
    if (customData) {
      customData.forEach((custom, index) => {
        let sub = customSource.indexOf(custom);
        let customLength = custom.length;

        if (sub !== 0) {
          intercept = customSource.slice(0, sub);
          single = intercept.match(/\$[\s\S]*?\$/g);
          if (!single) {
            customDataSource.push(intercept);
          } else {
            returnCustomData(single, intercept);
          }
        }

        customDataSource.push(custom);
        customSource = customSource.slice(sub + customLength);

        if (index === customData.length - 1 && customSource) {
          single = customSource.match(/\$[\s\S]*?\$/g);
          if (!single) {
            customDataSource.push(customSource);
          } else {
            returnCustomData(single, customSource);
          }
        }
      });
    } else {
      single = customSource.match(/\$[\s\S]*?\$/g);
      if (!single) {
        customDataSource.push(customSource);
      } else {
        returnCustomData(single, customSource);
      }
    }
  };

  returnCustomData(customDatas, customSources);

  return customDataSource;
};

// 返回当前公式的值 string
export const returnCustomString = function (sign) {
  let formulaName = '';
  let singles;
  let text = '';
  let dataSource = $('.formulaCustomDetail')
    .children('.singleFormula')
    .map(function (index, widget) {
      // 普通输入框
      if ($(widget).hasClass('singleFormulaText') || $(widget).hasClass('customFormulaInput')) {
        text = $.trim($(widget).text());
        if (index < global.clickFormulaIndex && !text) {
          global.clickFormulaIndex--;
        } else if (sign && index === global.clickFormulaIndex) {
          // 特殊处理插入的情况不与前面的文本合并
          return '$' + text + '$';
        }
        return text;
      } else if ($(widget).hasClass('singleFormulas')) {
        // 常用公式
        formulaName = $(widget)
          .find('.customFormulaName')
          .text();
        singles = $(widget)
          .find('.singleFormula')
          .map(function (i, single) {
            return '$' + $(single).data('id') + '$';
          });
        return formulaName + '(' + singles.get().join(',') + ')';
      } else if ($(widget).data('id')) {
        // 单个选项
        return '$' + $(widget).data('id') + '$';
      }

      return '';
    });
  $('.formulaCustomDetail .customFormulaInput').text(''); // 清空最后的输入框
  return dataSource.get().join('');
};

// 检测公式合法性
export const checkCustomFormula = function (str) {
  // 剔除空白符 公式字符 ，替换成+验证
  str = str.replace(/\s|SUM|AVG|MIN|MAX|PRODUCT/gi, '').replace(/,/g, '+');
  // 错误情况，空字符串
  if (str === '') {
    return false;
  }
  // 错误情况，运算符连续
  if (/[+\-*/]{2,}/.test(str)) {
    return false;
  }
  // 空括号
  if (/\(\)/.test(str)) {
    return false;
  }
  // 错误情况，括号不配对
  let stack = [];
  let i = 0;
  let item;
  for (; i < str.length; i++) {
    item = str.charAt(i);
    if (item === '(') {
      stack.push('(');
    } else if (item === ')') {
      if (stack.length > 0) {
        stack.pop();
      } else {
        return false;
      }
    }
  }
  if (stack.length !== 0) {
    return false;
  }
  // 2个子公式直接没有运算符
  if (/\$\$/.test(str)) {
    return false;
  }
  // 错误情况，(后面是运算符
  if (/\([+\-*/]/.test(str)) {
    return false;
  }
  // 错误情况，)前面是运算符
  if (/[+\-*/]\)/.test(str)) {
    return false;
  }
  // 错误情况，(前面不是运算符
  if (/[^+\-*/]\(/.test(str)) {
    return false;
  }
  // 错误情况，)后面不是运算符
  if (/\)[^+\-*/]/.test(str)) {
    return false;
  }

  return true;
};

// 删除控件的时候验证公式是否受影响
export const checkDeleteFormulaChange = function (id, editWidgets, deleteCallback) {
  let influenceWidgets = [];
  let isFormulaControl = false;
  let controlName;
  editWidgets.forEach(list =>
    list.forEach(widget => {
      if (widget.id === id && (widget.type === 4 || widget.type === 5 || widget.type === 18)) {
        isFormulaControl = true;
        controlName = widget.data.controlName;
      }
    })
  );

  if (isFormulaControl) {
    editWidgets.forEach(list =>
      list.forEach(widget => {
        if (widget.type === 18 && widget.data.dataSource && widget.data.dataSource.indexOf(id) >= 0) {
          influenceWidgets.push(widget);
        }
      })
    );

    // 含有受影响的公式
    if (influenceWidgets.length) {
      let content = `<div class="Font14">${_l('你确定要删除此控件吗？')}</div><div class="mTop15 Font14"><${controlName}>${_l('在以下公式中被使用：')}</div>`;
      let controlNames = _.map(influenceWidgets, widget => {
        return '<' + widget.data.controlName + '>';
      });
      $.DialogLayer({
        DialogBoxID: 'influenceCheck', // 标示ID
        container: {
          header: '',
          content: content + '<div class="Font14">' + controlNames.join(',') + '</div>',
          yesFn: function () {
            deleteCallback();
          },
        },
      });
    } else {
      deleteCallback();
    }
  } else {
    deleteCallback();
  }
};
// 获取绑定的公式组件
export const getBindFormula = function (id, editWidgets) {
  let isFormulaControl = false;

  let data = {
    controlName: '',
    influenceWidgets: [],
  };

  editWidgets.forEach(list =>
    list.forEach(widget => {
      if (widget.id === id && (widget.type === 4 || widget.type === 5 || widget.type === 18)) {
        isFormulaControl = true;
        data.controlName = widget.data.controlName;
      }
    })
  );

  if (isFormulaControl) {
    editWidgets.forEach(list =>
      list.forEach(widget => {
        if (widget.type === 18 && widget.data.dataSource && widget.data.dataSource.indexOf(id) >= 0) {
          data.influenceWidgets.push(widget);
        }
      })
    );
  }

  return data;
};

// 获取绑定的大写金额控件
export const getBindMoneyCn = (id, editWidgets) => {
  let moneyCnList = {};
  let position = null;
  let controlId = null;

  let data = {
    controlName: '',
    influenceWidgets: [],
  };

  editWidgets.forEach((list, row) => {
    list.forEach((widget, col) => {
      if (widget.id === id) {
        position = `$${row},${col}$`;
        if (widget.data && widget.data.controlId) {
          controlId = `$${widget.data.controlId}$`;
        }
        if (widget.data && widget.data.controlName) {
          data.controlName = widget.data.controlName;
        }
      }

      if (widget.type === 25 && widget.data.dataSource) {
        moneyCnList[widget.data.dataSource] = widget;
      }
    });
  });

  if (position || controlId) {
    if (moneyCnList[position]) {
      data.influenceWidgets.push(moneyCnList[position]);
    } else if (moneyCnList[controlId]) {
      data.influenceWidgets.push(moneyCnList[controlId]);
    }
  }

  return data;
};

// 显示删除控件确认 dialog
export const showDeleteConfirmModal = (controlName, influenceWidgets, okCallback) => {
  let content = `
    <div class="Font14">${_l('你确定要删除此控件吗？')}</div>
    <div class="mTop15 Font14"><${controlName}>${_l('在以下控件中被使用：')}</div>
  `;
  let controlNames = _.map(influenceWidgets, widget => {
    return `&lt;${widget.data.controlName}&gt;`;
  });

  $.DialogLayer({
    DialogBoxID: 'influenceCheck', // 标示ID
    container: {
      header: '',
      content: `
        ${content}
        <div class="Font14"> ${controlNames.join(',')}</div>
      `,
      yesFn: () => {
        okCallback();
      },
    },
  });
};

export function dispooseSubmitData(editWidgets, options) {
  let controls = [];
  let sub = 0;
  let _this = this;
  let formControls = [];
  let errorDetailSize = 0;
  let dropDownSize = 0;
  const { formulaState, formulaEditStatus } = options;

  editWidgets = _.cloneDeep(editWidgets);
  if (formulaState.formulaEdit) {
    alert(_l('请先保存正在编辑的公式'), 3);
    return;
  }


  const flattenWidget = _.flatten(editWidgets);

  // 汇总字段验证
  if (_.some(flattenWidget.map(widget => widget.data.type === 37 && !widget.data.dataSource))) {
    alert(_l('汇总字段需要配置关联表'), 3);
    return;
  }

  // 设为标题字段检查
  if (config.isWorkSheet && !_.some(flattenWidget.map(widget => widget.data && widget.data.attribute))) {
    alert(_l('请设置一个标题字段'), 3);
    return;
  }

  // 新公式提交前的验证
  if (formulaEditStatus) {
    alert(_l('请先保存正在编辑的公式'), 3);
    return;
  }

  const formulaWidget = flattenWidget.filter(w => w.type === 31);
  const concatnateWidget = flattenWidget.filter(w => w.type === 32);
  if (_.some(formulaWidget, (widget) => !widget.data.dataSource)) {
    alert(_l('保存失败，公式不能为空'), 3);
    return;
  }
  if (_.some(concatnateWidget, (widget) => !widget.data.dataSource)) {
    alert(_l('保存失败，文本组合不能为空'), 3);
    return;
  }
  if (_.some(formulaWidget, (widget) => _.some(getRePosFromStr(widget.data.dataSource).map(w => !getWidgetById(w.tag, editWidgets))))) {
    alert(_l('保存失败，公式中存在未处理的已删除字段'), 3);
    return;
  }
  if (
    _.some(concatnateWidget, (widget) => _.some(getRePosFromStr(widget.data.dataSource).map(w => !getWidgetById(w.tag, editWidgets) && ['ownerid', 'caid', 'ctime', 'utime'].indexOf(w.tag) < 0)))
  ) {
    alert(_l('保存失败，文本拼接中存在未处理的已删除字段'), 3);
    return;
  }


  // 兼容动画未执行完  空占位符引起的数据bug
  editWidgets.forEach((list, row) =>
    list.forEach(widget => {
      if (
        (list.length === 1 && (widget.type === -1 || widget.type === 0)) ||
        (list.length === 2 && (list[0].type === -1 || list[0].type === 0) && (list[1].type === -1 || list[1].type === 0))
      ) {
        editWidgets.splice(row, 1);
      }
    })
  );

  editWidgets.forEach(list =>
    list.forEach(widget => {
      if (widget.type === 7) {
        if (widget.data.sourceType === 2 && !widget.data.dataSource) {
          dropDownSize++;
        }
      }
    })
  );

  if (dropDownSize > 0) {
    alert(_l('保存失败，单选下拉菜单控件数据源不能为空'), 3);
    return false;
  }

  editWidgets.forEach(list =>
    list.forEach(widget => {
      if (widget.type === 17) {
        let successDetailSize = 0;
        widget.data.controls.forEach(control => {
          if (control.type) {
            successDetailSize++;
          }
        });
        if (successDetailSize === 0) {
          errorDetailSize++;
        }
      }
    })
  );

  if (errorDetailSize > 0) {
    alert(_l('保存失败，明细控件不能为空'), 3);
    return false;
  }

  let moneyCnError = false;

  editWidgets.forEach((list, row) => {
    list.forEach((widget, col) => {
      // 大写金额
      if (widget.enumName === 'MONEY_CN' && !widget.data.dataSource) {
        moneyCnError = true;
      }
    });
  });

  _.cloneDeep(editWidgets).forEach((list, row) =>
    list.forEach((widget, col) => {
      if (widget.type > 0) {
        // 增加位置信息
        let data = widget.data;
        data.row = row;
        data.col = col;
        // 修正整行控件的位置
        if (!widget.data.half) {
          data.col = 0;
        }

        // 添加options的key
        if (data.options && data.options.length) {
          let defaultValue = {};
          let maxSqrt = getSqrtOfOptionsMaxKey(data.options);
          data.options = data.options.map((item, index) => {
            item.index = index + 1;
            if (!item.key && !item.isDeleted) {
              if (maxSqrt) {
                item.key = maxSqrt + '0';
              } else {
                item.key = '1';
              }
              maxSqrt = item.key;
            }
            if (item.checked && item.key) {
              defaultValue[item.key.length] = true;
            } else if (item.key) {
              defaultValue[item.key.length] = false;
            }
            return item;
          });
          let i = 1;
          data.default = '';
          while (i <= maxSqrt.length) {
            if (defaultValue[i]) {
              data.default = '1' + data.default;
            } else {
              data.default = '0' + data.default;
            }
            i++;
          }
          data.default = data.default.replace(/^0*/, '');
        }

        // 明细
        if (data.controls) {
          data.tempId = sub;
          sub++;
          let control = [];

          data.controls.forEach(forms => {
            if (forms.data) {
              // 明细中的公式id处理
              if (forms.type === 18) {
                let sourceArr = _.union(forms.data.dataSource.match(/\$[\s\S]*?\$/g));
                let sign;
                if (sourceArr) {
                  sourceArr.forEach(source => {
                    let id = source.replace(/\$/g, '');
                    data.controls.forEach((dWidget, dRow) => {
                      if (id === dWidget.id) {
                        if (dWidget.data.controlId) {
                          sign = dWidget.data.controlId;
                        } else {
                          sign = dRow;
                        }
                        forms.data.dataSource = forms.data.dataSource.replace(new RegExp(id, 'g'), sign);
                      }
                    });
                  });
                }
                forms.data.dataSource = forms.data.dataSource
                  .replace(/SUM/gi, 'cSUM')
                  .replace(/AVG/gi, 'cAVG')
                  .replace(/MIN/gi, 'cMIN')
                  .replace(/MAX/gi, 'cMAX')
                  .replace(/PRODUCT/gi, 'cPRODUCT');
              }

              // 处理大写金额的 dataSource $ROW,COL$ -> $COL$
              if (forms.type === 25) {
                if (forms.data && forms.data.dataSource) {
                  let id = forms.data.dataSource.replace(/\$/g, '');
                  let sign;
                  _.cloneDeep(data.controls).forEach((detailWidgets, row) => {
                    if (id === detailWidgets.id) {
                      if (detailWidgets.controlId) {
                        sign = widget.data.controlId;
                      } else {
                        sign = row;
                      }
                      forms.data.dataSource = forms.data.dataSource.replace(new RegExp(id, 'g'), sign);
                    }
                  });
                }
                if (!forms.data.dataSource) {
                  moneyCnError = true;
                }
              }

              // 添加options的key
              if (forms.data.options) {
                let defaultValue = {};
                let maxSqrt = getSqrtOfOptionsMaxKey(forms.data.options);
                forms.data.options = forms.data.options.map((item, index) => {
                  item.index = index + 1;
                  if (!item.key && !item.isDeleted) {
                    if (maxSqrt) {
                      item.key = maxSqrt + '0';
                    } else {
                      item.key = '1';
                    }
                    maxSqrt = item.key;
                  }
                  if (item.checked && item.key) {
                    defaultValue[item.key.length] = true;
                  } else if (item.key) {
                    defaultValue[item.key.length] = false;
                  }
                  return item;
                });
                let i = 1;
                forms.data.default = '';
                while (i <= maxSqrt.length) {
                  if (defaultValue[i]) {
                    forms.data.default = '1' + forms.data.default;
                  } else {
                    forms.data.default = '0' + forms.data.default;
                  }
                  i++;
                }
                forms.data.default = forms.data.default.replace(/^0*/, '');
              }

              forms.data.validate = true;
              forms.data.required = forms.required;
              control.push(forms.data);
            }
          });

          data.controls = control;
        }

        if (config.isOA || config.isWorkSheet) {
          Object.keys(widget.OAOptions).forEach(key => {
            data[key] = widget.OAOptions[key] === undefined ? '' : widget.OAOptions[key];
          });
        }
        if (config.isWorkSheet && (data.type === 15 || data.type === 16 || data.type === 17 || data.type === 18) && data.value && !data.default) {
          data.default = data.value;
        }
        if (config.isTask && widget.TASKOptions) {
          Object.keys(widget.TASKOptions).forEach(key => {
            data[key] = widget.TASKOptions[key];
          });
        }

        controls.push(data);
      }
    })
  );

  if (moneyCnError) {
    if (config.isWorkSheet) {
      alert(_l('大写金额控件需关联金额控件'), 3);
    } else {
      alert(_l('大写金额控件需关联金额或公式控件'), 3);
    }
    return false;
  }

  // 处理公式大写金额他表字段数据
  controls.forEach(list => {
    if (list.type === 20 || list.type === 31 || list.type === 32) {
      let sourceArr = _.union(list.dataSource.match(/\$[\s\S]*?\$/g));
      let sign;
      if (sourceArr) {
        sourceArr.forEach(source => {
          let id = source.replace(/\$/g, '');
          _.cloneDeep(editWidgets).forEach((widgets, row) =>
            widgets.forEach((widget, col) => {
              if (id === widget.id) {
                if (widget.data.controlId) {
                  sign = widget.data.controlId;
                } else {
                  sign = row + ',' + col;
                }
                list.dataSource = list.dataSource.replace(new RegExp(id, 'g'), sign);
              }
            })
          );
        });
      }
      if (list.type === 20 || list.type === 31) {
        list.dataSource = list.dataSource
          .replace(/SUM/gi, 'cSUM')
          .replace(/MIN/gi, 'cMIN')
          .replace(/MAX/gi, 'cMAX')
          .replace(/PRODUCT/gi, 'cPRODUCT')
          .replace(/COUNTA/gi, 'cCOUNTA')
          .replace(/ABS/gi, 'cABS')
          .replace(/INT/gi, 'cINT')
          .replace(/MOD/gi, 'cMOD')
          .replace(/ROUNDUP/gi, 'cROUNDUP')
          .replace(/ROUNDDOWN/gi, 'cROUNDDOWN')
          .replace(/ROUND\(/gi, 'cROUND(');
      }
      if (list.type === 20) {
        list.dataSource = list.dataSource.replace(/AVG/gi, 'cAVG');
      } else if (list.type === 31) {
        list.dataSource = list.dataSource.replace(/AVERAGE/gi, 'cAVG');
      }
    } else if (list.type === 25 || list.type === 30 || list.type === 37) {
      let sourceArr = _.union(list.dataSource.match(/\$[\s\S]*?\$/g));
      let sign;
      if (sourceArr) {
        sourceArr.forEach(source => {
          let id = source.replace(/\$/g, '');
          _.cloneDeep(editWidgets).forEach((widgets, row) =>
            widgets.forEach((widget, col) => {
              if (id === widget.id) {
                if (widget.data.controlId) {
                  sign = widget.data.controlId;
                } else {
                  sign = row + ',' + col;
                }
                list.dataSource = list.dataSource.replace(new RegExp(id, 'g'), sign);
              }
            })
          );
        });
      }
    }
  });

  // 处理明细数据
  // @TODO 多余的遍历操作
  controls.forEach(list => {
    if (list.type === 0) {
      formControls.push({
        tempId: list.tempId,
        formId: list.formId || '',
        controls: list.controls,
      });
    }
  });

  // 明细排序处理
  formControls.forEach(item =>
    item.controls.forEach((list, index) => {
      list.innerRow = index;
    })
  );
  return {
    controls,
    formControls,
    editWidgets,
  };
}

// 获取公式或文本拼接的可用控件
export function getAvailableColumn(editWidgets, widget) {
  let availableColumn = _.flatten(editWidgets).filter(a => a.enumName !== 'EDIT_HIDE' && a.id !== widget.id);
  if (widget.type === 32) {
    availableColumn = availableColumn.filter(w =>
      w.type !== config.WIDGETS.SPLIT_LINE.type
      && w.type !== config.WIDGETS.REMARK.type
      && w.type !== config.WIDGETS.RELATION.type
      && w.type !== config.WIDGETS.ATTACHMENT.type
      && w.type !== config.WIDGETS.RELATESHEET.type
      && w.type !== config.WIDGETS.SHEETFIELD.type
      && w.type !== config.WIDGETS.SWITCH.type
    );
  } else if (widget.type === 31) {
    availableColumn = availableColumn.filter(w =>
      w.type === config.WIDGETS.NUMBER_INPUT.type
      || w.type === config.WIDGETS.MONEY_AMOUNT.type
      || w.type === config.WIDGETS.NEW_FORMULA.type
    );
  }
  return availableColumn;
}

// 字段type对比
export function compareType(type, cellControl) {
  if (!cellControl.typeArr) {
    return type === cellControl.data.type;
  } else {
    return cellControl.typeArr.map(t => t.type).indexOf(type) > -1;
  }
}

// 获取空间的文本呈现值
export function formatColumnToText(column) {
  const stringCellList = ['TEXTAREA_INPUT', 'PHONE_NUMBER', 'MONEY_CN', 'CRED_INPUT', 'EMAIL_INPUT', 'AREA_INPUT', 'REMARK'];
  const stringUnitCellList = ['MONEY_AMOUNT', 'NUMBER_INPUT'];
  let { type } = column;
  if (compareType(type, config.WIDGETS['SHEETFIELD']) && column.sourceControlType) {
    type = column.sourceControlType;
  }
  if (!column.value) {
    return '';
  }
  if (_.some(stringCellList.map(key => compareType(type, config.WIDGETS[key])))) {
    return column.value;
  } else if (_.some(stringUnitCellList.map(key => compareType(type, config.WIDGETS[key])))) {
    return (_.isUndefined(column.dot) ? column.value : _.round(column.value, column.dot).toFixed(column.dot)) + (column.unit || '');
  } else if (compareType(type, config.WIDGETS['OPTIONS']) || compareType(type, config.WIDGETS['DROPDOWN'])) {
    return (_.find(column.options, option => option.key === column.value) || {}).value;
  } else if (compareType(type, config.WIDGETS['DATE_INPUT']) || type === 'ctime' || type === 'utime') {
    return type === 15 ? moment(column.value).format('YYYY-MM-DD') : moment(column.value).format('YYYY-MM-DD HH:mm');
  } else if (compareType(type, config.WIDGETS['DATE_TIME_RANGE'])) {
    let times;
    try {
      times = JSON.parse(column.value);
    } catch (err) {
      return '';
    }
    return times.map(time => (time ? moment(time).format(type === 17 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm') : '')).join(' - ');
  } else if (compareType(type, config.WIDGETS['USER_PICKER']) || type === 'ownerid' || type === 'caid') {
    let users;
    try {
      users = JSON.parse(column.value);
    } catch (err) {
      return '';
    }
    return users.map(user => user.fullname).join(',');
  } else if (compareType(type, config.WIDGETS['GROUP_PICKER'])) {
    let groups;
    try {
      groups = JSON.parse(column.value);
    } catch (err) {
      return '';
    }
    return groups.map(group => group.departmentName).join(',');
  } else if (compareType(type, config.WIDGETS['ATTACHMENT'])) {
    let attachments;
    try {
      attachments = JSON.parse(column.value);
    } catch (err) {
      return '';
    }
    return attachments.map(attachment => attachment.originalFilename + attachment.ext).join(',');
  } else if (compareType(type, config.WIDGETS['RELATION'])) {
    let relations;
    try {
      relations = JSON.parse(column.value);
    } catch (err) {
      return '';
    }
    return relations.map(relation => relation.name).join(',');
  } else {
    return column.value;
  }
}

// 通过id 获取控件的值
export function getControlValue(id, editWidgets, worksheetData) {
  const widget = getWidgetById(id, editWidgets);
  if (_.isEmpty(worksheetData)) {
    return undefined;
  }
  if (widget.data.controlId) {
    return worksheetData[widget.data.controlId];
  } else {
    return undefined;
  }
}

// 通过id 获取控件的文本值
export function getControlTextValue(id, editWidgets, worksheetData) {
  const widget = getWidgetById(id, editWidgets);
  if (!widget) {
    return '';
  }
  if (_.isEmpty(worksheetData)) {
    return '';
  }
  if (widget.data.controlId) {
    return formatColumnToText(_.assign({}, widget.data, {
      value: worksheetData[widget.data.controlId],
    })) || '';
  } else {
    return '';
  }
}

/**
 * createWorksheetColumnTag 工作表创建字段标签
 * @param  {string} id 字段 controlId
 * @param  {object} options 配置
 * @return {element} 返回一个dom元素
 */
export function createWorksheetColumnTag(id, options) {
  const { editWidgets, worksheetData, errorCallback, mode, isLast } = options;
  const widget = getWidgetById(id, editWidgets);
  const node = document.createElement('div');
  const value = getControlTextValue(id, editWidgets, worksheetData) || _l('空');
  node.classList.add('columnTag');
  if (!widget) {
    node.classList.add('deleted');
    if (_.isFunction(errorCallback)) {
      errorCallback(1);
    }
  }
  if (mode === 3 && !isLast) {
    node.classList.add('onlytag');
  }
  node.innerHTML = widget ? `
    <div class="columnName">${ widget.data.controlName }</div>
    <div class="columnValue"><div class="ellipsis">${ value }</div></div>
  ` : `
    <div class="columnName">${ _l('该字段已删除') }</div>
  `;
  return node;
}

export function getWidgetById(id, editWidgets) {
  return _.find(_.flatten(editWidgets), w => w.id === id);
}

// 通过拼接value获取拼接过的控件的文本值
export function getConcatedValue(value, editWidgets, worksheetData) {
  return value.replace(/\$.+?\$/g, (matched) => {
    const id = matched.match(/\$(.+?)\$/)[1];
    return getControlTextValue(id, editWidgets, worksheetData);
  });
}


export default {
  classSet,
  createNewWidget,
  strlen,
  saveToStorage,
  getStorage,
  cloneDeepContainer,
  loadDataPoint,
  isOldWidget,
  getEditWidgetsByControls,
  getOptionDefault,
  findWidgetById,
  validateWidgetChange,
  getSqrtOfOptionsMaxKey,
  getErrorByCode,
  returnCustomDataSource,
  returnCustomString,
  checkCustomFormula,
  checkDeleteFormulaChange,
  dispooseSubmitData,
};
