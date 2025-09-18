import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { getCheckAndOther } from '../../../core/utils';

const OtherInputWrap = styled.div`
  .customFormTextarea {
    height: 37px;
    max-height: 400px;
    vertical-align: top;
    overflow-x: hidden;
    overflow-y: auto;
    resize: none;
  }
`;

const OtherInput = props => {
  const { isSubList, type, advancedSetting = {}, value, options = {}, className, disabled, fromFilter } = props;
  const { checkIds, otherValue } = getCheckAndOther(value);

  const textareaRef = useRef(null);
  const isOnComposition = useRef(false);
  const [currentValue, setCurrentValue] = useState('');

  const noDelOptions = options.filter(i => !i.isDeleted);

  const handleChange = (props, checkIds, value) => {
    const { onChange, changeValue = () => {} } = props;
    const newValues = checkIds.map(i => (i === 'other' && value ? `other:${value}` : i));
    onChange(JSON.stringify(newValues));
    changeValue(value);
  };

  const debouncedOnChange = useRef(
    _.debounce((props, checkIds, value) => {
      handleChange(props, checkIds, value);
    }, 300),
  ).current;

  useEffect(() => {
    // 动态设置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 0;
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  }, [currentValue, disabled]);

  useEffect(() => {
    setCurrentValue((otherValue || '').replace(/\r\n|\n/g, ' '));
  }, [value]);

  if (fromFilter || (disabled && !otherValue)) return null;

  if (checkIds.includes('other') && noDelOptions.find(i => i.key === 'other') && (!isSubList || type !== 10)) {
    return (
      <OtherInputWrap className={className}>
        <textarea
          ref={textareaRef}
          maxLength={200}
          disabled={disabled}
          className="customFormControlBox customFormTextarea controlMinHeight escclose customFormFocusControl"
          spellCheck={false}
          placeholder={advancedSetting.otherhint}
          value={currentValue}
          onChange={event => {
            const val = event.target.value.trim();
            setCurrentValue(val);
            if (isOnComposition.current) return;
            debouncedOnChange(props, checkIds, val);
          }}
          onBlur={e => {
            handleChange(props, checkIds, e.target.value.trim());
          }}
          onCompositionStart={() => (isOnComposition.current = true)}
          onCompositionEnd={event => {
            if (event.type === 'compositionend') {
              isOnComposition.current = false;
            }

            // 谷歌浏览器：compositionstart onChange compositionend
            // 火狐浏览器：compositionstart compositionend onChange
            if (window.isChrome) {
              handleChange(props, checkIds, event.target.value.trim());
            }
          }}
        />
      </OtherInputWrap>
    );
  }
  return null;
};

export default OtherInput;
