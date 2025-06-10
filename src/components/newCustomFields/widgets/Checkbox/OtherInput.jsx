import React, { Component } from 'react';
import cx from 'classnames';
import { Textarea } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';
import { getCheckAndOther } from '../../tools/utils';

export default class OtherInput extends Component {
  isOnComposition = false;

  componentWillReceiveProps(nextProps) {
    if (this.text) {
      const { otherValue } = getCheckAndOther(nextProps.value);
      this.text.value = (otherValue || '').replace(/\r\n|\n/g, ' ');
    }
  }

  handleChange = (checkIds, value) => {
    const { onChange, changeValue = () => {} } = this.props;
    const newValues = checkIds.map(i => (i === 'other' && value ? `other:${value}` : i));
    onChange(JSON.stringify(newValues));
    changeValue(value);
  };

  render() {
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
    } = this.props;

    const { checkIds, otherValue } = getCheckAndOther(value);
    if (fromFilter || (disabled && !otherValue)) return null;

    const noDelOptions = options.filter(i => !i.isDeleted);

    const compositionOptions = {
      onCompositionStart: () => (this.isOnComposition = true),
      onCompositionEnd: event => {
        if (event.type === 'compositionend') {
          this.isOnComposition = false;
        }

        // 谷歌浏览器：compositionstart onChange compositionend
        // 火狐浏览器：compositionstart compositionend onChange
        if (window.isChrome) {
          this.handleChange(checkIds, event.target.value.trim());
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
              mobileCustomFormTextareaBox: browserIsMobile(),
              controlDisabled: disabled,
            })}
            manualRef={text => {
              this.text = text;
            }}
            minHeight={36}
            maxHeight={400}
            spellCheck={false}
            defaultValue={otherValue || ''}
            placeholder={advancedSetting.otherhint}
            onChange={value => {
              if (!this.isOnComposition) {
                this.handleChange(checkIds, value.trim());
              }
            }}
            onBlur={e => {
              this.handleChange(checkIds, e.target.value.trim());
            }}
            {...compositionOptions}
          />
        </div>
      );
    }

    return null;
  }
}
