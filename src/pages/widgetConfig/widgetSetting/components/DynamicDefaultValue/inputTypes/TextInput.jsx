import React, { Component } from 'react';
import _ from 'lodash';
import { arrayOf, func, shape, string } from 'prop-types';
import { TagTextarea } from 'ming-ui';
import { DYNAMIC_FROM_MODE } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';
import { handleAdvancedSettingChange } from '../../../../util/setting';
import { DynamicInput, OtherField, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';
import { transferValue } from '../util';

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
      if (rcid === 'url') {
        this.props.onDynamicValueChange(newField);
        return;
      }
      const id = rcid ? `${cid}~${rcid}` : `${cid}`;
      this.$tagtextarea.insertColumnTag(id);
      let newValue = this.$tagtextarea.cmObj.getValue();
      // 文本能多选，以下情况不能同时配置
      if (_.includes(['search-keyword', 'empty'], cid) && !staticValue) {
        newValue = `$${cid}$`;
      } else {
        newValue = newValue.replace(/\$empty\$|\$search-keyword\$/g, '');
      }

      this.transferValue(newValue);
    } else {
      this.props.onDynamicValueChange(newField);
    }
  };

  render() {
    const { defaultType, from } = this.props;
    return (
      <DynamicValueInputWrap ref={con => (this.$textinput = con)} triggerStyle={true}>
        {defaultType ? (
          <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} />
        ) : (
          <TagTextarea
            className="tagTextAreaWrap"
            placeholder={_l('请输入')}
            renderTag={tag => {
              const [cid = '', rcid = ''] = tag.split('~');
              return <OtherField className="tagTextField overflow_ellipsis" item={{ cid, rcid }} {...this.props} />;
            }}
            getRef={tagtextarea => (this.$tagtextarea = tagtextarea)}
            onChange={(err, value) => {
              from !== DYNAMIC_FROM_MODE.FAST_FILTER && this.transferValue(value.trim());
            }}
            onBlur={() => {
              from === DYNAMIC_FROM_MODE.FAST_FILTER && this.transferValue(this.$tagtextarea.cmObj.getValue());
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
