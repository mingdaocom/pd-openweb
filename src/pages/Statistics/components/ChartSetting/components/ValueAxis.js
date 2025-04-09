import React, { Component } from 'react';
import { Icon } from 'ming-ui';
import { Menu, Dropdown, Tooltip } from 'antd';
import WithoutFidldItem from './WithoutFidldItem';
import { isNumberControl } from 'statistics/common';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { normTypes } from '../../../enum';

export default class ValueAxis extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleVerification = (data, isAlert = false) => {
    if (isNumberControl(data.type) || data.type === WIDGETS_TO_API_TYPE_ENUM.SCORE) {
      return true;
    } else {
      isAlert && alert(_l('只允许添加数值和公式字段'), 2);
      return false;
    }
  };
  handleAddControl = data => {
    if (this.handleVerification(data, true)) {
      this.props.addValueAxis(data);
    }
  };
  renderOverlay() {
    const { valueAxis } = this.props;
    return (
      <Menu className="chartControlMenu chartMenu" expandIcon={<Icon icon="arrow-right-tip" />} subMenuOpenDelay={0.2}>
        {isNumberControl(valueAxis.controlType, false) && (
          <Menu.SubMenu popupClassName="chartMenu" title={_l('计算')} popupOffset={[0, -15]}>
            {normTypes
              .filter(n => ![5, 6].includes(n.value))
              .map(item => (
                <Menu.Item
                  style={{ width: 120, color: item.value === valueAxis.normType ? '#1e88e5' : null }}
                  key={item.value}
                  onClick={() => {
                    this.props.changeValueAxis({ normType: item.value });
                  }}
                >
                  {item.text}
                </Menu.Item>
              ))}
          </Menu.SubMenu>
        )}
        {!isNumberControl(valueAxis.controlType) && (
          <Menu.SubMenu popupClassName="chartMenu" title={_l('计算')} popupOffset={[0, -15]}>
            {[
              {
                text: _l('计数'),
                value: 5,
              },
              {
                text: _l('去重计数'),
                value: 6,
              },
            ].map(item => (
              <Menu.Item
                style={{ width: 120, color: item.value === valueAxis.normType ? '#1e88e5' : null }}
                key={item.value}
                onClick={() => {
                  this.props.changeValueAxis({ normType: item.value });
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
  renderAxis() {
    const { valueAxis, allControls, axisControls } = this.props;
    const tip = valueAxis.rename && valueAxis.rename !== valueAxis.controlName ? valueAxis.controlName : null;
    const isNumber = isNumberControl(valueAxis.controlType, false);
    const axis = _.find(axisControls, { controlId: valueAxis.controlId });
    const control = _.find(allControls, { controlId: valueAxis.controlId }) || {};
    return (
      <div className="flexRow valignWrapper fidldItem">
        {axis ? (
          <Tooltip title={tip}>
            <span className="Gray flex ellipsis">
              {isNumber && `${_.find(normTypes, { value: valueAxis.normType }).text}: `}
              {axis.controlName}
            </span>
          </Tooltip>
        ) : control.strDefault === '10' ? (
          <span className="Red flex ellipsis">{`${control.controlName} (${_l('无效类型')})`}</span>
        ) : (
          <Tooltip title={`ID: ${valueAxis.controlId}`}>
            <span className="Red flex ellipsis">{_l('字段已删除')}</span>
          </Tooltip>
        )}
        {isNumber && (
          <Dropdown overlay={this.renderOverlay(axis)} trigger={['click']} placement="bottomRight">
            <Icon className="Gray_9e Font18 pointer" icon="arrow-down-border" />
          </Dropdown>
        )}
        <Icon className="Gray_9e Font18 pointer mLeft10" icon="close" onClick={this.props.removeValueAxis} />
      </div>
    );
  }
  render() {
    const { name, valueAxis } = this.props;
    return (
      <div className="fieldWrapper mBottom20">
        <div className="Bold mBottom8 title">{name}</div>
        {valueAxis.controlId ? (
          this.renderAxis()
        ) : (
          <WithoutFidldItem
            allowInput={true}
            inputValue={valueAxis.value ? Number(valueAxis.value) : valueAxis.value}
            onChnageInputValue={(value, isRequest) => {
              this.props.changeValueAxis({ value }, isRequest);
            }}
            onVerification={this.handleVerification}
            onAddControl={this.handleAddControl}
          />
        )}
      </div>
    );
  }
}
