import React, { Component } from 'react';
import _ from 'lodash';
import { arrayOf, func, shape, string } from 'prop-types';
import CascaderDropdown from 'src/components/Form/DesktopForm/widgets/Cascader';
import { DynamicInput, OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';

export default class CascaderSheet extends Component {
  static propTypes = {
    onDynamicValueChange: func,
    dynamicValue: arrayOf(shape({ cid: string, rcid: string, staticValue: string })),
  };
  static defaultProps = {
    onDynamicValueChange: _.noop,
    dynamicValue: [],
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentWillReceiveProps(nextprops) {
    if (_.get(nextprops, 'data.controlId') !== _.get(this.props, 'data.controlId')) {
      this.setState({ visible: false, cascaderValue: [] });
    }
  }
  handleClick = () => {
    const { data } = this.props;
    if (!data.dataSource) {
      alert(_l('请先配置数据源'), 3);
      return;
    }

    this.setState({ visible: true });
  };
  getRowId = staticValue => {
    const value = JSON.parse(staticValue || '[]')[0];
    return _.isObject(value) ? value.rowid : value;
  };
  removeRelateSheet = staticValue => {
    const { dynamicValue = [] } = this.props;
    const removeId = this.getRowId(staticValue);
    const newValue = dynamicValue.filter(item => {
      return this.getRowId(item.staticValue) !== removeId;
    });
    this.props.onDynamicValueChange(newValue);
  };
  onTriggerClick = () => {
    const { defaultType } = this.props;
    defaultType && this.$wrap.triggerClick();
  };
  render() {
    const { data, defaultType, hideOtherFields = false, getType, dynamicValue } = this.props;
    const titleControl = _.find(data.relationControls || [], re => re.attribute === 1);
    const { visible } = this.state;
    const isDynamic = !_.isEmpty(dynamicValue) && !_.get(_.last(dynamicValue), 'staticValue');
    const showValue =
      _.isEmpty(dynamicValue) || isDynamic
        ? []
        : dynamicValue
            .map(i => {
              let staticValueInfo = JSON.parse(i.staticValue)[0];
              staticValueInfo = staticValueInfo.indexOf('rowid') > -1 ? safeParse(staticValueInfo) : staticValueInfo;
              if (_.isObject(staticValueInfo)) {
                return {
                  sid: staticValueInfo.rowid,
                  name: JSON.parse(staticValueInfo.path || '[]').join(' / ') || _l('未命名'),
                };
              }
              return { sid: JSON.parse(i.staticValue)[0], name: i.relateSheetName };
            })
            .filter(i => i.sid);
    const cascaderProps = {
      ...data,
      getType,
      advancedSetting: {
        ...data.advancedSetting,
        filters: '',
        topshow: '0',
        limitlayer: '0',
        minlayer: '0',
        anylevel: '0',
      },
      visible: true,
      onPopupVisibleChange: visible => {
        this.setState({ visible });
      },
      value: JSON.stringify(showValue),
      onChange: value => {
        const newValue = safeParse(value, 'array').map(item => {
          return {
            cid: '',
            rcid: '',
            staticValue: JSON.stringify([item.sid]),
            relateSheetName: item.name,
          };
        });

        this.props.onDynamicValueChange(newValue);
      },
    };
    return (
      <DynamicValueInputWrap className={this.props.className}>
        {defaultType ? (
          <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} />
        ) : (
          <OtherFieldList
            {...this.props}
            dynamicValue={dynamicValue}
            totalWidth={hideOtherFields}
            titleControl={titleControl}
            onClick={() => {
              if (isDynamic) return;
              this.handleClick();
            }}
            removeRelateSheet={this.removeRelateSheet}
          />
        )}
        {visible && <CascaderDropdown {...cascaderProps} />}
        {!hideOtherFields && (
          <SelectOtherField
            {...this.props}
            ref={con => (this.$wrap = con)}
            onDynamicValueChange={newValue => {
              this.props.onDynamicValueChange(newValue);
            }}
          />
        )}
      </DynamicValueInputWrap>
    );
  }
}
