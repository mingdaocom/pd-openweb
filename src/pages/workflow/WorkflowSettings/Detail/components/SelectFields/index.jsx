import React, { Fragment } from 'react';
import cx from 'classnames';
import { Dropdown, Icon } from 'ming-ui';
import { CONTROLS_NAME } from '../../../enum';

export default function ({ controls, selectedIds, placeholder = _l('请选择'), updateSource }) {
  const list = (controls || []).map(item => {
    return {
      text: (
        <Fragment>
          <span className="Gray_9e mRight5">[{CONTROLS_NAME[item.type]}]</span>
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
      renderTitle={() =>
        !!selectedIds.length && (
          <ul className="tagWrap">
            {selectedIds.map(id => {
              const control = _.find(controls, item => item.controlId === id);

              return (
                <li key={id} className={cx('tagItem flexRow', { error: !control })}>
                  <span className="tag" title={control ? control.controlName : _l('字段已删除')}>
                    {control ? control.controlName : _l('字段已删除')}
                  </span>
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
