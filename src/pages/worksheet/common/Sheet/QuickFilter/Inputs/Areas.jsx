import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { arrayOf, func, string, shape } from 'prop-types';
import { CityPicker, Input } from 'ming-ui';
import { BaseSelectedItem } from './Styles';
import _ from 'lodash';

const Con = styled.div`
  display: flex;
  align-items: center;
  min-height: 32px;
  line-height: 32px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  border: 1px solid ${({ active }) => (active ? '#2196f3' : '#ddd')} !important;
  .clearIcon {
    display: none;
  }
  &:hover {
    .clearIcon {
      display: inline-block;
    }
  }
  ${({ isEmpty }) => (!isEmpty ? '&:hover { .downIcon { display: none;} }' : '')}
`;

const AreasCon = styled.div`
  cursor: pointer;
  flex: 1;
  overflow: hidden;
  font-size: 13px;
  min-height: 32px;
  padding: 0 0 0 10px;
`;

const Icon = styled.i`
  cursor: pointer;
  font-size: 13px;
  color: #9e9e9e;
  margin-right: 8px;
`;

const InputWrap = styled(Input)`
  font-size: 13px;
  color: #333 !important;
  height: 32px !important;
  &::-webkit-input-placeholder {
    color: #bdbdbd;
  }
`;
export default function Areas(props) {
  const { values = [], control, isMultiple, onChange = () => {} } = props;
  const [active, setActive] = useState();
  const [search, setSearch] = useState(undefined);
  const [keywords, setKeywords] = useState('');
  const tempArea = useRef();

  const onFetchData = _.debounce(value => {
    setKeywords(value);
  }, 500);

  const clearSearch = () => {
    if (!search) return;
    setSearch(isMultiple ? '' : undefined);
    setKeywords('');
  };

  return (
    <CityPicker
      search={keywords}
      destroyPopupOnHide
      defaultValue={undefined}
      level={control.type === 19 ? 1 : control.type === 23 ? 2 : 3}
      callback={area => {
        const last = _.last(area);

        if (last) {
          tempArea.current = {
            name: last.path,
            id: last.id,
          };
        }
        clearSearch();
      }}
      handleClose={() => {
        setActive(false);
        if (tempArea.current) {
          onChange({ values: isMultiple ? _.uniqBy([...values, tempArea.current], 'id') : [tempArea.current] });
        }
        clearSearch();
      }}
    >
      <Con isEmpty={!values.length} active={active}>
        <AreasCon
          onClick={() => {
            setActive(true);
          }}
        >
          {isMultiple &&
            values.map((v, i) => (
              <BaseSelectedItem key={i}>
                <span className="name ellipsis">{v.name}</span>
                <i
                  className="icon icon-delete Gray_9e Font10 Hand"
                  onClick={e => {
                    e.stopPropagation();
                    onChange({ values: values.filter(d => d.id !== v.id) });
                  }}
                />
              </BaseSelectedItem>
            ))}
          <InputWrap
            className="CityPicker-input-textCon"
            placeholder={isMultiple && values.length ? '' : _l('请选择')}
            value={isMultiple ? search || '' : search !== undefined ? search : (values[0] || { name: '' }).name}
            onChange={value => {
              setSearch(value);
              onFetchData(value);
            }}
          />
        </AreasCon>
        <Icon className="icon icon-arrow-down-border downIcon" />
        {!!values.length && (
          <Icon
            className="icon icon-cancel clearIcon"
            onClick={e => {
              e.stopPropagation();
              onChange({ values: [] });
              tempArea.current = undefined;
              if (search) {
                setSearch('');
                setKeywords('');
              }
            }}
          />
        )}
      </Con>
    </CityPicker>
  );
}

Areas.propTypes = {
  control: shape({}),
  values: arrayOf(string),
  onChange: func,
};
