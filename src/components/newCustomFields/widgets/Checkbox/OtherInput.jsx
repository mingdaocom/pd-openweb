import React, { Component } from 'react';
import { getCheckAndOther } from '../../tools/utils';
import { Input } from 'antd';
import { browserIsMobile } from 'src/util';
import cx from 'classnames';

const { TextArea } = Input;

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
    const { isSubList, advancedSetting = {}, value, options, isSelect, className, disabled, fromFilter } = this.props;

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
        if (navigator.userAgent.indexOf('Chrome') > -1) {
          this.handleChange(checkIds, event.target.value.trim());
        }
      },
    };

    if (checkIds.includes('other') && noDelOptions.find(i => i.key === 'other') && !isSubList) {
      return (
        <div className={className} style={isSelect || disabled ? {} : { paddingLeft: '26px' }}>
          <TextArea
            maxLength={200}
            className={cx('customFormControlBox customFormTextareaBox', {
              mTop10: isSelect,
              mobileCustomFormTextareaBox: browserIsMobile(),
              controlDisabled: disabled,
            })}
            style={{ padding: disabled ? '0px' : '7px 12px 6px' }}
            manualRef={text => {
              this.text = text;
            }}
            autoSize={true}
            defaultValue={otherValue || ''}
            placeholder={advancedSetting.otherhint}
            onChange={e => {
              if (!this.isOnComposition) {
                this.handleChange(checkIds, e.target.value.trim());
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
