import React, { useState, useEffect } from 'react';
import { Dropdown } from 'ming-ui';
import { SettingItem } from '../../styled';

const RULE_CONFIG = [
  { text: _l('当前条件无筛选结果'), value: 3 },
  { text: _l('忽略此条件（当全部忽略时，返回所有记录）'), value: 1 },
  { text: _l('忽略此条件（当全部忽略时，返回无结果）'), value: 2 },
  { text: _l('查询空值'), value: 4 },
];

const isDynamicValue = (filters = []) => {
  for (const f of filters) {
    if (f.isGroup) {
      return _.some(f.groupFilters || [], g => !_.isEmpty(g.dynamicSource) || g.isDynamicsource);
    }
    return !_.isEmpty(f.dynamicSource) || f.isDynamicsource;
  }
};

export default function EmptyRuleConfig({ filters, handleChange }) {
  const [emptyRule, setRule] = useState(null);

  useEffect(() => {
    if (_.isNull(emptyRule)) {
      const saveValue = !_.isEmpty(_.get(filters, '0.groupFilters'))
        ? _.get(filters, '0.groupFilters.0.emptyRule')
        : _.get(filters, '0.emptyRule');
      const originEmptyRule = filters.length > 0 ? 0 : 3;
      setRule(_.isUndefined(saveValue) ? originEmptyRule : saveValue);
    }
  }, [filters.length]);

  useEffect(() => {
    handleChange(emptyRule);
  }, [emptyRule]);

  if (!isDynamicValue(filters)) return null;

  return (
    <SettingItem className="mTop10">
      <div className="settingItemTitle">{_l('当条件使用的动态值为空时，如何处理？')}</div>
      <Dropdown
        border
        value={emptyRule || undefined}
        data={RULE_CONFIG}
        onChange={value => {
          if (value === emptyRule) return;
          setRule(value);
        }}
      />
    </SettingItem>
  );
}
