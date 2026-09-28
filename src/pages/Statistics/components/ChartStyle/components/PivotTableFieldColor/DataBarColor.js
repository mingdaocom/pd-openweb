import React, { Component, Fragment } from 'react';
import { ColorPicker, Icon } from 'ming-ui';
import { Checkbox, Input, Modal, Select } from 'ming-ui/antd-components';
import { formatNumberFromInput } from 'src/utils/domain/control/number';

export default class DataBarColor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      min: 0,
      max: undefined,
      positiveNumberColor: '#44b9b0',
      negativeNumberColor: '#fe423f',
      axisColor: '#151515',
      direction: 1,
      onlyShowBar: false,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.visible) {
        const { colorRule } = this.props;
        this.setState(colorRule);
      }
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
      onlyShowBar,
    });
  };
  renderContent() {
    const { min, max, positiveNumberColor, negativeNumberColor, axisColor, direction, onlyShowBar } = this.state;
    return (
      <Fragment>
        <div className="flexRow dataBarColorContent">
          <div className="flex mRight10">
            <div className="mBottom8">{_l('最小值')}</div>
            <Input
              value={min}
              className="mRight10"
              placeholder={_l('最小值')}
              onChange={() => {
                const value = formatNumberFromInput(event.target.value);
                this.setState({ min: value ? value : undefined });
              }}
              onBlur={() => {
                this.setState({ min: min ? Number(min) : undefined });
              }}
            />
            <div className="mTop12 mBottom8">{_l('正值条形图')}</div>
            <ColorPicker
              isPopupBody
              value={positiveNumberColor}
              onChange={value => {
                this.setState({ positiveNumberColor: value });
              }}
            >
              <div className="palette valignWrapper pointer" style={{ width: 56 }}>
                <div className="colorBox" style={{ backgroundColor: positiveNumberColor }}></div>
                <Icon icon="expand_more" className="textTertiary Font20" />
              </div>
            </ColorPicker>
            <div className="mTop12 mBottom8">{_l('负值条形图')}</div>
            <ColorPicker
              isPopupBody
              value={negativeNumberColor}
              onChange={value => {
                this.setState({ negativeNumberColor: value });
              }}
            >
              <div className="palette valignWrapper pointer" style={{ width: 56 }}>
                <div className="colorBox" style={{ backgroundColor: negativeNumberColor }}></div>
                <Icon icon="expand_more" className="textTertiary Font20" />
              </div>
            </ColorPicker>
            <div className="mTop12">
              <Checkbox
                checked={onlyShowBar}
                onChange={e => {
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
              className="mRight10"
              placeholder={_l('最大值')}
              onChange={() => {
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
              className="mRight10"
              value={direction}
              suffixIcon={<Icon icon="expand_more" className="textTertiary Font20" />}
              options={[
                {
                  value: 1,
                  label: _l('从左到右'),
                },
                {
                  value: 2,
                  label: _l('从右到左'),
                },
              ]}
              onChange={type => {
                this.setState({ direction: type });
              }}
            />
            <div className="mTop12 mBottom8">{_l('轴')}</div>
            <ColorPicker
              isPopupBody
              value={axisColor}
              onChange={value => {
                this.setState({ axisColor: value });
              }}
            >
              <div className="palette valignWrapper pointer" style={{ width: 56 }}>
                <div className="colorBox" style={{ backgroundColor: axisColor }}></div>
                <Icon icon="expand_more" className="textTertiary Font20" />
              </div>
            </ColorPicker>
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
        open={visible}
        centered={true}
        closeIcon={<Icon icon="close" className="Font20 pointer textTertiary" />}
        onOk={this.handleSave}
        onCancel={onCancel}
      >
        {this.renderContent()}
      </Modal>
    );
  }
}
