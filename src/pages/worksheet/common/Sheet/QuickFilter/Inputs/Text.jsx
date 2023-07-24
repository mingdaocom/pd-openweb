import React, { useEffect, useState } from 'react';
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
  line-height: 32px;
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

export default function Text(props) {
  const { control = {}, values = [], filterType, onChange = () => {}, onEnterDown = () => {} } = props;
  const [isFocusing, setIsFocusing] = useState(false);
  const [isMultiple, setIsMultiple] = useState(false);
  const [valueForMultiple, setValueForMultiple] = useState();
  const [pasteDialogVisible, setPasteDialogVisible] = useState();
  useUpdateEffect(() => {
    if (!values.length) {
      setIsMultiple(false);
      setValueForMultiple('');
    }
  }, [values]);
  return (
    <Out>
      <Con active={isFocusing}>
        <InputCon>
          {!isMultiple ? (
            <Input
              placeholder={_l('搜索')}
              value={values.join(' ')}
              onKeyDown={e => e.keyCode === 13 && onEnterDown()}
              onFocus={() => setIsFocusing(true)}
              onBlur={() => setIsFocusing(false)}
              onChange={newValue => {
                setIsMultiple(false);

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
