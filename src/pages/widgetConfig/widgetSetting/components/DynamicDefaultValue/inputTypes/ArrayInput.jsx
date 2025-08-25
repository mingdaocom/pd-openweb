import React, { Component } from 'react';
import _ from 'lodash';
import { arrayOf, func, shape, string } from 'prop-types';
import { TagTextarea } from 'ming-ui';
import { DynamicInput, OtherField, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';
import { transferValue } from '../util';

export default class ArrayInput extends Component {
  static propTypes = {
    dynamicValue: arrayOf(shape({ cid: string, rcid: string, staticValue: string })),
    onDynamicValueChange: func,
    clearOldDefault: func,
  };
  static defaultProps = {
    onDynamicValueChange: _.noop,
    clearOldDefault: _.noop,
    dynamicValue: [],
  };

  componentDidMount() {
    const { dynamicValue, data, clearOldDefault, onDynamicValueChange } = this.props;
    const { default: defaultValue } = data;
    if (defaultValue) {
      onDynamicValueChange(dynamicValue.concat({ cid: '', rcid: '', staticValue: defaultValue }));
      clearOldDefault();
    } else {
      this.setDynamicValue(dynamicValue);
    }
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(this.props.dynamicValue) !== JSON.stringify(prevProps.dynamicValue)) {
      if (this.$tagtextarea) {
        const cursor = this.$tagtextarea.cmObj.getCursor();
        this.setDynamicValue(this.props.dynamicValue);
        this.$tagtextarea.cmObj.setCursor(cursor);
      }
    }
  }

  // 设置为标签格式
  setDynamicValue = (dynamicValue = []) => {
    let fields = '';

    dynamicValue.forEach(item => {
      const { cid, rcid, staticValue } = item;
      if (cid) {
        fields += rcid ? `$${cid}~${rcid}$` : `$${cid}$`;
      } else {
        fields += staticValue;
      }
    });

    if (this.$tagtextarea) {
      this.$tagtextarea.setValue(fields);
    }
  };
  // 输入普通字符串时数据转换
  transferValue = value => {
    const defsource = transferValue(value);
    this.props.onDynamicValueChange(defsource);
  };

  onTriggerClick = () => {
    const { defaultType } = this.props;
    defaultType && this.$wrap.triggerClick();
  };

  handleDynamicValue = (newField = []) => {
    if (this.$tagtextarea) {
      const { cid = '', rcid = '' } = newField[0];
      const id = rcid ? `${cid}~${rcid}` : `${cid}`;
      this.$tagtextarea.insertColumnTag(id);
      const newValue = this.$tagtextarea.cmObj.getValue();
      this.transferValue(newValue);
    }
  };

  render() {
    const { defaultType } = this.props;
    return (
      <DynamicValueInputWrap ref={con => (this.$textinput = con)} triggerStyle={true}>
        {defaultType ? (
          <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} />
        ) : (
          <TagTextarea
            className="tagTextAreaWrap"
            placeholder={_l('如：A,B,C')}
            renderTag={tag => {
              const [cid = '', rcid = ''] = tag.split('~');
              return <OtherField className="tagTextField overflow_ellipsis" item={{ cid, rcid }} {...this.props} />;
            }}
            getRef={tagtextarea => (this.$tagtextarea = tagtextarea)}
            onChange={(err, value) => {
              this.transferValue(value.trim());
            }}
          />
        )}
        <SelectOtherField
          {...this.props}
          onDynamicValueChange={this.handleDynamicValue}
          ref={con => (this.$wrap = con)}
          popupContainer={this.$textinput}
        />
      </DynamicValueInputWrap>
    );
  }
}
