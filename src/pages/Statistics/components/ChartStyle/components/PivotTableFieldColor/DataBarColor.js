import React, { Component, Fragment } from 'react';
import { Input, Select, Checkbox, Modal, ConfigProvider, Button } from 'antd';
import { formatNumberFromInput } from 'src/util';
import { Icon } from 'ming-ui';
import cx from 'classnames';

export default class DataBarColor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      min: 0,
      max: undefined,
      positiveNumberColor: '#44b9b0',
      negativeNumberColor: '#fe423f',
      axisColor: '#333333',
      direction: 1,
      onlyShowBar: false
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      const { colorRule } = nextProps;
      this.setState(colorRule);
    }
  }
  handleSave = () => {
    const { min, max, positiveNumberColor, negativeNumberColor, axisColor, direction, onlyShowBar } = this.state;
    this.props.onSave({
      min,
      max,
      positiveNumberColor,
      negativeNumberColor,
      axisColor,
      direction,
      onlyShowBar
    });
  }
  renderRuleColorFooter() {
    const { onCancel } = this.props;
    return (
      <div className="mTop20 mBottom10 pRight8">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button
            type="link"
            onClick={onCancel}
          >
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={this.handleSave}>
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  renderContent() {
    const { min, max, positiveNumberColor, negativeNumberColor, axisColor, direction, onlyShowBar } = this.state; 
    return (
      <Fragment>
        <div className="flexRow">
          <div className="flex mRight10">
            <div className="mBottom8">{_l('最小值')}</div>
            <Input
              value={min}
              className="chartInput mRight10"
              placeholder={_l('最小值')}
              onChange={(e) => {
                const value = formatNumberFromInput(event.target.value);
                this.setState({ min: value ? value : undefined });
              }}
              onBlur={() => {
                this.setState({ min: min ? Number(min) : undefined });
              }}
            />
            <div className="mTop12 mBottom8">{_l('正值条形图')}</div>
            <div className="palette valignWrapper" style={{ width: 56 }}>
              <div className="colorBox" style={{ backgroundColor: positiveNumberColor }}></div>
              <input
                type="color"
                className="colorInput pointer"
                value={positiveNumberColor}
                onChange={(event) => {
                  this.setState({ positiveNumberColor: event.target.value });
                }}
              />
              <Icon icon="expand_more" className="Gray_9e Font20" />
            </div>
            <div className="mTop12 mBottom8">{_l('负值条形图')}</div>
            <div className="palette valignWrapper" style={{ width: 56 }}>
              <div className="colorBox" style={{ backgroundColor: negativeNumberColor }}></div>
              <input
                type="color"
                className="colorInput pointer"
                value={negativeNumberColor}
                onChange={(event) => {
                  this.setState({ negativeNumberColor: event.target.value });
                }}
              />
              <Icon icon="expand_more" className="Gray_9e Font20" />
            </div>
            <div className="mTop12">
              <Checkbox
                checked={onlyShowBar}
                onChange={(e) => {
                  this.setState({ onlyShowBar: e.target.checked });
                }}
              >
                {_l('仅显示条形图')}
              </Checkbox>
            </div>
          </div>
          <div className="flex">
            <div className="mBottom8">{_l('最大值')}</div>
            <Input
              value={max}
              className="chartInput mRight10"
              placeholder={_l('最大值')}
              onChange={(e) => {
                const value = formatNumberFromInput(event.target.value);
                this.setState({ max: value ? value : undefined });
              }}
              onBlur={() => {
                this.setState({ max: max ? Number(max) : undefined });
              }}
            />
            <div className="mTop12 mBottom8">{_l('条形图方向')}</div>
            <Select
              style={{ width: 230 }}
              className="chartSelect mRight10"
              value={direction}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={(type) => {
                this.setState({ direction: type });
              }}
            >
              <Select.Option className="selectOptionWrapper" value={1}>{_l('从左到右')}</Select.Option>
              <Select.Option className="selectOptionWrapper" value={2}>{_l('从右到左')}</Select.Option>
            </Select>
            <div className="mTop12 mBottom8">{_l('轴')}</div>
            <div className="palette valignWrapper" style={{ width: 56 }}>
              <div className="colorBox" style={{ backgroundColor: axisColor }}></div>
              <input
                type="color"
                className="colorInput pointer"
                value={axisColor}
                onChange={(event) => {
                  this.setState({ axisColor: event.target.value });
                }}
              />
              <Icon icon="expand_more" className="Gray_9e Font20" />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
  render() {
    const { visible, onCancel } = this.props;
    return (
      <Modal
        title={_l('数据条')}
        width={580}
        className="chartModal chartRuleColorModal"
        visible={visible}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
        footer={this.renderRuleColorFooter()}
        onCancel={onCancel}
      >
        {this.renderContent()}
      </Modal>
    );
  }
}
