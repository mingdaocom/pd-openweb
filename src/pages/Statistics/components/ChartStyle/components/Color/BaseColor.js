import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { ConfigProvider, Modal, Button, Radio, Input } from 'antd';
import { Icon, ColorPicker } from 'ming-ui';
import { getPorjectChartColors, reportTypes } from 'statistics/Charts/common';
import { getIsAlienationColor } from 'statistics/common';
import webCacheApi from 'src/api/webCache';
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
      savePersonColorVisible: false,
      type: defaultType,
      colorGroupIndex: colorGroupIndex || 0,
      colorGroupId: colorGroupIndex ? null : (colorGroupId || chartColors[0].id),
      colorIndex: 0,
      customColors: customColors || storeCustomColors || defaultCustomColors,
      controlColors: this.isAlienationColor ? controlColors : [],
      personColors: []
    }
    this.chartColors = chartColors;
  }
  componentDidMount() {
    webCacheApi.get({
      key: `${md.global.Account.accountId}-personColors`,
    }).then(data => {
      if (data.data) {
        this.setState({
          personColors: JSON.parse(data.data)
        });
      }
    });
  }
  handleSave = () => {
    const { currentReport, onChange } = this.props;
    const { type, colorGroupId, customColors, personColors } = this.state;
    const param = {
      colorType: type,
      colorGroupIndex: undefined
    };
    if (type === 1) {
      if (colorGroupId && colorGroupId.includes('personColor')) {
        param.colorGroupId = colorGroupId;
        param.personColor = _.find(personColors, { id: colorGroupId });
      } else {
        param.colorGroupId = colorGroupId;
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
        ...param
      }
    });
    if (personColors.length) {
      webCacheApi.add({
        key: `${md.global.Account.accountId}-personColors`,
        value: JSON.stringify(personColors)
      });
    } else {
      webCacheApi.clear({
        key: `${md.global.Account.accountId}-personColors`,
      });
    }
  }
  handleChangeType = (e) => {
    const { value } = e.target;
    const data = {
      type: value,
      colorIndex: 0
    }
    if (value === 2) {
      const { colorGroupId, personColors } = this.state;
      if (colorGroupId && colorGroupId.includes('personColor')) {
        const { colors } = _.find(personColors, { id: colorGroupId }) || {};
        if (colors) {
          data.customColors = colors;
        }
      } else {
        const themeColor = _.get(store.getState(), 'appPkg.iconColor');
        const adaptThemeColors = this.chartColors.filter(item => (item.themeColors || []).map(n => n.toLocaleUpperCase()).includes(themeColor.toLocaleUpperCase()));
        const { colors } = _.find(this.chartColors.concat({ ...adaptThemeColors[0], id: 'adaptThemeColor' }), { id: colorGroupId }) || {};
        if (colors) {
          data.customColors = colors;
        }
      }
    }
    this.setState(data);
  }
  handleAddCustomColor = () => {
    const { customColors } = this.state;
    this.setState({
      customColors: customColors.concat('#2196f3')
    });
  }
  handleSavePersonColor = () => {

  }
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
                  window.open(`/admin/settings/${projectId}/customcolor`);
                }}
              >
                <span className="bold ThemeColor">{_l('前往组织后台编辑颜色')}</span>
              </Button>
            )}
            {type === 2 && (
              <Button
                type="link"
                className="pAll0"
                onClick={() => {
                  this.setState({ savePersonColorVisible: true });
                }}
              >
                <span className="bold">{_l('保存为个人颜色')}</span>
              </Button>
            )}
          </div>
          <div className="flex">
            <Button
              type="link"
              className="bold"
              onClick={onCancel}
            >
              <span className="bold">{_l('取消')}</span>
            </Button>
            <Button
              type="primary"
              className="bold"
              onClick={this.handleSave}
            >
              <span className="bold">{_l('确认')}</span>
            </Button>
          </div>
        </ConfigProvider>
      </div>
    );
  }
  renderColorGroup({ name, id, colors }, index, isAdaptThemeColor) {
    const { colorGroupId, personColors } = this.state;
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
        <div className="flexRow valignWrapper wrap" style={{ width: '65%' }}>
          {
            colors.map((item, index) => (
              <div
                key={index}
                className="item narrow"
                style={{
                  backgroundColor: item,
                  width: 240 / colors.length
                }}
              >
              </div>
            ))
          }
        </div>
        <div className="flexRow valignWrapper flex">
          <div className="Font13 mLeft10 colorName">{name}</div>
          <Icon className={cx('mLeft10 Font20', { Visibility: id !== colorGroupId })} icon="done" />
          {id && id.includes('personColor') && id !== colorGroupId && (
            <Icon
              className="Gray_9e Font20 deleteIcon"
              icon="delete2"
              onClick={event => {
                event.stopPropagation();
                this.setState({
                  personColors: personColors.filter(item => item.id !== id)
                });
              }}
            />
          )}
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
        <div className="Font13 flex mLeft5">{_l('色值%0', index + 1)}</div>
        {customColors.length > 8 && (
          <Icon
            icon="delete2"
            className="Gray_9e Font20 deleteIcon"
            onClick={() => {
              this.setState({
                customColors: customColors.filter((c, i) => i !== index)
              });
            }}
          />
        )}
      </div>
    );
  }
  render() {
    const { visible, onCancel } = this.props;
    const { type, customColors, controlColors, personColors, savePersonColorVisible } = this.state;
    const isOptionColor = !_.isEmpty(controlColors);
    const themeColor = _.get(store.getState(), 'appPkg.iconColor');
    const adaptThemeColors = this.chartColors.filter(item => (item.themeColors || []).map(n => n.toLocaleUpperCase()).includes(themeColor.toLocaleUpperCase()));
    const adaptThemeId = adaptThemeColors.map(item => item.id);
    return (
      <Fragment>
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
                <div className="Gray_75 pLeft20 pRight20">{_l('组织')}</div>
                {
                  adaptThemeColors.map((item, index) => (
                    this.renderColorGroup({ ...item, id: 'adaptThemeColor', name: _l('适应主题') }, index, true)
                  ))
                }
                {
                  this.chartColors.filter(item => !adaptThemeId.includes(item.id)).map((item, index) => (
                    this.renderColorGroup(item, index)
                  ))
                }
                {!!personColors.length && <div className="Gray_75 mTop6 pLeft20 pRight20">{_l('个人')}</div>}
                {
                  personColors.map((item, index) => (
                    this.renderColorGroup(item, index)
                  ))
                }
              </div>
            )
          }
          {
            type === 2 && (
              <div className="colorSwatches customSwatches">
                {
                  customColors.map((item, index) => (
                    this.renderColor(item, index)
                  ))
                }
                {customColors.length < 18 && (
                  <div className="flexRow valignWrapper colorItem hoverText" onClick={this.handleAddCustomColor}>
                    <div className="addWrap flexRow alignItemsCenter justifyContentCenter">
                      <Icon icon="add" className="Font20 Gray_9d" />
                    </div>
                    <div className="Font13 mLeft5">
                      {_l('添加颜色')}
                    </div>
                  </div>
                )}
              </div>
            )
          }
        </Modal>
        <Modal
          title={_l('保存')}
          width={480}
          className="chartModal savePersonColorModal"
          visible={savePersonColorVisible}
          centered={true}
          destroyOnClose={true}
          closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
          footer={(
            <div className="mTop20 mBottom10 pRight8">
              <ConfigProvider autoInsertSpaceInButton={false}>
                <Button
                  type="link"
                  onClick={() => this.setState({ savePersonColorVisible: false })}
                >
                  {_l('取消')}
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    const { value } = document.querySelector('.savePersonColorModal input');
                    if (!value) {
                      alert(_l('请输入名称'), 3);
                      return;
                    }
                    this.setState({
                      type: 1,
                      savePersonColorVisible: false,
                      personColors: this.state.personColors.concat({
                        id: `personColor-${Date.now()}`,
                        name: value,
                        colors: this.state.customColors,
                      })
                    });
                  }}
                >
                  {_l('确认')}
                </Button>
              </ConfigProvider>
            </div>
          )}
          onCancel={() => this.setState({ savePersonColorVisible: false })}
        >
          <Input className="chartInput" autoFocus />
        </Modal>
      </Fragment>
    );
  }
}
