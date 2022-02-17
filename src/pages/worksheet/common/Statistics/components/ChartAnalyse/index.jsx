import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Collapse, Checkbox, Switch } from 'antd';
import OriginalData from './components/OriginalData';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'worksheet/common/Statistics/redux/actions';

@connect(
  state => ({
    ..._.pick(state.statistics, ['currentReport', 'worksheetInfo', 'reportData'])
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class ChartAnalyse extends Component {
  constructor(props) {
    super(props);
  }
  handleChangeDisplaySetup = (data, isRequest = false) => {
    const { displaySetup } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        displaySetup: {
          ...displaySetup,
          ...data
        }
      },
      isRequest
    );
  }
  handleChangeStyle = (data, isRequest = false) => {
    const { style } = this.props.currentReport;
    this.props.changeCurrentReport(
      {
        style: {
          ...style,
          ...data
        }
      },
      isRequest
    );
  }
  renderOriginalData() {
    const { worksheetInfo, currentReport } = this.props;
    const { displaySetup, filter, style } = currentReport;
    return (
      <Collapse.Panel
        key="originalData"
        header={_l('查看原始数据')}
        className={cx({ collapsible: !displaySetup.showRowList })}
        extra={(
          <Switch
            size="small"
            checked={displaySetup.showRowList}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              this.handleChangeDisplaySetup({
                showRowList: checked
              });
            }}
          />
        )}
      >
        <OriginalData
          worksheetInfo={worksheetInfo}
          displaySetup={displaySetup}
          viewId={filter.viewId}
          style={style || {}}
          onChangeDisplaySetup={this.handleChangeDisplaySetup}
          onChangeStyle={this.handleChangeStyle}
        />
      </Collapse.Panel>
    );
  }
  renderExpandIcon(panelProps) {
    return (
      <Icon
        className={cx('Font18 mRight5 Gray_9e', { 'icon-arrow-active': panelProps.isActive })}
        icon="arrow-down-border"
      />
    );
  }
  render() {
    return (
      <div className="chartAdvanced">
        <Collapse className="chartCollapse" expandIcon={this.renderExpandIcon} ghost>
          {this.renderOriginalData()}
        </Collapse>
      </div>
    );
  }
}
