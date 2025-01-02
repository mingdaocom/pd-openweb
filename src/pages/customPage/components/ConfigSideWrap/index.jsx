import React, { useState, Fragment } from 'react';
import { Icon, ColorPicker } from 'ming-ui';
import { Tooltip, Checkbox, Select, Switch, Input } from 'antd';
import cx from 'classnames';
import { generate } from '@ant-design/colors';
import { getPorjectChartColors } from 'statistics/Charts/common';
import SideWrap from 'src/pages/customPage/components/SideWrap';
import styled from 'styled-components';
import BaseColor from 'statistics/components/ChartStyle/components/Color/BaseColor';
import store from 'redux/configureStore';
import { isLightColor } from 'src/pages/customPage/util';

const SideWrapper = styled(SideWrap)`
  &.sideAbsolute {
    position: absolute;
    header {
      padding: 0 24px 0 24px;
    }
    .mask {
      background-color: transparent !important;
    }
    .sideContentWrap {
      position: absolute;
    }
    .sideContent {
      margin-top: 20px;
      padding-bottom: 30px;
    }
  }
  .sideContentWrap {
    width: 560px;
  }
  header {
    box-shadow: none;
  }
`;

const Wrap = styled.div`
  .colorWrap, .addColor, .defaultColor {
    cursor: pointer;
    margin-right: 10px;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    border: 1px solid #E0E0E0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .colorWrap.active {
    position: relative;
    border-color: #fff;
    &::after {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      width: 32px;
      height: 32px;
      border: 1px solid #E0E0E0;
      border-radius: 4px;
    }
  }
  .defaultColor {
    position: relative;
    &.active {
      border-color: #2196F3;
      &::after {
        background-color: #2196F3;
      }
    }
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      width: 1px;
      height: 100%;
      background-color: #E0E0E0;
      transform: rotateZ(-45deg);
    }
  }
  .colorSpacingLine {
    width: 1px;
    height: 22px;
    margin: 0 10px;
    background-color: #d2d1d1;
  }
  .line {
    width: 100%;
    height: 1px;
    background-color: #E6E6E6;
  }
  .selectChartColor {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #DDDDDD;
    .colorBlock {
      width: 24px;
      height: 24px;
      margin-right: 7px;
    }
    .colorName {
      width: 200px;
    }
  }
  .label {
    width: 60px;
    margin-right: 30px;
    font-weight: 600;
  }
  .icon-delete1:hover {
    color: #F44336 !important;
  }
  .typeSelect {
    font-size: 13px;
    border-radius: 3px;
    width: max-content;
    padding: 3px;
    background-color: #eff0f0;
    >div {
      height: 25px;
      line-height: 25px;
      padding: 0 15px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .active {
      color: #2196F3 !important;
      border-radius: 3px;
      font-weight: bold;
      background-color: #fff;
    }
  }
  .pageSelect {
    &.ant-select:not(.ant-select-disabled):hover .ant-select-selector, &.ant-select-focused:not(.ant-select-disabled).ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
      border-color: #2196F3 !important;
    }
    .ant-select-selector {
      border-radius: 4px !important;
      box-shadow: none !important;
    }
    .ant-select-selector, .ant-select-selection-item {
      height: 32px;
      line-height: 30px;
    }
    .ant-select-arrow {
      width: auto;
      height: auto;
      top: 40%;
    }
    &.ant-select-single.ant-select-show-arrow .ant-select-selection-item, .ant-select-single.ant-select-show-arrow .ant-select-selection-placeholder {
      opacity: 1;
      font-size: 13px;
    }
    &.ant-select-single.ant-select-open .ant-select-selection-item {
      color: inherit;
    }
  }
  .pageInput {
    &.ant-input-affix-wrapper {
      padding: 0 0 0 11px;
      .ant-input {
        height: 30px;
      }
    }
    &.ant-input-affix-wrapper:hover, &:hover {
      border-color: #2196F3 !important;
    }
    &.ant-input-affix-wrapper, &.ant-input-affix-wrapper-focused, & {
      border-radius: 4px !important;
      box-shadow: none !important;
    }
    .ant-input-suffix {
      width: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0 4px 4px 0;
      border-left: 1px solid #d9d9d9;
      background-color: #fff;
    }
    .icon-expand_less, .icon-expand_more {
      line-height: 10px;
    }
    &.ant-picker-range .ant-picker-input > input {
      font-size: 13px;
    }
  }
`;

const refreshs = [{
  value: 0,
  name: _l('关闭')
}, {
  value: 30,
  name: _l('30秒'),
}, {
  value: 60,
  name: _l('1分钟'),
}, {
  value: 60 * 2,
  name: _l('2分钟'),
}, {
  value: 60 * 3,
  name: _l('3分钟'),
}, {
  value: 60 * 4,
  name: _l('4分钟'),
}, {
  value: 60 * 5,
  name: _l('5分钟'),
}];

export const defaultConfig = {
  pageBgColor: '#f5f6f7',
  chartColor: '',
  chartColorIndex: 1,
  numberChartColor: '',
  numberChartColorIndex: 1,
  pivoTableColor: '',
  refresh: 0,
  headerVisible: true,
  shareVisible: true,
  chartShare: true,
  chartExportExcel: true,
  downloadVisible: true,
  fullScreenVisible: true,
  customColors: []
};

export default (props) => {
  const { adjustScreen, apk, className, urlParams = [] } = props;
  const { onClose, updatePageInfo, updateModified = _.noop } = props;
  const [selectChartColorVisible, setSelectChartColorVisible] = useState(false);
  const { appPkg } = store.getState();
  const { iconColor, currentPcNaviStyle } = appPkg;
  const lightColor = generate(iconColor)[0];
  const config = props.config || defaultConfig;

  const handleChangeConfig = data => {
    updateModified(true);
    const params = {
      config: {
        ...config,
        ...data
      }
    };
    if (data.autoLinkage === false) {
      params.linkageFiltersGroup = {};
    }
    updatePageInfo(params);
  }

  const themeColors = [{
    color: iconColor,
    title: _l('主题深色'),
    value: 'iconColor'
  }, {
    color: lightColor,
    title: _l('主题浅色'),
    value: 'lightColor'
  }];

  const renderBgConfig = () => {
    const baseColors = [{
      color: '#ffffff',
      value: '#ffffff',
      title: _l('白色')
    }, {
      color: '#f5f6f7',
      value: '#f5f6f7',
      title: _l('灰色')
    }, {
      color: '#1b2025',
      value: '#1b2025',
      title: _l('黑色')
    }];
    const colors = themeColors.concat(baseColors);
    const { customColors = [], chartColorIndex = 1 } = config;
    const handleChangeColor = pageBgColor => {
      if (_.find(themeColors, { value: pageBgColor }) && !config.chartColor) {
        const chartColors = getPorjectChartColors(apk.projectId);
        const adaptThemeColors = chartColors.filter(item => (item.themeColors || []).includes(iconColor));
        handleChangeConfig({
          pageBgColor,
          chartColor: {
            colorGroupId: 'adaptThemeColor',
            colorGroupIndex: undefined,
            colorType: 1
          },
          chartColorIndex: chartColorIndex + 1
        });
      } else {
        handleChangeConfig({ pageBgColor });
      }
    }
    return (
      <Fragment>
        <div className="Gray Font14 bold mBottom10">{_l('页面背景')}</div>
        <div className="flexRow alignItemsCenter pageBgColors">
          {colors.map(data => (
            data.title ? (
              <Tooltip key={data.value || data.color} title={data.title} color="#000" placement="bottom">
                <div
                  className={cx('colorWrap', { active: data.value === config.pageBgColor })}
                  style={{ backgroundColor: data.color }}
                  onClick={() => handleChangeColor(data.value)}
                >
                </div>
              </Tooltip>
            ) : (
              <div
                key={data}
                className={cx('colorWrap', { active: data === config.pageBgColor })}
                style={{ backgroundColor: data }}
                onClick={() => handleChangeColor(data)}
              >
              </div>
            )
          ))}
          {/*customColors.map((data, index) => (
            <ColorPicker
              isPopupBody
              sysColor
              value={data}
              onChange={value => {
                handleChangeConfig({
                  pageBgColor: value,
                  customColors: customColors.map((c, i) => {
                    if (i === index) {
                      return value;
                    }
                    return c;
                  })
                });
              }}
            >
              <div key={data} className="colorWrap" style={{ backgroundColor: data }} onClick={() => handleChangeColor(data)}>
                {data === config.pageBgColor && <Icon className={cx('Font16', isLightColor(data) ? 'Gray' : 'White')} icon="done" />}
              </div>
            </ColorPicker>
          ))/*}
          {/*customColors.length <= 5 && (
            <div
              className="addColor flexRow alignItemsCenter justifyContentCenter"
              onClick={() => {
                handleChangeConfig({
                  customColors: customColors.concat('#000000')
                });
                setTimeout(() => {
                  const els = document.querySelectorAll('.customPageWrap .pageBgColors .colorWrap');
                  const lastEl = els[els.length - 1];
                  lastEl.click();
                }, 0);
              }}>
              <Icon icon="add" className="Gray_9e Font20" />
            </div>
          )*/}
        </div>
      </Fragment>
    );
  };

  const renderChartColorConfig = () => {
    const { chartColor } = config;
    const baseColors = [{
      color: '#1b2025',
      value: '#1b2025',
      title: _l('黑色')
    }];
    const colors = [themeColors[0]].concat(baseColors);
    const handleChangeColor = numberChartColor => {
      const { numberChartColorIndex = 1 } = config;
      handleChangeConfig({
        numberChartColor,
        numberChartColorIndex: numberChartColorIndex + 1
      });
    }
    const getColorConfig = () => {
      const { colorType, colorGroupId, customColors } = chartColor || {};
      const chartColors = getPorjectChartColors(apk.projectId);
      const defaultConfig = { name: _l('未配置'), showColors: [] };
      if (!config.chartColor) {
        return defaultConfig;
      }
      if (colorType === 2) {
        return {
          name: _l('自定义颜色'),
          showColors: customColors
        };
      } else if (colorGroupId === 'adaptThemeColor') {
        const adaptThemeColors = chartColors.filter(item => (item.themeColors || []).includes(iconColor));
        if (adaptThemeColors.length) {
          return {
            name: _l('适应主题'),
            showColors: adaptThemeColors[0].colors
          }
        } else {
          return {
            name: chartColors[0].name,
            showColors: chartColors[0].colors
          };
        }
      } else {
        const data = _.find(chartColors, { id: colorGroupId }) || chartColors[0];
        return {
          name: data.name,
          showColors: data.colors
        }
      }
      return defaultConfig;
    }
    const { name, showColors } = getColorConfig();
    return (
      <Fragment>
        <div className="Gray Font14 bold mBottom10">{_l('全局颜色')}</div>
        <div className="Gray_9e Font13">{_l('为所有图表设置统一颜色，全局颜色将覆盖图表本色的颜色配置。')}</div>
        <div className="Gray_75 Font13 bold mTop20 mBottom10">{_l('图表配色')}</div>
        <div className="flexRow alignItemsCenter">
          <div className="selectChartColor flexRow alignItemsCenter pointer flex" onClick={() => setSelectChartColorVisible(true)}>
            <div className="flexRow alignItemsCenter flex">
              {showColors.map((color, index) => (
                <div key={index} style={{ background: color }} className="colorBlock" />
              ))}
              <div className="colorName ellipsis">{name}</div>
            </div>
            <Icon icon="arrow-down-border" className="Gray_9e Font18" />
          </div>
          {/*
          <div className="colorSpacingLine" />
          <Tooltip title={_l('使用图表颜色')} color="#000" placement="bottom">
            <div
              className={cx('defaultColor', { active: !config.chartColor })}
              onClick={() => {
                const checked = !!config.chartColor;
                if (checked) {
                  handleChangeConfig({ chartColor: '' });
                }
              }}
            >
            </div>
          </Tooltip>
          */}
        </div>
        <div className="Gray_75 Font13 bold mTop20 mBottom10">{_l('数值颜色')}</div>
        <div className="flexRow alignItemsCenter">
          {colors.map((data, index) => (
            data.title ? (
              <Tooltip key={index} title={data.title} color="#000" placement="bottom">
                <div
                  className={cx('colorWrap', { active: data.value === config.numberChartColor })}
                  style={{ backgroundColor: data.color }}
                  onClick={() => handleChangeColor(data.value)}
                >
                </div>
              </Tooltip>
            ) : (
              <div
                key={index}
                className={cx('colorWrap', { active: data.value === config.numberChartColor })}
                style={{ backgroundColor: data }}
                onClick={() => handleChangeColor(data)}
              >
              </div>
            )
          ))}
          {/*
          <div className="colorSpacingLine mLeft0" />
          <Tooltip title={_l('使用图表颜色')} color="#000" placement="bottom">
            <div
              className={cx('defaultColor', { active: !config.numberChartColor })}
              onClick={() => {
                const checked = !!config.numberChartColor;
                if (checked) {
                  handleChangeColor('');
                }
              }}
            >
            </div>
          </Tooltip>
          */}
        </div>
        <BaseColor
          visible={selectChartColorVisible}
          projectId={apk.projectId}
          currentReport={{
            style: chartColor
          }}
          onChange={(data) => {
            const { chartColorIndex = 1 } = config;
            handleChangeConfig({
              chartColor: data.style,
              chartColorIndex: chartColorIndex + 1
            });
            setSelectChartColorVisible(false);
          }}
          onCancel={() => setSelectChartColorVisible(false)}
        />
      </Fragment>
    );
  };

  const renderPivoTableColorConfig = () => {
    const baseColors = [{
      color: '#f5f6f7',
      value: '#f5f6f7',
      title: _l('灰色')
    }, {
      color: '#1b2025',
      value: '#1b2025',
      title: _l('黑色')
    }];
    const colors = themeColors.concat(baseColors);
    const handleChangeColor = pivoTableColor => {
      const { pivoTableColorIndex = 1 } = config;
      handleChangeConfig({
        pivoTableColor,
        pivoTableColorIndex: pivoTableColorIndex + 1
      });
    }
    return (
      <Fragment>
        <div className="Gray_75 Font13 bold mTop20 mBottom10">{_l('透视表颜色')}</div>
        <div className="flexRow alignItemsCenter">
          {colors.map((data, index) => (
            data.title ? (
              <Tooltip key={index} title={data.title} color="#000" placement="bottom">
                <div
                  className={cx('colorWrap', { active: data.value === config.pivoTableColor })}
                  style={{ backgroundColor: data.color }}
                  onClick={() => handleChangeColor(data.value)}
                >
                </div>
              </Tooltip>
            ) : (
              <div
                key={index}
                className={cx('colorWrap', { active: data === config.pivoTableColor })}
                style={{ backgroundColor: data }}
                onClick={() => handleChangeColor(data)}
              >
              </div>
            )
          ))}
          {/*
          <div className="colorSpacingLine mLeft0" />
          <Tooltip title={_l('使用图表颜色')} color="#000" placement="bottom">
            <div
              className={cx('defaultColor', { active: !config.pivoTableColor })}
              onClick={() => {
                const checked = !!config.pivoTableColor;
                if (checked) {
                  handleChangeColor('');
                }
              }}
            >
            </div>
          </Tooltip>
          */}
        </div>
      </Fragment>
    );
  };

  const renderPageConfig = () => {
    return (
      <Fragment>
        <div className="Gray Font14 bold mTop20 mBottom10">{_l('通用')}</div>
        <div className="flexRow alignItemsCenter">
          <div className="Gray_75 Font13 label">{_l('页面布局')}</div>
          <div className="flex">
            <div className="typeSelect flexRow valignWrapper">
              <div className={cx('centerAlign pointer Gray_75', { active: !adjustScreen })} onClick={() => updatePageInfo({ adjustScreen: false })}>{_l('滚动')}</div>
              <div className={cx('centerAlign pointer Gray_75', { active: adjustScreen })} onClick={() => updatePageInfo({ adjustScreen: true })}>{_l('适应屏幕高度')}</div>
            </div>
          </div>
        </div>
        <div className="flexRow alignItemsCenter mTop15">
          <div className="Gray_75 Font13 label">{_l('自动刷新')}</div>
          <div className="flex">
            <Select
              className="pageSelect w100"
              value={config.refresh}
              suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
              onChange={value => {
                handleChangeConfig({
                  refresh: value
                });
              }}
            >
              {refreshs.map(data => (
                <Select.Option className="selectOptionWrapper" value={data.value}>
                  {data.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
        {currentPcNaviStyle !== 2 && (
          <div className="flexRow mTop15">
            <div className="Gray_75 Font13 label">{_l('标题区')}</div>
            <div className="flex">
              <div className="mBottom15">
                <label className="flexRow alignItemsCenter pointer">
                  <Switch
                    className="mRight5"
                    size="small"
                    checked={config.headerVisible}
                    onChange={checked => {
                      handleChangeConfig({
                        headerVisible: checked,
                      });
                    }}
                  />
                  {_l('显示标题栏')}
                </label>
              </div>
              {config.headerVisible && (
                <div className="flexRow alignItemsCenter">
                  <div className="mRight15">{_l('页面操作')}</div>
                  <Checkbox
                    className="flexRow alignItemsCenter"
                    checked={config.shareVisible}
                    onChange={(event) => {
                      handleChangeConfig({
                        shareVisible: event.target.checked
                      });
                    }}
                  >
                    {_l('分享')}
                  </Checkbox>
                  <Checkbox
                    className="flexRow alignItemsCenter"
                    checked={config.downloadVisible}
                    onChange={(event) => {
                      handleChangeConfig({
                        downloadVisible: event.target.checked
                      });
                    }}
                  >
                    {_l('下载')}
                  </Checkbox>
                  <Checkbox
                    className="flexRow alignItemsCenter"
                    checked={config.fullScreenVisible}
                    onChange={(event) => {
                      handleChangeConfig({
                        fullScreenVisible: event.target.checked
                      });
                    }}
                  >
                    {_l('全屏')}
                  </Checkbox>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="flexRow mTop15 mBottom20">
          <div className="Gray_75 Font13 label">{_l('图表操作')}</div>
          <div className="flex">
            <Checkbox
              className="flexRow alignItemsCenter"
              checked={_.isUndefined(config.chartShare) ? true : config.chartShare}
              onChange={(event) => {
                handleChangeConfig({
                  chartShare: event.target.checked
                });
              }}
            >
              {_l('分享')}
            </Checkbox>
            <Checkbox
              className="flexRow alignItemsCenter"
              checked={_.isUndefined(config.chartExportExcel) ? true : config.chartExportExcel}
              onChange={(event) => {
                handleChangeConfig({
                  chartExportExcel: event.target.checked
                });
              }}
            >
              {_l('导出Excel')}
            </Checkbox>
          </div>
        </div>
        <div className="flexRow mTop15 mBottom20">
          <div className="Gray_75 Font13 label">{_l('联动筛选')}</div>
          <div className="flex">
            <label className="flexRow alignItemsCenter pointer">
              <Switch
                className="mRight5"
                size="small"
                checked={config.autoLinkage}
                onChange={checked => {
                  handleChangeConfig({
                    autoLinkage: checked,
                  });
                }}
              />
              {_l('同数据源组件自动关联')}
            </label>
          </div>
        </div>
      </Fragment>
    );
  };

  const renderUrlparamsConfig = () => {
    const onAdd = () => {
      updatePageInfo({
        urlParams: urlParams.concat('')
      });
      setTimeout(() => {
        const inputs = document.querySelectorAll('.urlParamsWrap input');
        const input = inputs[inputs.length - 1];
        input && input.focus();
      }, 0);
    }
    const onValidate = index => {
      const currentValue = urlParams[index];
  
      if (!currentValue.trim()) {
        alert(_l('参数名不能为空'), 3);
        return;
      }
  
      if (urlParams.filter(p => p === currentValue).length > 1) {
        alert(_l('参数重复'), 3);
        return;
      }
    };
    return (
      <Fragment>
        <div className="Gray Font14 bold mTop20 mBottom10">{_l('链接参数')}</div>
        <div className="Gray_9e Font13 mBottom10">{_l('指定参数名，可作为查询字符串附加在自定义页面链接后。在加载页面时可动态获取参数值用于自定义页面的筛选条件。')}</div>
        {urlParams.map((value, index) => (
          <div className="flexRow alignItemsCenter mBottom10 urlParamsWrap">
            <Input
              placeholder={_l('请输入参数名')}
              className="pageInput"
              value={value}
              maxLength={20}
              onChange={event => {
                const newParams = urlParams.map((p, i) => {
                  return i === index ? event.target.value : p;
                });
                updatePageInfo({
                  urlParams: newParams
                });
              }}
              onBlur={() => {
                onValidate(index);
              }}
            />
            <Tooltip title={_l('删除')} placement="top">
              <Icon
                icon="delete1"
                className="Gray_9e Font19 pointer"
                onClick={() => {
                  const newParams = urlParams.filter((_, i) => i !== index);
                  updatePageInfo({
                    urlParams: newParams
                  });
                }}
              />
            </Tooltip>
          </div>
        ))}
        <div className="flexRow alignItemsCenter pointer Gray_9e mTop10 hoverText" onClick={onAdd} style={{ width: 'fit-content' }}>
          <Icon icon="add" className="Font17" />
          <span>{_l('参数')}</span>
        </div>
      </Fragment>
    );
  }

  return (
    <SideWrapper
      isMask={true}
      className={cx('white', className)}
      headerText={(
        <Fragment>
          <span className="Font17">{_l('页面配置')}</span>
        </Fragment>
      )}
      onClose={() => {
        updatePageInfo({
          urlParams: _.uniq(urlParams.filter(value => value))
        });
        onClose();
      }}
    >
      <Wrap>
        {renderBgConfig()}
        <div className="line mTop20 mBottom20" />
        {renderChartColorConfig()}
        {renderPivoTableColorConfig()}
        <div className="line mTop20 mBottom20" />
        {renderUrlparamsConfig()}
        <div className="line mTop20 mBottom20" />
        {renderPageConfig()}
      </Wrap>
    </SideWrapper>
  );
}
