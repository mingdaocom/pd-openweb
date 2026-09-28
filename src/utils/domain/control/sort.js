import _ from 'lodash';

/**
 * 判断字段类型与他表字段配置是否支持列表排序。
 */
export function fieldCanSort(type, control = {}) {
  const canSortTypes = [
    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36, 37, 38, 42, 46, 48, 50, 53,
  ];

  if (control.type === 30 && control.strDefault === '10') {
    return false;
  }

  return _.includes(canSortTypes, type);
}

/**
 * 根据字段类型和检查项文案生成升序、降序选项。
 */
export function getSortData(type, control = {}) {
  const descendingValue = 1; // 降序
  const ascendingValue = 2; // 升序

  if (type === 6 || type === 8 || type === 34 || (type === 29 && control.enumDefault === 2)) {
    return [
      {
        text: '1 → 9',
        value: ascendingValue,
      },
      {
        text: '9 → 1',
        value: descendingValue,
      },
    ];
  } else if (type === 2 || type === 29 || type === 32) {
    return [
      {
        text: 'A → Z',
        value: ascendingValue,
      },
      {
        text: 'Z → A',
        value: descendingValue,
      },
    ];
  } else if (type === 15 || type === 16 || type === 17 || type === 18) {
    return [
      {
        text: _l('最新的在前%05029'),
        value: descendingValue,
      },
      {
        text: _l('最旧的在前%05030'),
        value: ascendingValue,
      },
    ];
  } else if (type === 36) {
    let defaultText = [_l('未选中 → 选中'), _l('选中 → 未选中')];

    if (control.advancedSetting) {
      if (control.advancedSetting.showtype === '1') {
        defaultText = [_l('关闭 → 开启'), _l('开启 → 关闭')];
      }

      if (control.advancedSetting.showtype === '2') {
        defaultText = [_l('否 → 是'), _l('是 → 否')];
      }
    }

    return [
      {
        text: defaultText[0],
        value: ascendingValue,
      },
      {
        text: defaultText[1],
        value: descendingValue,
      },
    ];
  } else {
    return [
      {
        text: _l('升序%05031'),
        value: ascendingValue,
      },
      {
        text: _l('降序%05032'),
        value: descendingValue,
      },
    ];
  }
}

/**
 * 过滤指定隐藏控件，并按需强制保留常用系统字段。
 */
export function filterHidedControls(controls, hidedControlIds = [], forceShowSys = true) {
  return controls.filter(
    c =>
      !_.find(
        hidedControlIds,
        hcid =>
          c.controlId === hcid &&
          !(forceShowSys && _.find(['ownerid', 'caid', 'ctime', 'utime'], syscid => syscid === hcid)),
      ),
  );
}

/** 按给定控件标识顺序重排控件，其余控件保持在末尾。 */
export function sortControlByIds(controls = [], sortedIds = []) {
  if (!sortedIds.length) {
    return controls;
  }

  sortedIds = sortedIds.filter(_.identity);
  const leftControls = controls.filter(c => !_.find(sortedIds, id => (c.controlId || c.data.controlId) === id));
  return sortedIds
    .map(id => _.find(controls, c => (c.controlId || c.data.controlId) === id))
    .filter(_.identity)
    .concat(leftControls);
}

/** 合并有效的既有排序与未排序控件，生成完整控件标识顺序。 */
export function getControlsSorts(controls = [], sortedIds = []) {
  if (!sortedIds.length) {
    return controls.map(c => c?.controlId || c?.data?.controlId).filter(_.identity);
  }

  sortedIds = sortedIds
    .filter(id => _.find(controls, control => (control?.controlId || control?.data?.controlId) === id))
    .filter(_.identity);
  const leftControlIds = controls
    .filter(c => !_.find(sortedIds, id => (c?.controlId || c?.data?.controlId) === id))
    .map(c => c?.controlId || c?.data?.controlId)
    .filter(_.identity);
  return sortedIds.concat(leftControlIds);
}
