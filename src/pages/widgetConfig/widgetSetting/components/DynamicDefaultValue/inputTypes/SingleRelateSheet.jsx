import React, { Component, Fragment } from 'react';
import { string, arrayOf, shape, func } from 'prop-types';
import RecordCardListDialog from 'src/components/recordCardListDialog';
import { OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';

export default class SingleRelateSheet extends Component {
  static propTypes = {
    onDynamicValueChange: func,
    dynamicValue: arrayOf(
      shape({ cid: string, rcid: string, staticValue: string })
    ),
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
      alert(_l('请先配置关联表'));
      return;
    }
    this.setState({ recordListVisible: true });
  };
  removeRelateSheet = () => {
    this.props.onDynamicValueChange([]);
  };
  render() {
    const { data, onDynamicValueChange, titleControl } = this.props;
    const { recordListVisible } = this.state;
    return (
      <DynamicValueInputWrap>
        <OtherFieldList
          {...this.props}
          titleControl={titleControl}
          onClick={this.handleClick}
          removeRelateSheet={this.removeRelateSheet}
        />
        {recordListVisible && (
          <RecordCardListDialog
            visible
            allowNewRecord={false}
            relateSheetId={data.dataSource}
            onClose={() => this.setState({ recordListVisible: false })}
            onOk={records => {
              onDynamicValueChange(
                records.map(item => {
                  const name = item[titleControl.controlId];
                  return {
                    cid: '',
                    rcid: '',
                    staticValue: JSON.stringify([item.rowid]),
                    relateSheetName: name,
                  };
                })
              );
            }}
            {..._.pick(data, ['appId', 'showControls', 'viewId', 'coverCid'])}
          />
        )}
        <SelectOtherField {...this.props} />
      </DynamicValueInputWrap>
    );
  }
}
