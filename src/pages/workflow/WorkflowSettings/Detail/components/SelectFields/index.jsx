import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Select, Tooltip } from 'ming-ui/antd-components';
import { getControlTypeName } from '../../../utils';

export default function ({ controls, selectedIds, placeholder = _l('请选择'), updateSource }) {
  const list = (controls || []).map(item => {
    return {
      label: (
        <Fragment>
          <span className="textSecondary mRight5">[{getControlTypeName(item)}]</span>
          <span>{item.controlName}</span>
        </Fragment>
      ),
      searchText: item.controlName,
      value: item.controlId,
    };
  });

  return (
    <Select
      className="flowDropdown mTop10 flowDropdownMoreSelect"
      mode="multiple"
      options={list}
      value={selectedIds}
      showSearch
      optionFilterProp="searchText"
      placeholder={placeholder}
      labelRender={({ value }) => {
        const control = _.find(controls, { controlId: value });

        return (
          <Tooltip title={control ? null : `ID：${value}`}>
            <span className={cx({ errorColor: !control })}>{control ? control.controlName : _l('字段已删除')}</span>
          </Tooltip>
        );
      }}
      onChange={updateSource}
    />
  );
}
