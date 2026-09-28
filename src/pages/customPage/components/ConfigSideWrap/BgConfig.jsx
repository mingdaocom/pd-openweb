import React, { Fragment } from 'react';
import { generate } from '@ant-design/colors';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Segmented, Tooltip } from 'ming-ui/antd-components';
import BgPicker from 'statistics/components/ChartStyle/components/BgPicker';
import { isLightColor } from 'src/utils/domain/control/style';
import { replaceColor } from 'src/utils/domain/customPage/model';
import { defaultTitleStyles } from './util';

const BG_PICKER_TYPES = ['image', 'shape', 'custom'];

export default props => {
  const { themeColors, appPkg, config, imageUrl, previewUrl, handleChangeConfig, handleChangeImage } = props;
  const {
    chartColorIndex = 1,
    pivoTableColorIndex = 1,
    numberChartColorIndex = 1,
    pageStyleType = 'light',
    pageBgImage,
    titleStyles = defaultTitleStyles,
  } = config;
  const pageConfig = replaceColor(config, appPkg.iconColor);
  const backgroundColor =
    appPkg.pcNaviStyle === 1 ? pageConfig.darkenPageBgColor || pageConfig.pageBgColor : pageConfig.pageBgColor;

  const lightColors = [
    _.find(themeColors, { value: 'lightColor' }),
    {
      color: '#ffffff',
      value: '#ffffff',
      title: _l('白色'),
    },
    {
      color: '#f5f6f7',
      value: '#f5f6f7',
      title: _l('灰色'),
    },
  ];
  const darkColors = [
    {
      color: generate(appPkg.iconColor)[9],
      value: 'iconColor10',
      title: _l('主题深色'),
      className: 'themeColorWrap',
    },
    {
      color: '#1b2025',
      value: '#1b2025',
      title: _l('黑色'),
    },
  ];

  const appColor = {
    color: appPkg.iconColor,
    value: 'iconColor',
    title: _l('主题色'),
  };

  if (isLightColor(appPkg.iconColor)) {
    lightColors.push(appColor);
  } else {
    darkColors.push(appColor);
  }

  const colors = pageStyleType === 'light' ? lightColors : darkColors;

  const handleChangeColor = (pageBgColor, data = {}) => {
    if (_.find(themeColors, { value: pageBgColor }) && !config.chartColor) {
      handleChangeConfig({
        pageBgColor,
        chartColor: {
          colorGroupId: 'adaptThemeColor',
          colorGroupIndex: undefined,
          colorType: 1,
        },
        chartColorIndex: chartColorIndex + 1,
        ...data,
      });
    } else {
      if (window.themeMode === 'light') {
        data.lightPageBgColor = pageBgColor;
      }

      if (window.themeMode === 'dark') {
        data.darkPageBgColor = pageBgColor;
      }

      handleChangeConfig({
        pageBgColor,
        ...data,
      });
    }
  };

  const handleChangePageStyleType = value => {
    if (value === 'light') {
      handleChangeColor(lightColors[0].value, {
        pageStyleType: 'light',
        pivoTableColor: lightColors[0].value,
        pivoTableColorIndex: pivoTableColorIndex + 1,
        numberChartColor: 'iconColor',
        numberChartColorIndex: numberChartColorIndex + 1,
        titleStyles: {
          ...titleStyles,
          color: '#333',
          index: Date.now(),
        },
      });
      return;
    }

    handleChangeColor(darkColors[0].value, {
      pageStyleType: 'dark',
      pivoTableColor: 'iconColor',
      pivoTableColorIndex: pivoTableColorIndex + 1,
      numberChartColor: lightColors[0].value,
      numberChartColorIndex: numberChartColorIndex + 1,
      titleStyles: {
        ...titleStyles,
        color: '#fff',
        isInitial: true,
        index: Date.now(),
      },
    });
  };

  return (
    <Fragment>
      {!window.themeModeVisible && (
        <Fragment>
          <div className="textPrimary Font14 bold mBottom10">{_l('风格')}</div>
          <Segmented
            block
            className="mBottom20"
            options={[
              {
                label: (
                  <span className="flexRow alignItemsCenter">
                    <Icon className="Font15" icon="light_mode" />
                    <span className="mLeft5">{_l('浅色')}</span>
                  </span>
                ),
                value: 'light',
              },
              {
                label: (
                  <span className="flexRow alignItemsCenter">
                    <Icon className="Font15" icon="dark_mode" />
                    <span className="mLeft5">{_l('深色')}</span>
                  </span>
                ),
                value: 'dark',
              },
            ]}
            value={pageStyleType}
            onChange={handleChangePageStyleType}
          />
        </Fragment>
      )}
      <div className="textPrimary Font14 bold mBottom10">{_l('背景')}</div>
      <div className="flexRow alignItemsCenter">
        <div className="flex flexRow alignItemsCenter">
          <div className="textSecondary Font13 bold mRight10">{_l('颜色')}</div>
          <div className="flexRow alignItemsCenter pageBgColors">
            {colors.map(data =>
              data.title ? (
                <Tooltip key={data.value || data.color} title={data.title} placement="bottom">
                  <div
                    className={cx('colorWrap', data.className, { active: data.value === config.pageBgColor })}
                    style={{ backgroundColor: data.color }}
                    onClick={() => handleChangeColor(data.value)}
                  ></div>
                </Tooltip>
              ) : (
                <div
                  key={data}
                  className={cx('colorWrap', data.className, { active: data === config.pageBgColor })}
                  style={{ backgroundColor: data }}
                  onClick={() => handleChangeColor(data)}
                ></div>
              ),
            )}
          </div>
        </div>
        <div className="flex flexRow alignItemsCenter">
          <div className="textSecondary Font13 bold mRight10">{_l('图形')}</div>
          <BgPicker
            themeColor={appPkg.iconColor}
            types={BG_PICKER_TYPES}
            config={{
              ...config,
              bgStyleValue: _.isUndefined(config.bgStyleValue) ? (pageBgImage ? 'shape' : '') : config.bgStyleValue,
            }}
            previewUrl={previewUrl || imageUrl}
            shapeConfig={{
              backgroundColor,
              color: backgroundColor === appPkg.iconColor ? appPkg.lightColor : appPkg.iconColor,
            }}
            onChange={handleChangeConfig}
            onChangeImage={handleChangeImage}
            onClear={() => {
              handleChangeConfig({ bgStyleValue: '', pageBgImage: undefined });
            }}
          />
        </div>
      </div>
    </Fragment>
  );
};
