import _ from 'lodash';

const IGNORE_RENDER_COMPARE_KEYS = new Set(['child']);
const ALWAYS_UPDATE_RENDER_CONTROL_TYPES = new Set([29, 34]);
const IGNORE_WIDGET_COMPARE_PROP_KEYS = new Set([
  'controlProps',
  'data',
  'errorItems',
  'filledByAiMap',
  'loadingItems',
  'rules',
  'searchConfig',
  'tabControlProp',
  'uniqueErrorItems',
]);
const ALWAYS_RENDER_CONTROL_TYPES = new Set([29, 34]);
const FORM_DATA_DEPENDENT_CONTROL_TYPES = new Set([14, 15, 16, 26, 27, 35, 43, 45, 46, 47, 48, 49, 50, 51]);
// 查询记录依赖其他字段生成动态筛选条件，使用 renderData 作为字段值变化的可靠渲染信号。
const RENDER_DATA_DEPENDENT_CONTROL_TYPES = new Set([22, 51]);

/** 对渲染值执行引用比较，并对数组和普通对象执行深比较。 */
export const isSameRenderValue = (prevValue, nextValue) => {
  if (Object.is(prevValue, nextValue)) {
    return true;
  }

  if ((_.isArray(prevValue) || _.isPlainObject(prevValue)) && (_.isArray(nextValue) || _.isPlainObject(nextValue))) {
    return _.isEqual(prevValue, nextValue);
  }

  return false;
};

/** 浅比较对象自身属性。 */
export const isShallowEqual = (prev = {}, next = {}) => {
  if (Object.is(prev, next)) return true;

  const prevKeys = Object.keys(prev);
  const nextKeys = Object.keys(next);

  return prevKeys.length === nextKeys.length && prevKeys.every(key => Object.is(prev[key], next[key]));
};

/** 当浅层内容未变化时复用缓存中的旧引用。 */
export const getStableCachedValue = (cache, key, nextValue) => {
  const prevValue = cache[key];

  if (!_.isUndefined(prevValue) && isShallowEqual(prevValue, nextValue)) {
    return prevValue;
  }

  cache[key] = nextValue;
  return nextValue;
};

/** 比较字段渲染项的全部属性。 */
export const isSameRenderItem = (prevItem = {}, nextItem = {}) => {
  if (Object.is(prevItem, nextItem)) return true;

  const itemKeys = _.uniq(Object.keys(prevItem).concat(Object.keys(nextItem)));
  return itemKeys.every(key => isSameRenderValue(prevItem[key], nextItem[key]));
};

/** 创建桌面端或移动端字段包装器使用的 memo props 比较函数。 */
export const createWidgetPropsEqual = (
  compareFunctionPropKeys,
  isCustomControl = () => false,
  additionalIgnorePropKeys = new Set(),
) => {
  const getItemType = props => _.get(props, 'item.type');
  const shouldAlwaysRender = (prevProps, nextProps) =>
    ALWAYS_RENDER_CONTROL_TYPES.has(getItemType(prevProps)) || ALWAYS_RENDER_CONTROL_TYPES.has(getItemType(nextProps));
  const needFormData = props =>
    FORM_DATA_DEPENDENT_CONTROL_TYPES.has(getItemType(props)) || isCustomControl(props.item || {});
  const needRawRenderData = props => RENDER_DATA_DEPENDENT_CONTROL_TYPES.has(getItemType(props));
  const shouldIgnoreProp = (key, prevProps, nextProps) =>
    IGNORE_WIDGET_COMPARE_PROP_KEYS.has(key) ||
    additionalIgnorePropKeys.has(key) ||
    (key === 'formData' && !needFormData(prevProps) && !needFormData(nextProps)) ||
    (key === 'renderData' && !needRawRenderData(prevProps) && !needRawRenderData(nextProps));

  return (prevProps, nextProps) => {
    if (shouldAlwaysRender(prevProps, nextProps)) return false;

    const propKeys = _.uniq(Object.keys(prevProps).concat(Object.keys(nextProps)));

    return propKeys.every(key => {
      if (key === 'item') return isSameRenderItem(prevProps.item, nextProps.item);
      if (shouldIgnoreProp(key, prevProps, nextProps)) return true;
      if (key === 'renderData') return Object.is(prevProps.renderData, nextProps.renderData);
      if (_.isFunction(prevProps[key]) && _.isFunction(nextProps[key]) && !compareFunctionPropKeys.has(key))
        return true;

      return isSameRenderValue(prevProps[key], nextProps[key]);
    });
  };
};

const isSameRenderControl = (prevControl = {}, nextControl = {}) => {
  const keys = _.uniq(Object.keys(prevControl).concat(Object.keys(nextControl))).filter(
    key => !IGNORE_RENDER_COMPARE_KEYS.has(key),
  );

  return keys.every(key => isSameRenderValue(prevControl[key], nextControl[key]));
};

const isSameControlListItem = (prevControl = {}, nextControl = {}) => {
  if (Object.is(prevControl, nextControl)) return true;

  const keys = _.uniq(Object.keys(prevControl).concat(Object.keys(nextControl))).filter(key => key !== 'child');

  return (
    keys.every(key => Object.is(prevControl[key], nextControl[key])) &&
    isSameControlList(prevControl.child, nextControl.child)
  );
};

export const isSameControlList = (prevControls = [], nextControls = []) => {
  if (Object.is(prevControls, nextControls)) return true;
  if (prevControls.length !== nextControls.length) return false;

  return prevControls.every((control, index) => isSameControlListItem(control, nextControls[index]));
};

export const reuseRenderData = (prevRenderData = [], nextRenderData = [], compareControlIds) => {
  if (!prevRenderData.length || prevRenderData.length !== nextRenderData.length) {
    return nextRenderData;
  }

  const prevControlMap = prevRenderData.reduce((map, item) => {
    map[item.controlId] = item;
    return map;
  }, {});
  let changed = false;

  const renderData = nextRenderData.map((item, index) => {
    const prevItem = prevControlMap[item.controlId];

    if (!prevItem) {
      changed = true;
      return item;
    }

    if (_.get(prevRenderData, [index, 'controlId']) !== item.controlId) {
      changed = true;
    }

    if (ALWAYS_UPDATE_RENDER_CONTROL_TYPES.has(prevItem.type) || ALWAYS_UPDATE_RENDER_CONTROL_TYPES.has(item.type)) {
      changed = true;
      return item;
    }

    if (compareControlIds && !compareControlIds.has(item.controlId)) {
      return prevItem;
    }

    if (isSameRenderControl(prevItem, item)) {
      return prevItem;
    }

    changed = true;
    return item;
  });

  return changed ? renderData : prevRenderData;
};

export const mergePartialRuleRenderData = ({
  prevRenderData = [],
  nextRenderData = [],
  affectedControlIds = [],
  updateControlIds = [],
  currentRuleControlIds = [],
}) => {
  if (!prevRenderData.length || prevRenderData.length !== nextRenderData.length) {
    return { renderData: nextRenderData };
  }

  const compareControlIds = new Set(
    affectedControlIds.concat(updateControlIds).concat(currentRuleControlIds).filter(Boolean),
  );
  const prevControlMap = prevRenderData.reduce((map, item) => {
    map[item.controlId] = item;
    return map;
  }, {});
  const nextControlMap = nextRenderData.reduce((map, item) => {
    map[item.controlId] = item;
    return map;
  }, {});
  const sectionControlsMap = nextRenderData.reduce((map, item) => {
    if (item.sectionId) {
      map[item.sectionId] = map[item.sectionId] || [];
      map[item.sectionId].push(item.controlId);
    }

    return map;
  }, {});

  nextRenderData.forEach(item => {
    const prevItem = prevControlMap[item.controlId];

    if (prevItem && prevItem.eventPermissions !== item.eventPermissions) {
      compareControlIds.add(item.controlId);
    }
  });

  Array.from(compareControlIds).forEach(controlId => {
    const control = nextControlMap[controlId];

    if (control?.sectionId) {
      compareControlIds.add(control.sectionId);
    }

    if (control?.type === 52) {
      (sectionControlsMap[controlId] || []).forEach(childControlId => compareControlIds.add(childControlId));
    }
  });

  const renderData = nextRenderData.map(item => {
    const prevItem = prevControlMap[item.controlId];

    if (
      !prevItem ||
      compareControlIds.has(item.controlId) ||
      ALWAYS_UPDATE_RENDER_CONTROL_TYPES.has(prevItem.type) ||
      ALWAYS_UPDATE_RENDER_CONTROL_TYPES.has(item.type)
    ) {
      return item;
    }

    return prevItem;
  });

  return { renderData, compareControlIds };
};
