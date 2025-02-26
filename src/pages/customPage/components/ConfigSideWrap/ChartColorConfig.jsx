import React, { useState, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Tooltip, Select } from 'antd';
import cx from 'classnames';
import { getPorjectChartColors } from 'statistics/Charts/common';
import { replaceColor } from 'src/pages/customPage/util';
import BaseColor from 'statistics/components/ChartStyle/components/Color/BaseColor';
import styled from 'styled-components';

const TemplateTitleWrap = styled.div`
  flex: 2;
  border-radius: 3px;
  padding: 0 5px;
  height: 32px;
  display: flex
  align-items: center;
`;

const titleStyles = [{
  value: 0,
  name: _l('无')
}, {
  value: 1,
  name: _l('主题色'),
}, {
  value: 2,
  name: _l('主题和背景色渐变'),
}, {
  value: 3,
  name: _l('线条'),
}];

export default props => {
  const [selectChartColorVisible, setSelectChartColorVisible] = useState(false);
  const { appPkg, themeColors, config, handleChangeConfig } = props;
  const { chartColor, pageStyleType = 'light' } = config;
  const { iconColor } = appPkg;
  const { pageBgColor } = replaceColor(config, iconColor);
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
    const chartColors = getPorjectChartColors(appPkg.projectId);
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

  const renderPivoTableColorConfig = () => {
    const lightColors = [
      _.find(themeColors, { value: 'lightColor' }),
      {
        color: '#f5f6f7',
        value: '#f5f6f7',
        title: _l('灰色')
      }
    ];
    const darkColors = [
      {
        ..._.find(themeColors, { value: 'iconColor' }),
        title: _l('主题色'),
      },
      {
        color: '#1b2025',
        value: '#1b2025',
        title: _l('黑色')
      }
    ];
    const colors = pageStyleType === 'light' ? lightColors : darkColors;
    const handleChangeColor = pivoTableColor => {
      const { pivoTableColorIndex = 1 } = config;
      handleChangeConfig({
        pivoTableColor,
        pivoTableColorIndex: pivoTableColorIndex + 1
      });
    }
    return (
      <div className="flexRow alignItemsCenter">
        <div className="Gray_75 Font13 bold mRight10 label">{_l('透视表颜色')}</div>
        <div className="flexRow alignItemsCenter flex">
          {colors.map((data, index) => (
            data.title ? (
              <Tooltip key={index} title={data.title} color="#000" placement="bottom">
                <div
                  className={cx('colorWrap', data.className, { active: data.value === config.pivoTableColor })}
                  style={{ backgroundColor: data.color }}
                  onClick={() => handleChangeColor(data.value)}
                >
                </div>
              </Tooltip>
            ) : (
              <div
                key={index}
                className={cx('colorWrap', data.className, { active: data === config.pivoTableColor })}
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
      </div>
    );
  }

  const renderNumberColorConfig = () => {
    const lightColors = [
      _.find(themeColors, { value: 'lightColor' }),
      {
        color: '#ffffff',
        value: '#ffffff',
        title: _l('白色')
      }
    ];
    const darkColors = [
      _.find(themeColors, { value: 'iconColor' }),
      {
        color: '#1b2025',
        value: '#1b2025',
        title: _l('黑色')
      }
    ];
    const colors = pageStyleType === 'light' ? darkColors : lightColors;
    return (
      <div className="flexRow alignItemsCenter mBottom15">
        <div className="Gray_75 Font13 bold mRight10 label">{_l('数值颜色')}</div>
        <div className="flexRow alignItemsCenter flex">
          {colors.map((data, index) => (
            data.title ? (
              <Tooltip key={index} title={data.title} color="#000" placement="bottom">
                <div
                  className={cx('colorWrap', data.className, { active: data.value === config.numberChartColor })}
                  style={{ backgroundColor: data.color }}
                  onClick={() => handleChangeColor(data.value)}
                >
                </div>
              </Tooltip>
            ) : (
              <div
                key={index}
                className={cx('colorWrap', data.className, { active: data.value === config.numberChartColor })}
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
      </div>
    );
  }

  const { name, showColors } = getColorConfig();
  const getBgColor = titleStyle => {
    const value = _.isNumber(titleStyle) ? titleStyle : config.titleStyle || 0;
    if (value === 0 || value === 3) {
      return {
        color: '#333',
        border: '1px solid #b3afaf',
      }
    }
    if (value === 1) {
      return {
        color: '#fff',
        backgroundColor: iconColor
      }
    }
    if (value === 2) {
      return {
        color: '#fff',
        background: `linear-gradient(to right, ${iconColor}, ${pageBgColor})`
      }
    }
  };

  return (
    <Fragment>
      <div className="Gray Font14 bold mBottom10">{_l('全局颜色')}</div>
      <div className="Gray_9e Font13 mBottom10">{_l('为所有图表设置统一颜色，全局颜色将覆盖图表本色的颜色配置。')}</div>
      <div className="flexRow alignItemsCenter mBottom15">
        <div className="Gray_75 Font13 bold mRight10 label">{_l('图表配色')}</div>
        <div className="flexRow alignItemsCenter flex">
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
      </div>
      <div className="flexRow alignItemsCenter mBottom15">
        <div className="Gray_75 Font13 bold mRight10 label">{_l('标题栏样式')}</div>
        <div className="flexRow alignItemsCenter flex">
          <Select
            className="pageSelect selectTitleSelect w100"
            value={config.titleStyle || 0}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              handleChangeConfig({
                titleStyle: value
              });
            }}
          >
            {titleStyles.map(data => (
              <Select.Option className="selectTitleOptionWrapper" value={data.value}>
                <div className="flexRow alignItemsCenter">
                  <TemplateTitleWrap className="Relative" style={getBgColor(data.value)}>
                    {_l('标题')}
                    {data.value === 3 && (
                      <div className="Absolute" style={{
                        width: '96%',
                        bottom: 0,
                        borderBottom: `2px solid transparent`,
                        borderImage: `linear-gradient(to right, ${iconColor}, ${pageBgColor}) 1`
                      }}/>
                    )}
                  </TemplateTitleWrap>
                  <div className="flex TxtRight pRight5">{data.name}</div>
                </div>
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
      {renderNumberColorConfig()}
      {renderPivoTableColorConfig()}
      <BaseColor
        visible={selectChartColorVisible}
        projectId={appPkg.projectId}
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
}