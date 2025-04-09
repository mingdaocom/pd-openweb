import React, { Component } from 'react';
import { string, arrayOf, shape, func } from 'prop-types';
import RecordCardListDialog from 'src/components/recordCardListDialog';
import { OtherFieldList, SelectOtherField, DynamicInput } from '../components';
import { DynamicValueInputWrap } from '../styled';
import { getCurrentValue } from 'src/components/newCustomFields/tools/formUtils';
import _ from 'lodash';

export default class RelateSheet extends Component {
  static propTypes = {
    onDynamicValueChange: func,
    dynamicValue: arrayOf(shape({ cid: string, rcid: string, staticValue: string })),
  };
  static defaultProps = {
    onDynamicValueChange: _.noop,
    dynamicValue: [],
  };
  state = {
    recordListVisible: false,
  };
  handleClick = () => {
    const { data } = this.props;
    if (!data.dataSource) {
      alert(_l('请先配置关联表'), 3);
      return;
    }
    this.setState({ recordListVisible: true });
  };
  getRowId = staticValue => {
    const value = JSON.parse(staticValue || '[]')[0];
    return typeof value === 'string' && value.indexOf('rowid') > -1 ? _.get(safeParse(value), 'rowid') : value;
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
    const { data, onDynamicValueChange, defaultType, dynamicValue = [] } = this.props;
    const { recordListVisible } = this.state;
    const titleControl = _.find(data.relationControls || [], re => re.attribute === 1);
    const multiple = data.enumDefault === 2;
    const filterRowIds = dynamicValue.reduce((total, item) => {
      if (!item.cid) {
        total = total.concat(this.getRowId(item.staticValue));
      }
      return total;
    }, []);
    return (
      <DynamicValueInputWrap>
        {defaultType ? (
          <DynamicInput {...this.props} onTriggerClick={this.onTriggerClick} />
        ) : (
          <OtherFieldList
            {...this.props}
            titleControl={titleControl}
            onClick={this.handleClick}
            removeRelateSheet={this.removeRelateSheet}
          />
        )}
        {recordListVisible && (
          <RecordCardListDialog
            visible
            allowNewRecord={false}
            multiple={multiple}
            filterRowIds={filterRowIds}
            relateSheetId={data.dataSource}
            onClose={() => this.setState({ recordListVisible: false })}
            onOk={records => {
              const newValue = records.map(item => {
                return {
                  cid: '',
                  rcid: '',
                  staticValue: JSON.stringify([item.rowid]),
                  relateSheetName: getCurrentValue(titleControl, item[titleControl.controlId], { type: 2 }) || '未命名',
                };
              });
              if (multiple) {
                const filterDynamicValue = (dynamicValue || []).filter(i => i.staticValue);
                onDynamicValueChange(filterDynamicValue.concat(newValue));
              } else {
                onDynamicValueChange(newValue);
              }
            }}
            {..._.pick(data, ['appId', 'showControls', 'viewId', 'coverCid'])}
          />
        )}
        <SelectOtherField {...this.props} ref={con => (this.$wrap = con)} />
      </DynamicValueInputWrap>
    );
  }
}
