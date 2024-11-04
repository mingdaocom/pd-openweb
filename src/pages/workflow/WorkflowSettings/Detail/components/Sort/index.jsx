import React from 'react';
import { Dropdown } from 'ming-ui';
import { getControlTypeName } from '../../../utils';
import _ from 'lodash';

export default ({ controls, sorts, updateSource }) => {
  const renderTitle = controlId => {
    return <span>{_.find(controls, item => item.controlId === controlId).controlName}</span>;
  };
  let ruleSort = [];
  let ruleControls = controls
    .filter(
      item => _.includes([2, 6, 8, 15, 16, 31, 37, 38, 46], item.type) || (item.type === 29 && item.enumDefault === 2),
    )
    .map(item => {
      return {
        text: (
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
        { text: '1 → 9', value: true },
        { text: '9 → 1', value: false },
      ];
    } else if (type === 2) {
      ruleSort = [
        { text: _l('A → Z'), value: true },
        { text: _l('Z → A'), value: false },
      ];
    } else if (type === 46) {
      ruleSort = [
        { text: _l('最早的在前'), value: true },
        { text: _l('最晚的在前'), value: false },
      ];
    } else {
      ruleSort = [
        { text: _l('最新的在前'), value: false },
        { text: _l('最旧的在前'), value: true },
      ];
    }

    ruleControls = [ruleControls].concat([
      {
        text: (
          <div className="ellipsis">
            <span className="field">
              <i className="Font16 icon-workflow_empty" />
            </span>
            <span>{_l('清空')}</span>
          </div>
        ),
        value: '',
        searchText: _l('清空'),
      },
    ]);
  }

  return (
    <div className="mTop15 flexRow">
      <Dropdown
        className="flowDropdown flex"
        disabled={!ruleControls.length}
        data={ruleControls}
        value={sorts.length ? sorts[0].controlId : undefined}
        border
        openSearch
        renderTitle={() => !!sorts.length && sorts[0].controlId && renderTitle(sorts[0].controlId)}
        placeholder={_l('选择字段')}
        onChange={controlId =>
          updateSource({
            sorts: controlId
              ? [{ controlId, isAsc: false, controlType: controls.find(item => item.controlId === controlId).type }]
              : [],
          })
        }
      />
      <Dropdown
        className="flowDropdown flex mLeft10"
        disabled={!sorts.length}
        data={ruleSort}
        value={sorts.length ? sorts[0].isAsc : undefined}
        border
        placeholder={_l('选择规则')}
        onChange={isAsc => updateSource({ sorts: [Object.assign({}, sorts[0], { isAsc })] })}
      />
    </div>
  );
};
