import React from 'react';
import _ from 'lodash';
import { Select } from 'ming-ui/antd-components';
import { getControlTypeName } from '../../../utils';

export default ({ controls, sorts, updateSource }) => {
  const renderTitle = controlId => {
    return <span>{_.find(controls, item => item.controlId === controlId).controlName}</span>;
  };

  let ruleSort = [];
  const ruleControls = (controls || [])
    .filter(
      item => _.includes([2, 6, 8, 15, 16, 31, 37, 38, 46], item.type) || (item.type === 29 && item.enumDefault === 2),
    )
    .map(item => {
      return {
        label: (
          <div className="ellipsis">
            <span className="field">[{getControlTypeName(item)}]</span>
            <span>{item.controlName}</span>
          </div>
        ),
        value: item.controlId,
        searchText: item.controlName,
      };
    });

  sorts = sorts.length && controls.find(item => item.controlId === sorts[0].controlId) ? sorts : [];

  if (sorts.length) {
    const { type, enumDefault, enumDefault2 } = controls.find(item => item.controlId === sorts[0].controlId);

    if (
      _.includes([6, 8, 31], type) ||
      (type === 29 && enumDefault === 2) ||
      (type === 37 && enumDefault2 === 6) ||
      (type === 38 && enumDefault === 1)
    ) {
      ruleSort = [
        { label: '1 → 9', value: true },
        { label: '9 → 1', value: false },
      ];
    } else if (type === 2) {
      ruleSort = [
        { label: _l('A → Z'), value: true },
        { label: _l('Z → A'), value: false },
      ];
    } else if (type === 46) {
      ruleSort = [
        { label: _l('最早的在前'), value: true },
        { label: _l('最晚的在前'), value: false },
      ];
    } else {
      ruleSort = [
        { label: _l('最新的在前'), value: false },
        { label: _l('最旧的在前'), value: true },
      ];
    }
  }

  return (
    <div className="mTop15 flexRow">
      <Select
        allowClear
        className="flowDropdown flex"
        disabled={!ruleControls.length}
        options={ruleControls}
        value={sorts.length ? sorts[0].controlId : undefined}
        showSearch
        optionFilterProp="searchText"
        labelRender={() => !!sorts.length && sorts[0].controlId && renderTitle(sorts[0].controlId)}
        placeholder={_l('选择字段')}
        onChange={controlId =>
          updateSource({
            sorts: controlId
              ? [{ controlId, isAsc: false, controlType: controls.find(item => item.controlId === controlId).type }]
              : [],
          })
        }
      />
      <Select
        className="flowDropdown flex mLeft10"
        disabled={!sorts.length}
        options={ruleSort}
        value={sorts.length ? sorts[0].isAsc : undefined}
        placeholder={_l('选择规则')}
        onChange={isAsc => updateSource({ sorts: [Object.assign({}, sorts[0], { isAsc })] })}
      />
    </div>
  );
};
