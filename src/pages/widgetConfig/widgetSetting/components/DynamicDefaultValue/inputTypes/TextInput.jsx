import React, { Component } from 'react';
import { string, arrayOf, shape, func } from 'prop-types';
import { TagTextarea } from 'ming-ui';
import { SelectOtherField, OtherField, DynamicInput } from '../components';
import { DynamicValueInputWrap } from '../styled';
import { transferValue } from '../util';
import { handleAdvancedSettingChange } from '../../../../util/setting';
import _ from 'lodash';

export default class TextInput extends Component {
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
    const { dynamicValue, data, onChange } = this.props;
    const { default: defaultValue } = data;
    if (defaultValue) {
      const newDynamicValue = dynamicValue.concat({ cid: '', rcid: '', staticValue: defaultValue });
      onChange({
        ...handleAdvancedSettingChange(data, {
          defsource: JSON.stringify(newDynamicValue),
          defaulttype: '',
          defaultfunc: '',
          dynamicsrc: '',
        }),
        default: '',
      });

      this.setDynamicValue(newDynamicValue);
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
      const { cid = '', rcid = '', staticValue } = newField[0];
      const id = rcid ? `${cid}~${rcid}` : `${cid}`;
      this.$tagtextarea.insertColumnTag(id);
      const newValue =
        _.includes(['search-keyword'], cid) && !staticValue ? `$${cid}$` : this.$tagtextarea.cmObj.getValue();
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
            placeholder={_l('请输入')}
            renderTag={(tag, options) => {
              const [cid = '', rcid = ''] = tag.split('~');
              return <OtherField className="tagTextField overflow_ellipsis" item={{ cid, rcid }} {...this.props} />;
            }}
            getRef={tagtextarea => (this.$tagtextarea = tagtextarea)}
            onChange={(err, value, obj) => {
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
