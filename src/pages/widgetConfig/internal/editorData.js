import React from 'react';
import cx from 'classnames';
import update from 'immutability-helper';
import _, { find, flatten, get, head, isEmpty, last } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { Support } from 'ming-ui';
import { Modal, Tooltip } from 'ming-ui/antd-components';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { notInsetSectionTab } from 'src/utils/domain/control/capabilities';
import {
  adjustControlSize,
  fixedBottomWidgets,
  genWidgetRowAndCol,
  getBoundRowByTab,
  isTabSheetList,
  putControlByOrder,
} from 'src/utils/domain/control/editorLayout';
import { getControlByControlId } from 'src/utils/domain/control/filters';
import { getPathById, isHaveGap, WHOLE_SIZE } from 'src/utils/domain/control/layout';
import { checkWidgetMaxNumErr } from 'src/utils/domain/control/metadata';
import { ALL_SYS } from 'src/utils/domain/control/widget';
import { getFeatureStatus } from 'src/utils/services/project';
import { DRAG_MODE } from '../config/Drag';
import { ControlTag } from '../styled';
import { batchRemoveItems, insertControlInSameLine } from '../util/drag';
import { isExceedMaxControlLimit } from '../util/editorSetting';

const getCopyDefaultSetting = (advancedSetting = {}) => ({
  dynamicsrc: '',
  defaulttype: advancedSetting.defaulttype === '1' ? '1' : '',
});

const WORKSHEET_OBJECT_ID_REG = /^[a-f0-9]{24}$/i;
const RELATE_WORKSHEET_CONTROL_TYPES = [29, 35, 51];

const isUnsavedControl = (control = {}) => control.controlId && control.controlId.includes('-');

const isBlankSubList = (control = {}) => {
  if (control.type !== 34) return false;

  const { dataSource, controlId } = control;

  if (dataSource && dataSource.includes('-')) return true;
  if (getAdvanceSetting(control, 'detailworksheettype') === '2') return true;
  return _.get(window, `subListSheetConfig.${controlId}.mode`) === 'new';
};

const findInvalidUnsavedRelateControl = (controls = []) => {
  for (const control of controls) {
    if (
      isUnsavedControl(control) &&
      RELATE_WORKSHEET_CONTROL_TYPES.includes(control.type) &&
      control.dataSource &&
      !WORKSHEET_OBJECT_ID_REG.test(control.dataSource)
    ) {
      return control;
    }
  }

  return null;
};

const findInvalidRelateWorksheetControl = (controls = []) => {
  const invalidTopLevel = findInvalidUnsavedRelateControl(controls);

  if (invalidTopLevel) return invalidTopLevel;

  for (const control of controls) {
    if (isBlankSubList(control) && !_.isEmpty(control.relationControls)) {
      const invalidNested = findInvalidUnsavedRelateControl(control.relationControls);

      if (invalidNested) return invalidNested;
    }
  }

  return null;
};

// 获取动态默认值

export const getMsgByCode = ({ code, data, controls }) => {
  if (code === 1) {
    alert(_l('保存成功'));
    return '';
  }

  let errorText = _l('操作失败，请稍后重试');

  switch (code) {
    case 2:
      errorText = data === 20 ? _l('公式验证失败') : _l('输入验证信息失败');
      break;
    case 3:
      errorText = _l('指定参数的数据不存在');
      break;
    case 7:
      errorText = _l('权限不够');
      break;
    case 8:
      errorText = _l('请求超时');
      break;
    case 16:
      const currentItem = _.find(controls, c => c.alias === data);
      errorText = _l('%0别名重复', _.get(currentItem, 'controlName'));
      break;
    default:
      break;
  }

  if (code === 16) {
    alert(
      <span>
        {errorText}
        <Support
          type={3}
          href="https://help.mingdao.com/worksheet/field-property/#syestem-field-alias"
          text={<span className="Font14 Bold">{_l('查看')}</span>}
        />
      </span>,
      2,
    );
  } else {
    alert(errorText, 2);
  }

  return errorText;
};

/** 创建字段编辑器中的原生字段标签节点。 */
export function createWorksheetColumnTag(id, options) {
  const { allControls, errorCallback, mode, isLast } = options;
  const control = getControlByControlId(allControls, id);
  const node = document.createElement('div');
  // const value = getControlTextValue(id, allControls, worksheetData, true) || _l('空');
  node.classList.add('columnTag');
  if (!control) {
    node.classList.add('deleted');
    if (_.isFunction(errorCallback)) {
      errorCallback(1);
    }
  }

  if (mode === 3 && !isLast) {
    node.classList.add('onlytag');
  }

  node.innerHTML = !isEmpty(control)
    ? `
    <div class="columnName">${control.controlName}</div>
  `
    : `
    <div class="columnName">${_l('该字段已删除')}</div>
  `;
  return node;
}

export function genControlTag(allControls, id) {
  const control = getControlByControlId(allControls, id);
  const invalid = isEmpty(control);
  const invalidError = control && control.type === 30 && (control.strDefault || '')[0] === '1';
  return (
    <Tooltip title={!invalid ? '' : <span>{_l('ID: %0', id)}</span>} placement="bottom">
      <ControlTag className={cx({ invalid: invalid || invalidError, Hand: invalid })}>
        {invalid ? _l('字段已删除') : invalidError ? _l('%0(无效类型)', control.controlName) : control.controlName}
      </ControlTag>
    </Tooltip>
  );
}

// 表单保存前校验
export const checkWidgetErrorBeforeSave = (controls = [], originControls = []) => {
  let errorMsg = '';
  let errorNum = 3;

  const invalidRelateControl = findInvalidRelateWorksheetControl(controls);

  if (invalidRelateControl) {
    errorMsg = _l(
      '%0的关联表配置无效，目标表不存在或已被删除，请关联一张有效的工作表后再保存。',
      invalidRelateControl.controlName,
    );
    errorNum = 2;
  }

  for (const data of controls) {
    if (errorMsg) break;
    // 自定义事件校验
    const customEvent = getAdvanceSetting(data, 'custom_event') || [];

    if (customEvent.length > 0) {
      const customActionItems = customEvent.map(({ eventActions = [] } = {}) => {
        return _.reduce(
          eventActions,
          (total, cur) => {
            const actionItems = (cur.actions || [])
              .filter(a => _.includes(['5', '12'], a.actionType))
              .map(a => a.actionItems);
            return total.concat(...actionItems);
          },
          [],
        );
      });

      if (_.some(_.flatten(customActionItems), a => !_.find(controls, c => c.controlId === a.controlId))) {
        errorMsg = _l(`%0字段事件配置异常`, data.controlName);
        errorNum = 2;
        break;
      }
    }

    // 选项校验
    if (_.includes([9, 10, 11], data.type) && !data.dataSource) {
      const noDelOptions = (data.options || []).filter(o => !o.isDeleted);
      const uniqOptions = _.uniqBy(noDelOptions, 'value');
      const originOptions =
        _.get(
          _.find(originControls, o => o.controlId === data.controlId),
          'options',
        ) || [];
      const hasChanged = !_.isEqual(
        (data.options || []).map(d => d.value),
        originOptions.map(o => o.value),
      );

      if (noDelOptions.length !== uniqOptions.length && hasChanged) {
        errorMsg = _l('选项字段存在重复选项');
        break;
      }
    }

    // 自定义字段--引用配置校验
    const reference = getAdvanceSetting(data, 'reference') || [];

    if (!_.isEmpty(reference)) {
      if (reference.some(r => !r.name)) {
        errorMsg = _l('变量名不允许为空');
        break;
      }

      if (_.uniqBy(reference, 'name').length !== reference.length) {
        errorMsg = _l('变量名不允许重复');
        break;
      }
    }
  }

  if (errorMsg) {
    alert(errorMsg, errorNum);
    return true;
  }

  return false;
};

// 如果新增控件在可视区外则滚动至可视区内
export const scrollToVisibleRange = (data, widgetProps) => {
  const { activeWidget } = widgetProps;
  const $contentWrap = document.getElementById('widgetDisplayWrap');
  const $activeWidget = document.getElementById(`widget-${(activeWidget || {}).controlId}`);
  if (!$contentWrap || !$activeWidget) return;
  const rect = $activeWidget.getBoundingClientRect();

  // 如果在可视区外
  if (rect.top < 0 || rect.top > $contentWrap.offsetHeight) {
    const $scrollWrap = $contentWrap.querySelector('.scroll-viewport');

    if ($scrollWrap) {
      setTimeout(() => {
        const $widget = document.getElementById(`widget-${data.controlId}`);
        if (!$widget) return;
        const { top, height } = $widget.getBoundingClientRect();
        $scrollWrap.scrollTop = $scrollWrap.scrollTop + top - height;
      }, 0);
    }
  }
};

// 清除所有原有控件，全部换成新的
export const clearAndSetWidgets = (data, para, widgetProps, callback) => {
  const { setWidgets, globalSheetInfo = {} } = widgetProps;

  // 检查是否超出控件数量限制
  if (isExceedMaxControlLimit([], data.length)) {
    alert(_l('当前表存在的控件已达到最大值，无法添加继续添加新控件!'), 3);
    return;
  }

  // 检查特性版本限制
  const tempData = head(data);

  if (tempData) {
    const featureType = getFeatureStatus(globalSheetInfo.projectId, tempData.featureId);

    if (_.includes([49, 50], tempData.type) && featureType === '2') {
      buriedUpgradeVersionDialog(globalSheetInfo.projectId, tempData.featureId);
      return;
    }
  }

  // 将数据转换为二维数组格式（每个控件单独一行）
  const newWidgets = data.map(item => [item]);

  // 设置新的控件列表
  setWidgets(newWidgets);

  // 执行回调
  if (_.isFunction(callback)) {
    callback();
  }
};

export const handleDeleteWidgetsForMingo = ({ needDeleteWidgets } = {}, widgetProps, callback) => {
  const { widgets, setWidgets } = widgetProps;
  // 根据alias删除控件, alias === needDeleteWidget.alias immutable update
  const newWidgets = update(widgets, {
    $apply: arr =>
      arr.map(inner => inner.filter(w => !needDeleteWidgets.some(d => d.alias === w.alias || d === w.controlId))),
  });
  setWidgets(newWidgets);
  if (_.isFunction(callback)) {
    callback({ newWidgets });
  }
};

// 更新某个属性
export const handleUpdateWidgetsAttribute = ({ needUpdateWidgets } = {}, widgetProps, callback) => {
  const { widgets, setWidgets } = widgetProps;
  const newWidgets = update(widgets, {
    $apply: arr =>
      arr.map(inner => {
        return inner.map(w => {
          const matched = needUpdateWidgets.find(d => d.alias === w.alias);

          if (matched) {
            return { ...w, ...matched };
          }

          return w;
        });
      }),
  });
  setWidgets(newWidgets);
  if (_.isFunction(callback)) {
    setTimeout(() => {
      callback({ newWidgets });
    }, 0);
  }
};

export function batchUpdateWidgetsLayout(layoutOfAllWidgets = {}, widgetProps, callback) {
  const { widgets, setWidgets } = widgetProps;
  // widgets 是原控件，是二维数组，根据row来划分二维数组，同一个row表示同一行
  // layoutOfAllWidgets 所有控件的布局属性 { [widget.controlId]: { row, col, size } }
  // 根据layoutOfAllWidgets对widgets元素col row size进行更新，并且按照新的配置组织数组

  // 1. 扁平化所有控件
  const flattenWidgets = flatten(widgets);

  // 2. 更新每个控件的 row, col, size 属性
  const updatedWidgets = flattenWidgets.map(widget => {
    const layout = layoutOfAllWidgets[widget.controlId];

    if (layout) {
      return {
        ...widget,
        row: layout.row,
        col: layout.col,
        size: layout.size,
      };
    }

    return widget;
  });

  // 3. 按照 row 分组
  const groupedByRow = _.groupBy(updatedWidgets, 'row');

  // 4. 转换为二维数组，每行内按 col 排序
  const newWidgets = Object.keys(groupedByRow)
    .sort((a, b) => Number(a) - Number(b)) // 按 row 排序
    .map(row => {
      return groupedByRow[row].sort((a, b) => (a.col || 0) - (b.col || 0)); // 每行内按 col 排序
    });

  // 5. 更新 widgets
  setWidgets(newWidgets);
  if (_.isFunction(callback)) {
    setTimeout(callback, 100);
  }
}

// 批量添加
export const handleAddWidgets = (data, para = {}, widgetProps, callback) => {
  const { widgets, activeWidget, allControls, setWidgets, setActiveWidget, globalSheetInfo = {} } = widgetProps;
  const { mode, path, location, displayItemType, rowIndex, activePath, isMingo } = para;
  const tempData = head(data);
  const featureType = getFeatureStatus(globalSheetInfo.projectId, tempData.featureId);

  if (_.includes([49, 50], tempData.type) && featureType === '2') {
    buriedUpgradeVersionDialog(globalSheetInfo.projectId, tempData.featureId);
    return;
  }

  if (isExceedMaxControlLimit(allControls, data.length)) {
    alert(_l('当前表存在的控件已达到最大值，无法添加继续添加新控件!'), 3);
    return;
  }

  const getNextActiveWidget = (nextWidgets, item) => {
    const activeItem = getControlByControlId(flatten(nextWidgets), item.controlId);
    return _.isEmpty(activeItem) ? item : activeItem;
  };

  const resortWidgetsByCurrentOrder = nextWidgets => {
    const widgetsWithRowAndCol = genWidgetRowAndCol(nextWidgets);
    return genWidgetRowAndCol(putControlByOrder(flatten(widgetsWithRowAndCol)));
  };

  // 拖拽添加的情况
  if (mode) {
    // 标签页表格拖拽到普通控件中，更改showtype
    if (isTabSheetList(data) && displayItemType === 'common') {
      data = handleAdvancedSettingChange(data, { showtype: '5' });
    }

    // 拖到单独的行
    if (mode === DRAG_MODE.INSERT_NEW_LINE) {
      setWidgets(update(widgets, { $splice: [[rowIndex, 0, data]] }));
      setActiveWidget(data[0]);

      // 标签页拖拽添加，置顶配置同步更新
      if (_.isFunction(callback)) {
        callback();
      }

      return;
    }

    // 拖到行的末尾
    if (mode === DRAG_MODE.INSERT_TO_ROW_END) {
      setWidgets(
        update(widgets, {
          [rowIndex]: {
            $apply: item => {
              const nextRow = (item || []).concat(data);
              return nextRow.map(value => ({ ...value, size: WHOLE_SIZE / nextRow.length }));
            },
          },
        }),
      );
      setActiveWidget(adjustControlSize(widgets[rowIndex], data[0]));
      return;
    }

    if (mode === DRAG_MODE.INSERT_TO_COL) {
      setWidgets(insertControlInSameLine({ widgets, location, dropPath: path, srcItem: data[0] }));
      setActiveWidget(adjustControlSize(widgets[path[0]], data[0]));
      return;
    }
  }

  let newWidgets = [].concat(widgets);
  let lastItem = null;

  data.forEach((item, index) => {
    let currentRowIndex = 0;

    // 没有激活控件或者激活的控件不存在 则直接添加在最后一行
    // 普通控件，分界位置，非普通表单最后
    if (isEmpty(activeWidget) || allControls.findIndex(item => item.controlId === activeWidget.controlId) < 0) {
      currentRowIndex = fixedBottomWidgets(item) ? newWidgets.length - 1 : getBoundRowByTab(widgets) - 1;
    } else {
      // 批量数据添加时，以前一个已添加控件作为激活控件
      let tempActiveWidget = index ? data[index - 1] : activeWidget;
      currentRowIndex = head(getPathById(newWidgets, get(tempActiveWidget, 'controlId')));

      // 批量拖拽移动，path区分,不走以下逻辑
      if (_.isEmpty(activePath)) {
        // 如果激活控件是标签页控件
        if (tempActiveWidget.type === 52) {
          // 不支持的控件,已标签页显示的在底下，其他放入分界位置
          if (notInsetSectionTab(item)) {
            currentRowIndex = fixedBottomWidgets(item) ? currentRowIndex : getBoundRowByTab(widgets) - 1;
          } else {
            const childrenList = getChildWidgetsBySection(allControls, tempActiveWidget.controlId);
            currentRowIndex = currentRowIndex + childrenList.length;
          }
        } else {
          // 当前激活控件非特殊控件，但是添加控件是特殊控件，直接添加末尾
          if (!fixedBottomWidgets(activeWidget) && fixedBottomWidgets(item)) {
            currentRowIndex = newWidgets.length - 1;
          }

          // 当前激活控件特殊控件，但是添加控件是非特殊控件，直接添加在分界线
          if (fixedBottomWidgets(activeWidget) && !fixedBottomWidgets(item)) {
            currentRowIndex = getBoundRowByTab(widgets) - 1;
          }
        }
      }
    }

    // 兼容currentRowIndex为负、全是普通控件的情况,当前控件列表为空时，添加到第一个
    // 不为空添加到最后一个
    if (currentRowIndex < 0) {
      currentRowIndex = newWidgets.length > 0 ? newWidgets.length - 1 : 0;
    }

    // 如果当前激活控件所在行没有空位则另起下一行，否则放到当前行后面
    if (isHaveGap(newWidgets[currentRowIndex], item) && !_.isEmpty(newWidgets)) {
      // 表单为空，直接添加
      newWidgets = _.isEmpty(newWidgets) ? [[item]] : update(newWidgets, { [currentRowIndex]: { $push: [item] } });
    } else {
      newWidgets = update(newWidgets, {
        $splice: [[currentRowIndex + 1, 0, [item]]],
      });
    }

    lastItem = item;
  });

  // 所有控件都添加完成后，统一执行状态更新操作
  newWidgets = resortWidgetsByCurrentOrder(newWidgets);
  setWidgets(newWidgets);
  if (lastItem && !isMingo) {
    const nextActiveWidget = getNextActiveWidget(newWidgets, lastItem);
    setActiveWidget(nextActiveWidget);
    setTimeout(() => {
      scrollToVisibleRange(nextActiveWidget, { ...widgetProps, activeWidget: nextActiveWidget });
    }, 50);
  }

  if (_.isFunction(callback)) {
    callback({ newWidgets });
  }
};

// 批量移动
export const handleMoveWidgets = (data, widgetProps) => {
  const { widgets, activeWidget, allControls, setWidgets, setActiveWidget } = widgetProps;

  if (isExceedMaxControlLimit(allControls, data.length)) {
    alert(_l('当前表存在的控件已达到最大值，无法添加继续添加新控件!'), 3);
    return;
  }

  let newWidgets = widgets;

  let currentRowIndex = head(getPathById(newWidgets, activeWidget.controlId));
  const childrenList = getChildWidgetsBySection(allControls, activeWidget.controlId);

  if (_.isUndefined(currentRowIndex)) {
    currentRowIndex = newWidgets.length - 1;
  }

  currentRowIndex = currentRowIndex + childrenList.length;

  data.map((item, index) => {
    // 如果当前激活控件所在行没有空位则另起下一行，否则放到当前行后面
    if (newWidgets[currentRowIndex] && isHaveGap(newWidgets[currentRowIndex], item)) {
      newWidgets = update(newWidgets, { [currentRowIndex]: { $push: [item] } });
    } else {
      currentRowIndex = currentRowIndex + 1;
      newWidgets = update(newWidgets, { $splice: [[currentRowIndex, 0, [item]]] });
    }

    if (index === data.length - 1) {
      setWidgets(newWidgets);
      setActiveWidget(item);
      setTimeout(() => {
        scrollToVisibleRange(item, { ...widgetProps, activeWidget: item });
      }, 50);
    }
  });
};

export const dealCopyWidgetId = (data = {}) => {
  const newData = {
    ...data,
    attribute: 0,
    controlId: uuidv4(),
    alias: '',
    controlName: _l('%0-复制', data.controlName),
    advancedSetting: { ...data.advancedSetting, custom_event: '', ...getCopyDefaultSetting(data.advancedSetting) },
  };

  let ids = {};

  if (
    data.type === 34 &&
    (_.get(data, 'advancedSetting.detailworksheettype') === '2' ||
      _.get(window.subListSheetConfig[data.controlId], 'mode') === 'new')
  ) {
    const relationControls = (newData.relationControls || []).map(item => {
      if (_.includes(ALL_SYS, item.controlId)) return item;
      const newItem = {
        ...item,
        controlId: uuidv4(),
        advancedSetting: { ...item.advancedSetting, ...getCopyDefaultSetting(item.advancedSetting) },
      };
      ids[item.controlId] = newItem.controlId;
      return newItem;
    });

    let newWidget = JSON.stringify({ ...newData, dataSource: uuidv4(), relationControls });
    Object.keys(ids).forEach(id => {
      const reg = new RegExp(id, 'g');
      newWidget = newWidget.replace(reg, ids[id]);
    });
    newWidget = safeParse(newWidget);
    window.subListSheetConfig[newData.controlId] = {
      ...window.subListSheetConfig[data.controlId],
      sheetInfo: newWidget,
    };
    return newWidget;
  }

  if (data.type === 34 && window.subListSheetConfig[data.controlId]) {
    window.subListSheetConfig[newData.controlId] = {
      ...window.subListSheetConfig[data.controlId],
    };
  }

  return newData;
};

// 获取当前分段控件子布局控件
export const getChildWidgetsBySection = (controls = [], id) => {
  const childControls = controls.filter(i => i.sectionId === id);
  return putControlByOrder(childControls);
};

// 批量复制控件数据处理
export const batchCopyWidgets = (props, selectWidgets = []) => {
  const { widgets, allControls, queryConfigs, setActiveWidget, setWidgets } = props;

  for (var i = 0; i < selectWidgets.length; i++) {
    const err = checkWidgetMaxNumErr(selectWidgets[i], [...allControls, ...selectWidgets.slice(0, i)]);

    if (err) {
      alert(err, 3);
      return;
    }
  }

  const copyWidgets = [];
  let childCount = 0;
  let newWidgets = widgets;
  let sectionIds = {};
  let newActiveWidget = {};

  selectWidgets.forEach(item => {
    copyWidgets.push(item);
    if (item.type === 52 && get(item, 'relationControls.length')) {
      copyWidgets.push(...item.relationControls);
    }
  });

  const orderCopyWidgets = putControlByOrder(copyWidgets);

  orderCopyWidgets.forEach(row => {
    const currentRow = head(getPathById(newWidgets, get(last(row), 'controlId')));
    const dealRow = row.map(data => {
      let dealItem = dealCopyWidgetId(data);

      // 替换分段内字段sectionId
      if (sectionIds[dealItem.sectionId]) {
        dealItem.sectionId = sectionIds[dealItem.sectionId];
      } else {
        // 没有sectionId,清空childCount,防止插入位置不对
        childCount = 0;
      }

      // 工作表查询配置复制
      const currentQuery = find(queryConfigs, queryItem => queryItem.controlId === data.controlId);

      if (currentQuery) {
        dealItem = handleAdvancedSettingChange(dealItem, getCopyDefaultSetting(dealItem.advancedSetting));
      }
      // currentQuery && newQueries.push({ ...currentQuery, id: `${uuidv4()}`, controlId: dealItem.controlId });

      if (data.type === 52) {
        // 缓存sectionId
        sectionIds[data.controlId] = dealItem.controlId;
        childCount = get(data, 'relationControls.length');
      }

      return dealItem;
    });
    newActiveWidget = last(dealRow);
    newWidgets = update(newWidgets, {
      $splice: [[currentRow + childCount + 1, 0, dealRow]],
    });
  });

  if (isExceedMaxControlLimit(flatten(newWidgets))) return;

  setActiveWidget(newActiveWidget);
  setWidgets(newWidgets);
  return;
};

// 批量设置属性
export const batchResetWidgets = (props, selectWidgets = []) => {
  let { widgets, setWidgets } = props;
  selectWidgets.forEach(item => {
    const [row, col] = getPathById(widgets, item.controlId);
    widgets = update(widgets, { [row]: { [col]: { $set: item } } });
  });

  setWidgets(widgets);
};

// 删除标签页
export const deleteSection = ({ widgets = [], data }, props) => {
  const { setActiveWidget, setWidgets } = props;
  Modal.confirm({
    title: <span className="textError">{_l('删除标签？')}</span>,
    content: _l('标签页内字段将移动到外部，不会被删除'),
    okText: _l('删除'),
    okButtonProps: {
      danger: true,
    },
    onOk: () => {
      // 先删除原来控件
      const deleteWidgets = [data, ...data.relationControls];
      let batchDeleteWidgets = batchRemoveItems(widgets, deleteWidgets);
      const addWidgets = (data.relationControls || []).map(i => ({
        ...i,
        sectionId: '',
      }));
      const activeWidget = last(addWidgets);

      // 将内部字段移到外部，拼到普通字段后
      if (addWidgets.length) {
        const boundRow = getBoundRowByTab(batchDeleteWidgets);
        batchDeleteWidgets.splice(
          boundRow > -1 ? boundRow : batchCopyWidgets.length,
          0,
          ...putControlByOrder(addWidgets),
        );
      }

      setWidgets(batchDeleteWidgets);
      if (activeWidget) {
        setActiveWidget(activeWidget);
        setTimeout(() => {
          scrollToVisibleRange(activeWidget, {
            ...props,
            activeWidget,
          });
        }, 50);
      } else {
        setActiveWidget({});
      }

      return;
    },
  });
};

// shift连选处理
export const batchShiftWidgets = props => {
  const { batchActive = [], data, widgets = [], setBatchActive } = props;
  const startWidget = last(batchActive);

  if (startWidget && data) {
    const [startRow, startCol] = getPathById(widgets, startWidget.controlId);
    const [endRow, endCol] = getPathById(widgets, data.controlId);
    const newBatchWidgets = [];

    for (var i = 0; i < widgets.length; i++) {
      const row = widgets[i];

      for (var j = 0; j < row.length; j++) {
        if (
          (i === Math.min(startRow, endRow) && j >= (startRow > endRow ? endCol : startCol)) ||
          (i === Math.max(startRow, endRow) && j <= (startRow > endRow ? startCol : endCol))
        ) {
          newBatchWidgets.push(widgets[i][j]);
        } else if (i > Math.min(startRow, endRow) && i < Math.max(startRow, endRow)) {
          newBatchWidgets.push(...row);
        }
      }
    }

    const filterBatchWidgets = _.uniq(newBatchWidgets.filter(i => i.type !== 52).filter(_.identity));

    if (filterBatchWidgets.length > 0) {
      setBatchActive(filterBatchWidgets);
    }
  }
};
