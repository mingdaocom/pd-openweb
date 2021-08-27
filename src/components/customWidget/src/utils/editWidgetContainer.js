import config from '../config';
import global from '../config/globalConfig';
import _ from 'lodash';
import { createNewWidget, returnCustomDataSource, returnCustomString } from './util';
const EDIT_WIDGET_COUNT = config.EDIT_WIDGET_COUNT;
const EDIT_HIDE = config.WIDGETS.EDIT_HIDE;
const EDIT_FILLER = config.WIDGETS.EDIT_FILLER;

export default class EditWidgetContainer {
  constructor() {
    let container = [];
    this.container = container;
    this.snap = [];
  }

  setSnap() {
    this.snap = _.cloneDeep(this.container);
  }

  changeContainer(data) {
    this.container = data;
    this.snap = _.cloneDeep(this.container);
  }

  removeFiller() {
    this.container.forEach((item, index) => {
      if (item.type === EDIT_FILLER.type) {
        this.container.splice(index, 1);
        return false;
      }
    });
  }

  insertFiller(filler, location) {
    let { row, col, position } = location;
    let widgetList = this.container[row];
    if (widgetList.length === 3 && (widgetList[0].type == EDIT_HIDE.type || widgetList[1].type == EDIT_HIDE.type)) {
      // 特殊情况，一个half的filler一个half的widget时，会多一个不占位置的hide，以便filler移走后占位置
      col--;
    }
    this.clearAllFiller();
    // 如果已经是空行，则把空行清除
    _.remove(this.container, (item, index) => {
      return (
        !item.filter(widget => {
          return widget.type > 0;
        }).length && index !== row
      );
    });
    if (this.isFull(widgetList) || !filler.data.half) {
      this.spliceNewList(filler, row, col, position);
    } else if (col === 1) {
      widgetList.push(filler);
    } else {
      widgetList.unshift(filler);
    }
  }

  insertFillerBottom(filler) {
    this.clearAllFiller();
    let lastWidgetList = this.container[this.container.length - 1];
    // 如果container是空数组
    if (lastWidgetList === undefined) {
      this.spliceNewList(filler, 0, 0);
    } else if (this.isFull(lastWidgetList) || !filler.data.half) {
      this.spliceNewList(filler, this.container.length, 0);
    } else if (lastWidgetList.length === 1 && lastWidgetList[0].type === EDIT_HIDE.type) {
      // 拖进最后一排又拖走
      lastWidgetList.unshift(filler);
    } else {
      lastWidgetList.splice(1, 0, filler);
    }
  }

  // 增加一个新行
  spliceNewList(widget, row, col, position) {
    if (widget.data.half) {
      if (col === 0) {
        if (position === 'RIGHT') {
          this.container.splice(row, 0, [createNewWidget('EDIT_HIDE'), widget]);
        } else {
          this.container.splice(row, 0, [widget, createNewWidget('EDIT_HIDE')]);
        }
      } else {
        this.container.splice(row, 0, [createNewWidget('EDIT_HIDE'), widget]);
      }
    } else {
      this.container.splice(row, 0, [widget]);
    }
  }

  // 判断一个widgetList是不是满了
  isFull(widgetList) {
    let count = 0;
    if (widgetList === undefined) {
      return true;
    }
    widgetList.forEach(widget => {
      if (widget.type > 0) {
        if (widget.data.half) {
          count++;
        } else {
          count += 2;
        }
      }
    });
    return count === 2;
  }

  // 清除某行填充块
  clearListFiller(widgetList) {
    _.remove(widgetList, widget => {
      return widget.type === EDIT_FILLER.type;
    });
  }

  // 清除掉填充块，恢复hover之前的状态，每次插入前都需调用
  clearAllFiller() {
    this.container.forEach(widgetList => {
      this.clearListFiller(widgetList);
    });
    _.remove(this.container, list => !list.length);
  }

  clearListHide(widgetList) {
    _.remove(widgetList, widget => {
      return widget.type === EDIT_HIDE.type;
    });
  }

  clearAllHide() {
    _.remove(this.container, widgetList => {
      if ((widgetList.length === 1 && widgetList[0].type === -1) || widgetList.reduce((pre, cur) => pre.type + cur.type) === -2) {
        return true;
      }
    });
    this.container.forEach(widgetList => {
      if (widgetList.length > 2) {
        this.clearListHide(widgetList);
      }
    });

    this.setSnap();
  }

  insertWidget(widget) {
    this.clearAllHide();
    this.container = this.container.map(widgetList => {
      return widgetList.map(item => {
        if (item.type === EDIT_FILLER.type) {
          return widget;
        }
        return item;
      });
    });
    this.setSnap();
  }

  resetEditBox() {
    this.container = _.cloneDeep(this.snap);
  }

  fillLocation(location) {
    let { row, col } = location;
    let half = this.container[row][col].data.half;
    this.container[row][col] = createNewWidget('EDIT_FILLER', {
      data: {
        half,
      },
    });
    let haveHalfWidget = false;
    this.container[row].forEach(item => {
      if (item.type > 0) {
        haveHalfWidget = true;
      }
    });
    if (haveHalfWidget) {
      this.container[row].splice(col, 0, createNewWidget('EDIT_HIDE'));
    }
  }

  addBottomWidget(widget) {
    let lastList = this.container[this.container.length - 1];
    if (!widget.data.half) {
      this.container.push([widget]);
    } else if (!this.isFull(lastList) && lastList[0].type !== EDIT_HIDE.type) {
      this.container[this.container.length - 1][1] = widget;
    } else {
      this.container.push([widget, createNewWidget('EDIT_HIDE')]);
    }
    this.setSnap();
  }

  changeWidgetData(id, data) {
    this.container.map(widgetList =>
      widgetList.map(widget => {
        if (widget.id === id) {
          widget.data = Object.assign(widget.data, data);
        }
        return widget;
      })
    );
  }

  changeWidgetHalf(id, half) {
    this.container.forEach((widgetList, row) =>
      widgetList.forEach((widget, col) => {
        if (widget.id === id && widget.data.half !== half) {
          widget.data.half = half;
          if (half === false) {
            // 半行变整行
            this.container[row][col] = createNewWidget('EDIT_HIDE');
            if (col === 0) {
              this.container.splice(row, 0, [widget]);
            } else {
              this.container.splice(row + 1, 0, [widget]);
            }
          } else {
            // 整行变半行
            this.container[row] = [widget, createNewWidget('EDIT_HIDE')];
          }
        }
      })
    );

    // 处理空行问题
    this.container.forEach((widgetList, index) => {
      if (widgetList.length === 2 && widgetList[0].type === -1 && widgetList[1].type === -1) {
        this.container.splice(index, 1);
      }
    });
  }

  changeWidget(id, widget) {
    this.container.map(widgetList =>
      widgetList.map(item => {
        if (item.id === id) {
          item = Object.assign(item, widget);
        }
        return item;
      })
    );
  }

  changeOAOptions(id, data) {
    this.container.map(widgetList =>
      widgetList.map(widget => {
        if (widget.id === id) {
          widget = Object.assign(widget.OAOptions, data);
        }
        return widget;
      })
    );
  }

  setWorksheetAttribute(id, value) {
    this.container.map(widgetList =>
      widgetList.map(widget => {
        delete widget.data.attribute;
        if (widget.id === id) {
          widget.data.attribute = value ? 1 : 0;
        }
        return widget;
      })
    );
  }

  changeTASKOptions(id, data) {
    this.container.map(widgetList =>
      widgetList.map(widget => {
        if (widget.id === id) {
          widget = Object.assign(widget.TASKOptions, data);
        }
        return widget;
      })
    );
  }

  getWidgetById(id) {
    let widget;
    this.container.forEach(widgetList =>
      widgetList.forEach(item => {
        if (item.id === id) {
          widget = item;
          return false;
        }
      })
    );
    return widget;
  }

  deleteWidget(id) {
    let dataSource = `$${id}$`;

    this.container = this.container.map(widgetList =>
      widgetList.map(widget => {
        if (widget.id === id) {
          if (widget.data.controlId) {
            dataSource = `$${widget.data.controlId}$`;
          }

          return createNewWidget('EDIT_HIDE');
        }
        return widget;
      })
    );

    // 循环控件替换大写金额中的dataSource
    this.container.forEach(function (widgetList, i) {
      widgetList.forEach(function (item, j) {
        if (item.type === 25 && item.data.dataSource && item.data.dataSource.indexOf(dataSource) >= 0) {
          item.data.dataSource = '';
          item.data.hint = '';
        }
      });
    });
    this.clearAllHide();
  }

  emptyToPrev() {
    this.container.forEach(list =>
      list.forEach(widget => {
        if (widget.id === config.dataCopy.id) {
          widget.data = config.dataCopy.data;
        }
      })
    );
  }

  // 高亮控件
  seleteHighWidght(id) {
    let dataSource;
    let enumDefault;
    this.container.forEach(list =>
      list.forEach(widget => {
        if (widget.id === id) {
          dataSource = widget.data.dataSource;
          enumDefault = widget.data.enumDefault;
        }
      })
    );
    // 控件有三种状态 undefined：禁用   true：已选   false：未选
    this.container.forEach(list =>
      list.forEach(widget => {
        // 4: 数值  5：金额   18：公式  19：时间段   当前的不能选中
        if ((widget.type === 4 || widget.type === 5 || widget.type === 18 || widget.type === 19) && widget.id !== id) {
          if (dataSource.indexOf(widget.id) >= 0 && enumDefault > 1) {
            // 已存在的并且不是自定义，自定义允许多次选择
            widget.highLight = true;
          } else {
            widget.highLight = false;
          }
        } else {
          widget.highLight = undefined;
        }
      })
    );
  }

  // 常用公式单个添加
  seleteSingleWidghtFormula(id) {
    this.container.forEach(widgetList =>
      widgetList.forEach(widget => {
        if (widget.id === global.selectFormulaId) {
          let formulaName = _.find(config.formulaType, formula => formula.type === widget.data.enumDefault).formulaName;
          let dataSource = [];
          if (widget.data.dataSource && widget.data.dataSource.replace(/\(|\)/g, '').replace(formulaName, '')) {
            dataSource = widget.data.dataSource
              .replace(/\(|\)/g, '')
              .replace(formulaName, '')
              .split(',');
          }
          let selectId = '$' + id + '$';
          // 当前已存在的移除，不存在的添加
          if (dataSource.indexOf(selectId) >= 0) {
            _.remove(dataSource, i => i === selectId);
          } else {
            dataSource.push(selectId);
          }

          // 存在公式id 处理成相应的 MAX($xxx$,$xxx$) 这种格式
          if (dataSource.length) {
            widget.data.dataSource = formulaName + '(' + dataSource.join(',') + ')';
          } else {
            widget.data.dataSource = '';
          }

          return widget;
        }
      })
    );

    // 添加移除之后切换高亮
    this.seleteHighWidght(global.selectFormulaId);
  }

  // 自定义公式添加
  seleteSingleWidghtCustomFormula(id) {
    let formulaWidget = '';
    let dataSource = '';
    let leftContent = global.cursorContent.slice(0, global.caretPos); // 当前光标左节点内容
    let rightContent = global.cursorContent.slice(global.caretPos); // 当前光标右节点内容
    this.container.forEach(widgetList =>
      widgetList.forEach(widget => {
        if (widget.id === global.selectFormulaId) {
          formulaWidget = widget; // 当前公式的数据
        }
      })
    );

    dataSource = returnCustomDataSource(returnCustomString(true));
    let currentData = dataSource[global.clickFormulaIndex];

    // 常用公式集合中添加
    if (
      currentData &&
      (currentData.indexOf('SUM') >= 0 ||
        currentData.indexOf('AVG') >= 0 ||
        currentData.indexOf('MIN') >= 0 ||
        currentData.indexOf('MAX') >= 0 ||
        currentData.indexOf('PRODUCT') >= 0)
    ) {
      let formulaName = currentData.match(/[\s\S]*?\(/)[0]; // 公式名称
      let sing = currentData.replace(/[\s\S]*?\(|\)/gi, ''); // 公式内的项 string
      let formulaArray = sing ? sing.split(',') : []; // 转义成数组
      formulaArray.push('$' + id + '$'); // 直接添加新的项
      dataSource[global.clickFormulaIndex] = formulaName + formulaArray.join(',') + ')';
    } else {
      dataSource.splice(global.clickFormulaIndex, 1, leftContent, '$' + id + '$', rightContent); // 当前的节点的内容替换成新的内容
      if (leftContent) {
        // 左节点存在内容光标往后去2个位置
        global.clickFormulaIndex = global.clickFormulaIndex + 2;
      } else {
        global.clickFormulaIndex++;
      }
    }

    formulaWidget.data.dataSource = dataSource.join('');
  }
}
