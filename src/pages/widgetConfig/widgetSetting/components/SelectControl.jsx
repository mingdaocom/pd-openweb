import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import { isEmpty } from 'lodash';
import _ from 'lodash';
import { Divider, Input } from 'ming-ui/antd-components';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { SelectFieldsWrap } from '../../styled';

export default function SelectControl({ className, list, searchable = true, onClick, onClickAway = _.noop }) {
  const ref = useRef(null);
  const inputEl = useRef(null);
  const [keyword, setKeyWord] = useState('');
  const controls = (
    keyword ? list.filter(c => c.controlName.toLowerCase().indexOf(keyword.toLowerCase()) > -1) : list
  ).sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1));
  useClickAway(ref, onClickAway);
  useEffect(() => {
    inputEl && inputEl.current && inputEl.current.focus();
  }, []);
  return (
    <SelectFieldsWrap ref={ref} className={className}>
      {searchable && (
        <Fragment>
          <Input
            variant="borderless"
            prefix={<i className="icon-search Font16 textTertiary" />}
            autoFocus
            ref={inputEl}
            value={keyword}
            onChange={e => setKeyWord(e.target.value)}
            placeholder={_l('搜索字段')}
          />
          <Divider className="mTop3 mBottom3" />
        </Fragment>
      )}
      {isEmpty(controls) ? (
        <div className="emptyText">{keyword ? _l('没有搜索结果') : _l('没有可选控件')}</div>
      ) : (
        <div className="fieldsWrap">
          <ul className="fieldList">
            {controls.map(item => (
              <li
                onClick={() => {
                  onClick(item);
                }}
              >
                <i className={`icon-${getIconByType(item.type)}`}></i>
                {item.controlName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SelectFieldsWrap>
  );
}
