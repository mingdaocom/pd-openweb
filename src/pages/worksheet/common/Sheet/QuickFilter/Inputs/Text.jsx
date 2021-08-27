import React, { useState } from 'react';
import { arrayOf, func, shape, string } from 'prop-types';
import { Input } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';

const Con = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  border: 1px solid ${({ active }) => (active ? '#2196f3' : '#ddd')} !important;
  border-radius: 4px;
  ${({ active }) =>
    active
      ? ''
      : `&:hover {
    border-color: #ccc !important;
  }`}
`;

const InputCon = styled.div`
  flex: 1;
  .Input {
    width: 100%;
    font-size: 13px !important;
    height: 30px !important;
    border: none !important;
    box-sizing: border-box !important;
    &::placeholder {
      color: #bdbdbd;
    }
  }
`;

const Icon = styled.i`
  font-size: 18px;
  color: #9e9e9e;
  margin-right: 8px;
  &.icon-cancel {
    cursor: pointer;
    &:hover {
      color: #777;
    }
  }
`;

export default function Text(props) {
  const { control = {}, values = [], onChange = () => {} } = props;
  const [isFocusing, setIsFocusing] = useState(false);
  return (
    <Con active={isFocusing}>
      <InputCon>
        <Input
          placeholder={_l('搜索关键字')}
          value={values.join(' ')}
          onFocus={() => setIsFocusing(true)}
          onBlur={() => setIsFocusing(false)}
          onChange={newValue => {
            onChange({
              values: _.includes(
                [
                  WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 电话号码
                  WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机号码
                ],
                control.type,
              )
                ? [newValue.replace(/ /g, '')]
                : newValue.split(' '),
            });
          }}
        />
      </InputCon>
      <Icon
        className={cx('icon', values && values.length ? 'icon-cancel' : 'icon-search')}
        onClick={() => {
          onChange({ values: [] });
        }}
      />
    </Con>
  );
}

Text.propTypes = {
  control: shape({}),
  values: arrayOf(string),
  onChange: func,
};
