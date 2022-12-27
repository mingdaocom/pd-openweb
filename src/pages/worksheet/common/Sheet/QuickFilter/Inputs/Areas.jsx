import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { arrayOf, func, string, shape } from 'prop-types';
import CityPicker from 'ming-ui/components/CityPicker';
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

const AreasText = styled.div`
  font-size: 13px;
  color: #333;
`;

const Icon = styled.i`
  cursor: pointer;
  font-size: 13px;
  color: #9e9e9e;
  margin-right: 8px;
`;

const Empty = styled.span`
  color: #bdbdbd;
`;
export default function Areas(props) {
  const { values = [], control, isMultiple, onChange = () => {} } = props;
  const [active, setActive] = useState();
  const tempArea = useRef();
  return (
    <CityPicker
      destroyPopupOnHide
      defaultValue={undefined}
      level={control.type === 19 ? 1 : control.type === 23 ? 2 : 3}
      callback={area => {
        if (_.last(area)) {
          tempArea.current = {
            name: area.map(c => c.name).join('/'),
            id: _.last(area).id,
          };
        }
      }}
      handleClose={() => {
        setActive(false);
        if (tempArea.current) {
          onChange({ values: isMultiple ? _.uniqBy([...values, tempArea.current], 'id') : [tempArea.current] });
        }
      }}
    >
      <Con isEmpty={!values.length} active={active}>
        <AreasCon
          onClick={() => {
            setActive(true);
          }}
        >
          {!values.length && <Empty>{_l('请选择')}</Empty>}
          {!isMultiple && !!values.length && (
            <AreasText className="ellipsis" title={values[0].name}>
              {values[0].name}
            </AreasText>
          )}
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
        </AreasCon>
        <Icon className="icon icon-arrow-down-border downIcon" />
        {!!values.length && (
          <Icon
            className="icon icon-cancel clearIcon"
            onClick={e => {
              e.stopPropagation();
              onChange({ values: [] });
              tempArea.current = undefined;
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
