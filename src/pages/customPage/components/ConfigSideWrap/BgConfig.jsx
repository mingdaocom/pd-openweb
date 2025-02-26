import React, { Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Tooltip, Popover } from 'antd';
import { generate } from '@ant-design/colors';
import cx from 'classnames';
import { replaceColor } from '../../util';
import { ReactSVG } from 'react-svg';

export const bgImages = [{
  name: 'hexagon',
  value: '/staticfiles/images/customPage/hexagon.svg'
}, {
  name: 'horizontalLine',
  value: '/staticfiles/images/customPage/horizontal-line.svg'
}, {
  name: 'verticalLine',
  value: '/staticfiles/images/customPage/vertical-line.svg'
}, {
  name: 'earth',
  value: '/staticfiles/images/customPage/earth.svg'
}, {
  name: 'prismatic',
  value: '/staticfiles/images/customPage/prismatic.svg'
}, {
  name: 'triangle',
  value: '/staticfiles/images/customPage/triangle.svg'
}];

export default props => {
  const { themeColors, appPkg, config, handleChangeConfig } = props;
  const { chartColorIndex = 1, pivoTableColorIndex = 1, numberChartColorIndex = 1, pageStyleType = 'light', pageBgImage } = config;
  const pageConfig = replaceColor(config, appPkg.iconColor);
  const backgroundColor = appPkg.pcNaviStyle === 1 ? pageConfig.darkenPageBgColor || pageConfig.pageBgColor : pageConfig.pageBgColor;

  const lightColors = [
    _.find(themeColors, { value: 'lightColor' }),
    {
      color: '#ffffff',
      value: '#ffffff',
      title: _l('白色')
    }, {
      color: '#f5f6f7',
      value: '#f5f6f7',
      title: _l('灰色')
    }
  ];
  const darkColors = [
    {
      color: generate(appPkg.iconColor)[9],
      value: 'iconColor10',
      title: _l('主题深色'),
      className: 'themeColorWrap'
    },
    {
      color: '#1b2025',
      value: '#1b2025',
      title: _l('黑色')
    }
  ];
  const colors = pageStyleType === 'light' ? lightColors : darkColors;

  const handleChangeColor = (pageBgColor, data) => {
    if (_.find(themeColors, { value: pageBgColor }) && !config.chartColor) {
      handleChangeConfig({
        pageBgColor,
        chartColor: {
          colorGroupId: 'adaptThemeColor',
          colorGroupIndex: undefined,
          colorType: 1
        },
        chartColorIndex: chartColorIndex + 1,
        ...data
      });
    } else {
      handleChangeConfig({
        pageBgColor,
        ...data
      });
    }
  }

  return (
    <Fragment>
      <div className="Gray Font14 bold mBottom10">{_l('风格')}</div>
      <div className="typeSelect flexRow valignWrapper w100">
        <div
          className={cx('flex centerAlign pointer Gray_75', { active: pageStyleType === 'light' })}
          onClick={() => {
            handleChangeColor(lightColors[0].value, {
              pageStyleType: 'light',
              pivoTableColor: lightColors[0].value,
              pivoTableColorIndex: pivoTableColorIndex + 1,
              numberChartColor: 'iconColor',
              numberChartColorIndex: numberChartColorIndex + 1,
            });
          }}
        >
          <Icon className="Font15" icon="light_mode" />
          <span className="mLeft5">{_l('浅色')}</span>
        </div>
        <div
          className={cx('flex centerAlign pointer Gray_75', { active: pageStyleType === 'dark' })}
          onClick={() => {
            handleChangeColor(darkColors[0].value, {
              pageStyleType: 'dark',
              pivoTableColor: 'iconColor',
              pivoTableColorIndex: pivoTableColorIndex + 1,
              numberChartColor: lightColors[0].value,
              numberChartColorIndex: numberChartColorIndex + 1,
            });
          }}
        >
          <Icon className="Font15" icon="dark_mode" />
          <span className="mLeft5">{_l('深色')}</span>
        </div>
      </div>
      <div className="Gray Font14 bold mTop20 mBottom10">{_l('背景')}</div>
      <div className="flexRow alignItemsCenter">
        <div className="flex flexRow alignItemsCenter">
          <div className="Gray_75 Font13 bold mRight10">{_l('颜色')}</div>
          <div className="flexRow alignItemsCenter pageBgColors">
            {colors.map(data => (
              data.title ? (
                <Tooltip key={data.value || data.color} title={data.title} color="#000" placement="bottom">
                  <div
                    className={cx('colorWrap', data.className, { active: data.value === config.pageBgColor })}
                    style={{ backgroundColor: data.color }}
                    onClick={() => handleChangeColor(data.value)}
                  >
                  </div>
                </Tooltip>
              ) : (
                <div
                  key={data}
                  className={cx('colorWrap', data.className, { active: data === config.pageBgColor })}
                  style={{ backgroundColor: data }}
                  onClick={() => handleChangeColor(data)}
                >
                </div>
              )
            ))}
          </div>
        </div>
        <div className="flex flexRow alignItemsCenter">
          <div className="Gray_75 Font13 bold mRight10">{_l('图形')}</div>
          <div className="flexRow alignItemsCenter">
            <Popover
              placement="bottomRight"
              content={(
                <div className="flexColumn">
                  <span className="mBottom5">{_l('选择图形')}</span>
                  <div className="flexRow alignItemsCenter" style={{ width: 570, flexWrap: 'wrap' }}>
                    {bgImages.map((item) => (
                      <div
                        key={item.name}
                        className="mRight10 mBottom10 pointer overflowHidden"
                        style={{ backgroundColor, borderRadius: 6, border: `1px solid ${pageBgImage === item.name ? '#2196f3' : 'transparent'}` }}
                        onClick={() => { handleChangeConfig({ pageBgImage: item.name }) }}
                      >
                        <ReactSVG
                          style={{ width: 178, height: 100 }}
                          src={item.value}
                          beforeInjection={svg => {
                            svg.setAttribute('fill', appPkg.iconColor);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            >
              {pageBgImage ? (
                <div className="colorWrap overflowHidden" style={{ width: 50, backgroundColor }}>
                  <ReactSVG
                    style={{ width: '100%', height: '100%' }}
                    src={_.get(_.find(bgImages, { name: pageBgImage }), 'value')}
                    beforeInjection={svg => {
                      svg.setAttribute('fill', appPkg.iconColor);
                    }}
                  />
                </div>
              ) : (
                <div className="colorWrap" style={{ width: 50 }}>
                  <Icon icon="add" className="Font20 Gray_75 Hover_21" />
                </div>
              )}
            </Popover>
            {pageBgImage && (
              <Icon
                icon="delete1"
                className="pointer Gray_9e Font20"
                onClick={() => {
                  handleChangeConfig({ pageBgImage: undefined });
                }}
              />
            )}
          </div>
        </div>
      </div>
    </Fragment>
  );
}
