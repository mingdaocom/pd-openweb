import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getControlTypeName } from '../../../utils';

export default function ({ controls, selectedIds, placeholder = _l('请选择'), updateSource }) {
  const list = (controls || []).map(item => {
    return {
      text: (
        <Fragment>
          <span className="Gray_75 mRight5">[{getControlTypeName(item)}]</span>
          <span>{item.controlName}</span>
        </Fragment>
      ),
      searchText: item.controlName,
      value: item.controlId,
      disabled: _.includes(selectedIds, item.controlId),
    };
  });

  return (
    <Dropdown
      className="flowDropdown mTop10 flowDropdownMoreSelect"
      selectClose={false}
      data={list}
      value={selectedIds.length || undefined}
      border
      openSearch
      placeholder={placeholder}
      onChange={value => updateSource(selectedIds.concat(value))}
      disabledClickElement=".ant-tooltip"
      renderTitle={() =>
        !!selectedIds.length && (
          <ul className="tagWrap">
            {selectedIds.map(id => {
              const control = _.find(controls, item => item.controlId === id);

              return (
                <li key={id} className={cx('tagItem flexRow', { error: !control })}>
                  <Tooltip title={control ? null : `ID：${id}`}>
                    <span className="tag">{control ? control.controlName : _l('字段已删除')}</span>
                  </Tooltip>
                  <span
                    className="delTag"
                    onClick={e => {
                      e.stopPropagation();
                      const ids = [].concat(selectedIds);

                      _.remove(ids, item => item === id);
                      updateSource(ids);
                    }}
                  >
                    <Icon icon="close" className="pointer" />
                  </span>
                </li>
              );
            })}
          </ul>
        )
      }
    />
  );
}
