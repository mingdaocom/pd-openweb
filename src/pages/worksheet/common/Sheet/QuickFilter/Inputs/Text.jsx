import React, { useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { arrayOf, func, shape, string, number } from 'prop-types';
import { Tooltip } from 'antd';
import { Input } from 'ming-ui';
import styled from 'styled-components';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { FILTER_CONDITION_TYPE } from 'worksheet/common/WorkSheetFilter/enum';
import PasteDialog from '../PasteDialog';
import _ from 'lodash';

const Out = styled.div`
  display: flex;
  flex-direction: row;
`;

const Con = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  height: 32px;
  border: 1px solid ${({ active }) => (active ? '#2196f3' : '#ddd')} !important;
  border-radius: 4px 0 0 4px;
  &:hover {
    border-color: #2196f3 !important;
    .icon-cancel {
      display: inline-block;
    }
  }
`;

const InputCon = styled.div`
  flex: 1;
  .Input {
    width: 100%;
    font-size: 13px !important;
    height: 30px !important;
    border: none !important;
    box-sizing: border-box !important;
    line-height: inherit;
    &::placeholder {
      color: #bdbdbd;
    }
  }
`;

const MultipleValue = styled.div`
  font-size: 13px;
  padding: 0 12px;
`;

const ClearIcon = styled.i`
  display: none;
  position: absolute;
  right: 0;
  font-size: 16px;
  color: #9e9e9e;
  margin-right: 8px;
  cursor: pointer;
  &:hover {
    color: #777;
  }
`;

const AdvancePasteIcon = styled.span`
  cursor: pointer;
  border: 1px solid #ddd;
  border-left: none;
  border-radius: 0 4px 4px 0;
  font-size: 20px;
  color: #9e9e9e;
  line-height: 30px;
  padding: 0 6px;
  > span {
    line-height: 1em;
  }
`;

function getPlaceHolder(filterType, limit) {
  if (filterType === FILTER_CONDITION_TYPE.START) {
    return limit ? _l('输入开头%0位后搜索', limit) : _l('搜索开头');
  } else if (filterType === FILTER_CONDITION_TYPE.END) {
    return limit ? _l('输入结尾%0位后搜索', limit) : _l('搜索结尾');
  } else {
    return _l('搜索');
  }
}

export default function Text(props) {
  const { control = {}, values = [], filterType, advancedSetting, onChange = () => {}, onEnterDown = () => {} } = props;
  const [tempValue, setTempValue] = useState();
  const [isFocusing, setIsFocusing] = useState(false);
  const [isMultiple, setIsMultiple] = useState(false);
  const [valueForMultiple, setValueForMultiple] = useState();
  const [pasteDialogVisible, setPasteDialogVisible] = useState();
  const limit = advancedSetting.limit && Number(advancedSetting.limit);
  const needCheckLength =
    _.includes([FILTER_CONDITION_TYPE.START, FILTER_CONDITION_TYPE.END], filterType) &&
    _.isNumber(limit) &&
    !_.isNaN(limit);
  useUpdateEffect(() => {
    if (!values.length) {
      setIsMultiple(false);
      setValueForMultiple('');
      setTempValue('');
    }
  }, [values]);
  return (
    <Out>
      <Con active={isFocusing}>
        <InputCon>
          {!isMultiple ? (
            <Input
              placeholder={getPlaceHolder(filterType, advancedSetting.limit)}
              value={needCheckLength && tempValue ? tempValue : values.join(' ')}
              onKeyDown={e => e.keyCode === 13 && onEnterDown()}
              onFocus={() => setIsFocusing(true)}
              onBlur={() => setIsFocusing(false)}
              onChange={newValue => {
                setIsMultiple(false);
                if (needCheckLength) {
                  setTempValue(newValue);
                  if (newValue.length < limit && newValue.length > 0) {
                    if (values.join('') !== '') {
                      newValue = '';
                    } else {
                      return;
                    }
                  }
                }
                if (
                  _.includes(
                    [
                      WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 电话号码
                      WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机号码
                    ],
                    control.type,
                  )
                ) {
                  onChange({ values: [newValue.replace(/ /g, '')] });
                } else if (filterType === FILTER_CONDITION_TYPE.TEXT_ALLCONTAIN) {
                  onChange({ values: newValue.split(' ') });
                } else {
                  onChange({ values: [newValue] });
                }
              }}
              onPaste={e => {
                const pasteValue = (e.clipboardData || window.clipboardData).getData('text');
                if (pasteValue && /\n/.test(pasteValue)) {
                  setValueForMultiple(pasteValue);
                  setPasteDialogVisible(true);
                  e.preventDefault();
                }
              }}
            />
          ) : (
            <MultipleValue onClick={() => setPasteDialogVisible(true)}>
              {_l('%0 个关键词', values.length)}
            </MultipleValue>
          )}
        </InputCon>
        {values && !!values.length && (
          <ClearIcon
            className="icon-cancel"
            onClick={() => {
              setIsMultiple(false);
              setValueForMultiple('');
              onChange({ values: [] });
            }}
          />
        )}
      </Con>
      <AdvancePasteIcon onClick={() => setPasteDialogVisible(true)}>
        <Tooltip title={_l('添加多个搜索关键词')}>
          <i className="icon icon-lookup ThemeHoverColor3" onClick={() => setPasteDialogVisible(true)} />
        </Tooltip>
      </AdvancePasteIcon>
      {pasteDialogVisible && (
        <PasteDialog
          keywords={valueForMultiple}
          onClose={() => setPasteDialogVisible(false)}
          onChange={v => {
            const newValues = v
              .split('\n')
              .map(v => v.trim())
              .filter(_.identity);
            setValueForMultiple(v);
            setIsMultiple(!!newValues.length);
            onChange({ values: newValues }, { forceUpdate: true });
          }}
        />
      )}
    </Out>
  );
}

Text.propTypes = {
  control: shape({}),
  filterType: number,
  values: arrayOf(string),
  onChange: func,
};
