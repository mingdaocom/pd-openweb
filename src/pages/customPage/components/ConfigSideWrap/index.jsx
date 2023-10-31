import React, { useState, Fragment } from 'react';
import { Icon, ColorPicker } from 'ming-ui';
import { Tooltip, Checkbox, Select, Switch } from 'antd';
import cx from 'classnames';
import { generate } from '@ant-design/colors';
import { getPorjectChartColors } from 'statistics/Charts/common';
import SideWrap from 'src/pages/customPage/components/SideWrap';
import styled from 'styled-components';
import BaseColor from 'statistics/components/ChartStyle/components/Color/BaseColor';
import store from 'redux/configureStore';
import { isLightColor } from 'src/pages/customPage/util';

const SideWrapper = styled(SideWrap)`
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
  }
  .label {
    width: 60px;
    margin-right: 30px;
    font-weight: 600;
  }
  .typeSelect {
    font-size: 13px;
    border-radius: 3px;
    padding: 3px;
    background-color: #eff0f0;
    >div {
      height: 25px;
      line-height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .active {
      color: #2196F3 !important;
      border-radius: 3px;
      padding: 3px 0;
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
  numberChartColor: '',
  pivoTableColor: '',
  refresh: 0,
  headerVisible: true,
  shareVisible: true,
  downloadVisible: true,
  fullScreenVisible: true,
  customColors: []
};

export default (props) => {
  const { adjustScreen, apk } = props;
  const { onClose, updatePageInfo, updateModified } = props;
  const [selectChartColorVisible, setSelectChartColorVisible] = useState(false);
  const iconColor = _.get(store.getState().appPkg, 'iconColor');
  const lightColor = generate(iconColor)[0];
  const config = props.config || defaultConfig;

  const handleChangeConfig = data => {
    updateModified(true);
    updatePageInfo({
      config: {
        ...config,
        ...data
      }
    });
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
    const { customColors = [] } = config;
    const handleChangeColor = pageBgColor => {
      handleChangeConfig({ pageBgColor });
    }
    return (
      <Fragment>
        <div className="Gray Font14 bold mBottom10">{_l('页面背景')}</div>
        <div className="flexRow alignItemsCenter pageBgColors">
          {colors.map(data => (
            data.title ? (
              <Tooltip key={data.value || data.color} title={data.title} color="#000" placement="bottom">
                <div className="colorWrap" style={{ backgroundColor: data.color }} onClick={() => handleChangeColor(data.value)}>
                  {data.value === config.pageBgColor && <Icon className={cx('Font16', isLightColor(data.color) ? 'Gray' : 'White')} icon="done" />}
                </div>
              </Tooltip>
            ) : (
              <div key={data} className="colorWrap" style={{ backgroundColor: data }} onClick={() => handleChangeColor(data)}>
                {data === config.pageBgColor && <Icon className={cx('Font16', isLightColor(data) ? 'Gray' : 'White')} icon="done" />}
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
      handleChangeConfig({ numberChartColor });
    }
    const getColorName = () => {
      const { colorType, colorGroupId } = chartColor || {};
      const chartColors = getPorjectChartColors(apk.projectId);
      if (!config.chartColor) {
        return _l('未配置');
      }
      if (colorType === 2) {
        return _l('自定义颜色');
      } else if (colorGroupId === 'adaptThemeColor') {
        const adaptThemeColors = chartColors.filter(item => (item.themeColors || []).includes(iconColor));
        return adaptThemeColors.length ? _l('适应主题') : chartColors[0].name;
      } else {
        return (_.find(chartColors, { id: colorGroupId }) || chartColors[0]).name;
      }
      return _l('未配置');
    }
    return (
      <Fragment>
        <div className="Gray Font14 bold mBottom10">{_l('全局颜色')}</div>
        <div className="Gray_9e Font13">{_l('为所有图表设置统一颜色，全局颜色将覆盖图表本色的颜色配置。')}</div>
        <div className="Gray_75 Font13 bold mTop20 mBottom10">{_l('图表配色')}</div>
        <div className="flexRow alignItemsCenter">
          <div className="selectChartColor flexRow alignItemsCenter pointer flex" onClick={() => setSelectChartColorVisible(true)}>
            <div className="flex">{getColorName()}</div>
            <Icon icon="arrow-down-border" className="Gray_9e Font18" />
          </div>
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
        </div>
        <div className="Gray_75 Font13 bold mTop20 mBottom10">{_l('数值颜色')}</div>
        <div className="flexRow alignItemsCenter">
          {colors.map((data, index) => (
            data.title ? (
              <Tooltip key={index} title={data.title} color="#000" placement="bottom">
                <div className="colorWrap" style={{ backgroundColor: data.color }} onClick={() => handleChangeColor(data.value)}>
                  {data.value === config.numberChartColor && <Icon className={cx('Font16', isLightColor(data.color) ? 'Gray' : 'White')} icon="done" />}
                </div>
              </Tooltip>
            ) : (
              <div key={index} className="colorWrap" style={{ backgroundColor: data }} onClick={() => handleChangeColor(data)}>
                {data === config.numberChartColor && <Icon className={cx('Font16', isLightColor(data) ? 'Gray' : 'White')} icon="done" />}
              </div>
            )
          ))}
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
        </div>
        <BaseColor
          visible={selectChartColorVisible}
          projectId={apk.projectId}
          currentReport={{
            style: chartColor
          }}
          onChange={(data) => {
            handleChangeConfig({ chartColor: data.style });
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
      handleChangeConfig({ pivoTableColor });
    }
    return (
      <Fragment>
        <div className="Gray_75 Font13 bold mTop20 mBottom10">{_l('透视表颜色')}</div>
        <div className="flexRow alignItemsCenter">
          {colors.map((data, index) => (
            data.title ? (
              <Tooltip key={index} title={data.title} color="#000" placement="bottom">
                <div className="colorWrap" style={{ backgroundColor: data.color }} onClick={() => handleChangeColor(data.value)}>
                  {data.value === config.pivoTableColor && <Icon className={cx('Font16', isLightColor(data.color) ? 'Gray' : 'White')} icon="done" />}
                </div>
              </Tooltip>
            ) : (
              <div key={index} className="colorWrap" style={{ backgroundColor: data }} onClick={() => handleChangeColor(data)}>
                {data === config.pivoTableColor && <Icon className={cx('Font16', isLightColor(data) ? 'Gray' : 'White')} icon="done" />}
              </div>
            )
          ))}
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
            <div class="typeSelect flexRow valignWrapper" style={{ width: 190 }}>
              <div class={cx('flex centerAlign pointer Gray_75', { active: !adjustScreen })} onClick={() => updatePageInfo({ adjustScreen: false })}>{_l('滚动')}</div>
              <div class={cx('flex centerAlign pointer Gray_75', { active: adjustScreen })} onClick={() => updatePageInfo({ adjustScreen: true })}>{_l('适应屏幕高度')}</div>
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
                <div className="mRight15">{_l('操作')}</div>
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
      </Fragment>
    );
  };

  return (
    <SideWrapper
      isMask={false}
      className="white"
      headerText={(
        <Fragment>
          <Icon className="ThemeColor Font20 mRight10" icon="color_lens" />
          <span className="Font17">{_l('页面配置')}</span>
        </Fragment>
      )}
      onClose={onClose}
    >
      <Wrap>
        {renderBgConfig()}
        <div className="line mTop20 mBottom20" />
        {renderChartColorConfig()}
        {renderPivoTableColorConfig()}
        <div className="line mTop20 mBottom20" />
        {renderPageConfig()}
      </Wrap>
    </SideWrapper>
  );
}
