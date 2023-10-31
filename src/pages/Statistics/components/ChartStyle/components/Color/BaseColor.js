import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { ConfigProvider, Modal, Button, Radio, Input } from 'antd';
import { Icon, ColorPicker } from 'ming-ui';
import { getPorjectChartColors, reportTypes } from 'statistics/Charts/common';
import { getIsAlienationColor } from 'statistics/common';
import store from 'redux/configureStore';
import './BaseColor.less';
import _ from 'lodash';

export default class BaseColor extends Component {
  constructor(props) {
    super(props);
    const { projectId } = props;
    const chartColors = getPorjectChartColors(projectId);
    const { style, xaxes = {}, split = {}, reportType } = props.currentReport;
    const isBarChart = reportType === reportTypes.BarChart;
    const { colorType, colorGroupIndex, colorGroupId, customColors } = style ? style : {};
    const defaultColors = chartColors[0].colors;
    const defaultCustomColors = defaultColors.map(item => defaultColors[0]);
    const storeCustomColors = JSON.parse(localStorage.getItem('chartCustomColors'));
    const xaxesOptions = (xaxes.options || []).map(item => item.color);
    const splitOptions = (split.options || []).map(item => item.color);
    const controlColors = splitOptions.length ? splitOptions : xaxesOptions;
    this.isAlienationColor = getIsAlienationColor(props.currentReport) || (isBarChart && splitOptions.length);
    const type = [1, 2].includes(colorType) ? colorType : ((_.isEmpty(controlColors) || !this.isAlienationColor) ? 1 : 0);
    const defaultType = _.isEmpty(style) ? 1 : type;
    // colorGroupIndex 是老配置，表示选择的颜色组
    // colorGroupId 是新配置，表示选择的组织管理颜色组
    this.state = {
      type: defaultType,
      colorGroupIndex: colorGroupIndex || 0,
      colorGroupId: colorGroupIndex ? null : (colorGroupId || chartColors[0].id),
      colorIndex: 0,
      customColors: customColors || storeCustomColors || defaultCustomColors,
      controlColors: this.isAlienationColor ? controlColors : []
    }
    this.chartColors = chartColors;
  }
  handleSave = () => {
    const { currentReport, onChange } = this.props;
    const { type, colorGroupId, customColors } = this.state;
    const param = {
      colorType: type,
      colorGroupIndex: undefined
    };
    if (type === 1) {
      param.colorGroupId = colorGroupId;
    } else {
      param.colorGroupId = null;
      param.customColors = customColors;
      safeLocalStorageSetItem('chartCustomColors', JSON.stringify(customColors));
    }
    onChange({
      style: {
        ...currentReport.style,
        ...param
      }
    });
  }
  handleChangeType = (e) => {
    const { value } = e.target;
    this.setState({
      type: value,
      colorIndex: 0,
    });
  }
  renderBaseColorFooter() {
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
  renderColorGroup({ name, id, colors }, index, isAdaptThemeColor) {
    const { colorGroupId } = this.state;
    return (
      <div
        key={index}
        className={cx('flexRow valignWrapper colorItem', { active: id == colorGroupId })}
        onClick={() => {
          this.setState({
            colorGroupId: id
          });
        }}
      >
        <div className="flexRow valignWrapper flex wrap">
          {
            colors.map((item, index) => (
              <div
                key={index}
                className="item narrow"
                style={{
                  backgroundColor: item
                }}
              >
              </div>
            ))
          }
        </div>
        <div className="flexRow valignWrapper">
          <div className="Font13 mLeft10 colorName">{name}</div>
          <Icon className={cx('mLeft10 Font20', { Visibility: id !== colorGroupId })} icon="done" />
        </div>
      </div>
    );
  }
  renderColor(item, index) {
    const { customColors, colorIndex } = this.state;
    return (
      <div
        key={index}
        className={cx('flexRow valignWrapper colorItem', { active: index == colorIndex })}
        onClick={() => {
          this.setState({
            colorIndex: index
          });
        }}
      >
        <ColorPicker
          isPopupBody
          value={item}
          onChange={value => {
            this.setState({
              customColors: customColors.map((item, i) => {
                if (index === i) {
                  return value;
                }
                return item;
              })
            });
          }}
        >
          <div
            className="item"
            style={{
              backgroundColor: item
            }}
          >
          </div>
        </ColorPicker>
        <div className="Font13 mLeft5">{_l('色值%0', index + 1)}</div>
      </div>
    );
  }
  render() {
    const { visible, onCancel } = this.props;
    const { type, customColors, controlColors } = this.state;
    const isOptionColor = !_.isEmpty(controlColors);
    const themeColor = _.get(store.getState(), 'appPkg.iconColor');
    const adaptThemeColors = this.chartColors.filter(item => (item.themeColors || []).includes(themeColor.toLocaleUpperCase()));
    const adaptThemeId = adaptThemeColors.map(item => item.id);
    return (
      <Modal
        title={_l('图形颜色')}
        width={480}
        className="chartModal chartBaseColorModal"
        visible={visible}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
        footer={this.renderBaseColorFooter()}
        onCancel={onCancel}
      >
        <div className="mBottom16">{_l('配色方案')}</div>
        <Radio.Group onChange={this.handleChangeType} value={type}>
          {isOptionColor && <Radio value={0}>{_l('选项色')}</Radio>}
          <Radio value={1}>{_l('色板')}</Radio>
          <Radio value={2}>{_l('自定义')}</Radio>
        </Radio.Group>
        {
          type === 0 && (
            <div className="mTop20 Gray_75">
              {_l('选项色是使用工作表该选项字段所配置的颜色')}
            </div>
          )
        }
        {
          type === 1 && (
            <div className="colorSwatches">
              {
                adaptThemeColors.map((item, index) => (
                  this.renderColorGroup({ ...item, id: 'adaptThemeColor', name: _l('适应主题') }, index, true)
                ))
              }
              {!!adaptThemeColors.length && <div className="w100 mTop10 mBottom10" style={{ height: 1, background: '#ddd' }} />}
              {
                this.chartColors.filter(item => !adaptThemeId.includes(item.id)).map((item, index) => (
                  this.renderColorGroup(item, index)
                ))
              }
            </div>
          )
        }
        {
          type === 2 && (
            <div className="colorSwatches">
              {
                customColors.map((item, index) => (
                  this.renderColor(item, index)
                ))
              }
            </div>
          )
        }
      </Modal>
    );
  }
}
