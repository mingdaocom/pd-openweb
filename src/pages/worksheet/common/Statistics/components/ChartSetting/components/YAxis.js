import React, { Component } from 'react';
import { Icon } from 'ming-ui';
import { Menu, Dropdown, Tooltip } from 'antd';
import WithoutFidldItem from './WithoutFidldItem';
import RenameModal from './RenameModal';
import { isNumberControl, normTypes } from 'src/pages/worksheet/common/Statistics/common';
import { reportTypes } from 'src/pages/worksheet/common/Statistics/Charts/common';

export default class YAxis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentControlId: null,
    };
  }
  handleVerification = (data, isAlert = false) => {
    const { yaxisList } = this.props;

    if (_.find(yaxisList, { controlId: data.controlId })) {
      isAlert && alert(_l('不允许添加重复字段'), 2);
      return false;
    }
    if (isNumberControl(data.type)) {
      return true;
    } else {
      isAlert && alert(_l('只允许添加数值和公式字段'), 2);
      return false;
    }
  };
  handleAddControl = data => {
    const { yaxisList, currentReport, onChangeCurrentReport } = this.props;

    if (this.handleVerification(data, true)) {
      const axis = {
        controlId: data.controlId,
        controlName: data.controlName,
        controlType: data.type,
        magnitude: 0,
        suffix: '',
        ydot: 2,
        normType: 1,
        dot: data.dot,
        rename: '',
      };
      const newYaxisList = yaxisList.concat(axis);
      onChangeCurrentReport({
        yaxisList: newYaxisList,
      });
    }
  };
  handleClear = id => {
    const { currentReport, yaxisList, splitId, onChangeCurrentReport } = this.props;
    const newYaxisList = yaxisList.filter(item => item.controlId !== id);
    onChangeCurrentReport({
      yaxisList: newYaxisList,
      splitId: newYaxisList.length ? splitId : '',
      sorts: currentReport.sorts.filter(item => _.findKey(item) !== id)
    });
  };
  handleNormType = (id, value) => {
    const { yaxisList, onChangeCurrentReport } = this.props;
    const newYaxisList = yaxisList.map(item => {
      if (item.controlId === id) {
        item.normType = value;
      }
      return item;
    });
    onChangeCurrentReport({
      yaxisList: newYaxisList,
    });
  };
  handleChangeRename = name => {
    const { currentControlId } = this.state;
    const { yaxisList, onChangeCurrentReport } = this.props;
    const newYaxisList = yaxisList.map(item => {
      if (item.controlId === currentControlId) {
        item.rename = name;
      }
      return item;
    });
    onChangeCurrentReport({
      yaxisList: newYaxisList,
    });
  };
  renderOverlay({ controlId, controlType, normType }) {
    const { reportType } = this.props.currentReport;
    const isNumber = isNumberControl(controlType, false);
    return (
      <Menu className="chartControlMenu chartMenu">
        <Menu.Item
          onClick={() => {
            this.setState({ currentControlId: controlId });
          }}
        >
          {_l('重命名')}
        </Menu.Item>
        {isNumber && (
          <Menu.SubMenu popupClassName="chartMenu" title={_l('计算')} popupOffset={[0, -15]}>
            {normTypes.map(item => (
              <Menu.Item
                style={{ width: 120, color: item.value === normType ? '#1e88e5' : null }}
                key={item.value}
                onClick={() => {
                  this.handleNormType(controlId, item.value);
                }}
              >
                {item.text}
              </Menu.Item>
            ))}
          </Menu.SubMenu>
        )}
      </Menu>
    );
  }
  renderModal() {
    const { yaxisList } = this.props;
    const { currentControlId } = this.state;
    const control = _.find(yaxisList, { controlId: currentControlId }) || _.object();
    return (
      <RenameModal
        dialogVisible={!!currentControlId}
        rename={control.rename || control.controlName}
        onChangeRename={this.handleChangeRename}
        onHideDialogVisible={() => {
          this.setState({
            currentControlId: null,
          });
        }}
      />
    );
  }
  renderAxis(item) {
    const tip = item.rename && item.rename !== item.controlName ? item.controlName : null;
    const isNumber = isNumberControl(item.controlType, false);
    return (
      <div className="flexRow valignWrapper fidldItem" key={item.controlId}>
        <Tooltip title={tip}>
          <span className="Gray flex ellipsis">
            {isNumber && `${_.find(normTypes, { value: item.normType }).text}: `}
            {item.rename || item.controlName || _l('该控件不存在')}
          </span>
        </Tooltip>
        <Dropdown overlay={this.renderOverlay(item)} trigger={['click']}>
          <Icon className="Gray_9e Font18 pointer" icon="arrow-down-border" />
        </Dropdown>
        <Icon
          className="Gray_9e Font18 pointer mLeft10"
          icon="close"
          onClick={() => {
            this.handleClear(item.controlId);
          }}
        />
      </div>
    );
  }
  render() {
    const { name, currentReport, yaxisList, splitId } = this.props;
    const { reportType } = currentReport;
    const only = [
      reportTypes.PieChart,
      reportTypes.NumberChart,
      reportTypes.FunnelChart,
      reportTypes.CountryLayer,
    ].includes(reportType);
    return (
      <div className="fieldWrapper mBottom20">
        <div className="Bold mBottom12">{name}</div>
        {yaxisList.map(item => this.renderAxis(item))}
        {!only && _.isEmpty(splitId) && (
          <WithoutFidldItem onVerification={this.handleVerification} onAddControl={this.handleAddControl} />
        )}
        {only && _.isEmpty(yaxisList) && (
          <WithoutFidldItem onVerification={this.handleVerification} onAddControl={this.handleAddControl} />
        )}
        {this.renderModal()}
      </div>
    );
  }
}
