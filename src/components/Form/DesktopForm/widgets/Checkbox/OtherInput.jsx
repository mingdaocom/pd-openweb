import React, { useEffect, useRef } from 'react';
import cx from 'classnames';
import { Textarea } from 'ming-ui';
import { getCheckAndOther } from '../../../core/utils';

export default function OtherInput(props) {
  const textRef = useRef(null);
  const isOnCompositionRef = useRef(false);

  const {
    isSubList,
    type,
    advancedSetting = {},
    value,
    options,
    isSelect,
    className,
    disabled,
    fromFilter,
    onChange,
    changeValue = () => {},
  } = props;

  useEffect(() => {
    if (textRef.current) {
      const { otherValue } = getCheckAndOther(value);
      textRef.current.value = (otherValue || '').replace(/\r\n|\n/g, ' ');
    }
  }, [value]);

  const handleChange = (checkIds, value) => {
    const newValues = checkIds.map(i => (i === 'other' && value ? `other:${value}` : i));
    onChange(JSON.stringify(newValues));
    changeValue(value);
  };

  const { checkIds, otherValue } = getCheckAndOther(value);
  if (fromFilter || (disabled && !otherValue)) return null;

  const noDelOptions = options.filter(i => !i.isDeleted);

  const compositionOptions = {
    onCompositionStart: () => (isOnCompositionRef.current = true),
    onCompositionEnd: event => {
      if (event.type === 'compositionend') {
        isOnCompositionRef.current = false;
      }

      // 谷歌浏览器：compositionstart onChange compositionend
      // 火狐浏览器：compositionstart compositionend onChange
      if (window.isChrome) {
        handleChange(checkIds, event.target.value.trim());
      }
    },
  };

  if (checkIds.includes('other') && noDelOptions.find(i => i.key === 'other') && (!isSubList || type !== 10)) {
    return (
      <div className={className} style={isSelect || disabled ? {} : { paddingLeft: '26px' }}>
        <Textarea
          maxLength={200}
          disabled={disabled}
          className={cx('customFormControlBox customFormTextareaBox escclose', {
            mTop10: isSelect,
            controlDisabled: disabled,
          })}
          manualRef={ref => (textRef.current = ref)}
          minHeight={36}
          maxHeight={400}
          spellCheck={false}
          defaultValue={otherValue || ''}
          placeholder={advancedSetting.otherhint}
          onChange={value => {
            if (!isOnCompositionRef.current) {
              handleChange(checkIds, value.trim());
            }
          }}
          onBlur={e => {
            handleChange(checkIds, e.target.value.trim());
          }}
          {...compositionOptions}
        />
      </div>
    );
  }

  return null;
}
