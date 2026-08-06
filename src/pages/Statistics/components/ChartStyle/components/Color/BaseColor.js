import React, { Component } from 'react';
import { Button, ConfigProvider, Modal, Radio } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { ColorPicker, Icon } from 'ming-ui';
import { getPorjectChartColors, reportTypes } from 'statistics/Charts/common';
import { getIsAlienationColor } from 'statistics/common/reportDataUtils';
import store from 'src/redux/configureStore';
import { pathCompletion } from 'src/utils/common';
import './BaseColor.less';

export default class BaseColor extends Component {
  constructor(props) {
    super(props);
    const { projectId } = props;
    const chartColors = getPorjectChartColors(projectId);
    const { style, xaxes = {}, split = {}, reportType } = props.currentReport;
    const isBarChart = reportType === reportTypes.BarChart;
    const { colorType, colorGroupIndex, colorGroupId, customColors } = style ? style : {};
    const defaultColors = chartColors[0].colors;
    const defaultCustomColors = defaultColors.map(() => defaultColors[0]);
    const storeCustomColors = JSON.parse(localStorage.getItem('chartCustomColors'));
    const xaxesOptions = (xaxes.options || []).map(item => item.color);
    const splitOptions = (split.options || []).map(item => item.color);
    const controlColors = splitOptions.length ? splitOptions : xaxesOptions;
    this.isAlienationColor = getIsAlienationColor(props.currentReport) || (isBarChart && splitOptions.length);
    const type = [1, 2].includes(colorType) ? colorType : _.isEmpty(controlColors) || !this.isAlienationColor ? 1 : 0;
    const defaultType = _.isEmpty(style) ? 1 : type;
    // colorGroupIndex 是老配置，表示选择的颜色组
    // colorGroupId 是新配置，表示选择的组织管理颜色组
    this.state = {
      type: defaultType,
      colorGroupIndex: colorGroupIndex || 0,
      colorGroupId: colorGroupIndex ? null : colorGroupId || chartColors[0].id,
      colorIndex: 0,
      customColors: customColors || storeCustomColors || defaultCustomColors,
      controlColors: this.isAlienationColor ? controlColors : [],
    };
    this.chartColors = chartColors;
  }
  handleSave = () => {
    const { currentReport, onChange } = this.props;
    const { type, colorGroupId, customColors } = this.state;
    const param = {
      colorType: type,
      colorGroupIndex: undefined,
    };

    if (type === 1) {
      param.colorGroupId = colorGroupId;
      if (!colorGroupId || !colorGroupId.includes('personColor')) {
        param.personColor = undefined;
      }
    } else {
      param.colorGroupId = null;
      param.customColors = customColors;
      safeLocalStorageSetItem('chartCustomColors', JSON.stringify(customColors));
    }

    onChange({
      style: {
        ...currentReport.style,
        ...param,
      },
    });
  };
  handleChangeType = e => {
    const { value } = e.target;
    const data = {
      type: value,
      colorIndex: 0,
    };

    if (value === 2) {
      const { colorGroupId } = this.state;

      if (colorGroupId && colorGroupId.includes('personColor')) {
        const colors = _.get(this.props.currentReport, 'style.personColor.colors');

        if (colors) {
          data.customColors = colors;
        }
      } else {
        const themeColor = _.get(store.getState(), 'appPkg.iconColor');
        const adaptThemeColors = this.chartColors.filter(item =>
          (item.themeColors || []).map(n => n.toLocaleUpperCase()).includes(themeColor.toLocaleUpperCase()),
        );
        const { colors } =
          _.find(this.chartColors.concat({ ...adaptThemeColors[0], id: 'adaptThemeColor' }), { id: colorGroupId }) ||
          {};

        if (colors) {
          data.customColors = colors;
        }
      }
    }

    this.setState(data);
  };
  handleAddCustomColor = () => {
    const { customColors } = this.state;
    this.setState({
      customColors: customColors.concat('#1677ff'),
    });
  };
  renderBaseColorFooter() {
    const { type } = this.state;
    const { projectId, onCancel } = this.props;
    const { isSuperAdmin } = _.find(md.global.Account.projects, { projectId }) || {};
    return (
      <div className="mTop20 mBottom10 pRight8 flexRow alignItemsCenter">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <div className="flex flexRow pLeft7">
            {isSuperAdmin && type === 1 && (
              <Button
                type="link"
                className="pAll0"
                onClick={() => {
                  window.open(pathCompletion(`/admin/settings/${projectId}/customcolor`));
                }}
              >
                <span className="bold colorPrimary hoverColorPrimaryDark">{_l('前往组织后台编辑颜色')}</span>
              </Button>
            )}
          </div>
          <div className="flex">
            <Button type="link" className="bold" onClick={onCancel}>
              <span className="bold">{_l('取消')}</span>
            </Button>
            <Button type="primary" className="bold" onClick={this.handleSave}>
              <span className="bold">{_l('确认')}</span>
            </Button>
          </div>
        </ConfigProvider>
      </div>
    );
  }
  renderColorGroup({ name, id, colors }, index) {
    const { colorGroupId } = this.state;
    return (
      <div
        key={index}
        className={cx('flexRow valignWrapper colorItem', { active: id == colorGroupId })}
        onClick={() => {
          this.setState({
            colorGroupId: id,
          });
        }}
      >
        <div className="flexRow valignWrapper wrap" style={{ width: '65%' }}>
          {colors.map((item, index) => (
            <div
              key={index}
              className="item narrow"
              style={{
                backgroundColor: item,
                width: 240 / colors.length,
              }}
            ></div>
          ))}
        </div>
        <div className="flexRow valignWrapper flex">
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
            colorIndex: index,
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
              }),
            });
          }}
        >
          <div
            className="item"
            style={{
              backgroundColor: item,
            }}
          ></div>
        </ColorPicker>
        <div className="Font13 flex mLeft5">{_l('色值%0', index + 1)}</div>
        {customColors.length > 8 && (
          <Icon
            icon="trash"
            className="textTertiary Font20 deleteIcon"
            onClick={() => {
              this.setState({
                customColors: customColors.filter((c, i) => i !== index),
              });
            }}
          />
        )}
      </div>
    );
  }
  render() {
    const { visible, onCancel } = this.props;
    const { type, customColors, controlColors } = this.state;
    const isOptionColor = !_.isEmpty(controlColors);
    const themeColor = _.get(store.getState(), 'appPkg.iconColor');
    const adaptThemeColors = this.chartColors.filter(item =>
      (item.themeColors || []).map(n => n.toLocaleUpperCase()).includes(themeColor.toLocaleUpperCase()),
    );
    const adaptThemeId = adaptThemeColors.map(item => item.id);
    return (
      <Modal
        title={_l('图形颜色')}
        width={520}
        className="chartModal chartBaseColorModal"
        visible={visible}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font20 pointer textTertiary" />}
        footer={this.renderBaseColorFooter()}
        onCancel={onCancel}
      >
        <div className="mBottom16">{_l('配色方案')}</div>
        <Radio.Group onChange={this.handleChangeType} value={type}>
          {isOptionColor && <Radio value={0}>{_l('选项色')}</Radio>}
          <Radio value={1}>{_l('色板')}</Radio>
          <Radio value={2}>{_l('自定义')}</Radio>
        </Radio.Group>
        {type === 0 && <div className="mTop20 textSecondary">{_l('选项色是使用工作表该选项字段所配置的颜色')}</div>}
        {type === 1 && (
          <div className="colorSwatches">
            <div className="textSecondary pLeft20 pRight20">{_l('组织')}</div>
            {adaptThemeColors.map((item, index) =>
              this.renderColorGroup({ ...item, id: 'adaptThemeColor', name: _l('适应主题') }, index, true),
            )}
            {this.chartColors
              .filter(item => !adaptThemeId.includes(item.id))
              .map((item, index) => this.renderColorGroup(item, index))}
          </div>
        )}
        {type === 2 && (
          <div className="colorSwatches customSwatches">
            {customColors.map((item, index) => this.renderColor(item, index))}
            {customColors.length < 18 && (
              <div className="flexRow valignWrapper colorItem hoverText" onClick={this.handleAddCustomColor}>
                <div className="addWrap flexRow alignItemsCenter justifyContentCenter">
                  <Icon icon="add" className="Font20 textTertiary" />
                </div>
                <div className="Font13 mLeft5">{_l('添加颜色')}</div>
              </div>
            )}
          </div>
        )}
      </Modal>
    );
  }
}
