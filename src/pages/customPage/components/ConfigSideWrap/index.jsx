import React, { Fragment } from 'react';
import { generate } from '@ant-design/colors';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import SideWrap from 'src/pages/customPage/components/SideWrap';
import store from 'src/redux/configureStore';
import BgConfig from './BgConfig';
import ChartColorConfig from './ChartColorConfig';
import { defaultConfig } from './defaultConfig';
import PageConfig from './PageConfig';
import UrlparamsConfig from './UrlparamsConfig';

const SideWrapper = styled(SideWrap)`
  &.sideAbsolute {
    position: absolute;
    header {
      padding: 0 24px 0 24px;
      box-shadow: none;
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
  .colorWrap,
  .addColor,
  .defaultColor {
    position: relative;
    cursor: pointer;
    margin-right: 10px;
    width: 28px;
    height: 28px;
    border-radius: 4px;
    border: 1px solid var(--color-border-tertiary);
    transition: border 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    &:hover {
      border-color: var(--color-primary);
    }
  }
  .colorWrap.active {
    border-color: var(--color-border-tertiary);
    &::after {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      width: 32px;
      height: 32px;
      border: 1px solid var(--color-border-tertiary);
      border-radius: 4px;
    }
  }
  .themeColorWrap::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 12px 12px 0 0;
    border-color: var(--color-white) transparent transparent transparent;
    border-radius: 2px 0 0 0;
    top: 1px;
    left: 1px;
  }
  .defaultColor {
    position: relative;
    &.active {
      border-color: var(--color-primary);
      &::after {
        background-color: var(--color-primary);
      }
    }
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      width: 1px;
      height: 100%;
      background-color: var(--color-background-secondary);
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
    background-color: var(--color-border-tertiary);
  }
  .selectChartColor {
    height: 40px;
    box-sizing: border-box;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid var(--color-border-primary);
    .colorBlock {
      width: 24px;
      height: 24px;
    }
    .colorName {
      width: 200px;
      margin-left: 7px;
    }
  }
  .selectTitleSelect {
    --hap-select-height: 40px;
  }
  .label {
    width: 70px;
    margin-right: 20px;
    font-weight: 600;
  }
  .icon-trash:hover {
    color: var(--color-error) !important;
  }
`;

export { defaultConfig };

export default props => {
  const { adjustScreen, className, urlParams = [] } = props;
  const { imageUrl, previewUrl, onClose, updatePageInfo, updateModified = _.noop } = props;
  const { appPkg } = store.getState();
  const { iconColor } = appPkg;
  const lightColor = generate(iconColor)[0];
  const config = props.config || defaultConfig;

  const handleChangeConfig = data => {
    updateModified(true);
    const params = {
      config: {
        ...config,
        ...data,
      },
    };

    if (data.autoLinkage === false) {
      params.linkageFiltersGroup = {};
    }

    updatePageInfo(params);
  };

  const handleChangeImage = (imageData, styleData = {}) => {
    const isRemoveImage = !imageData.imageUrl && !imageData.previewUrl;
    updateModified(true);
    updatePageInfo({
      ...imageData,
      config: {
        ...config,
        ...styleData,
        ...(isRemoveImage ? { bgStyleValue: '' } : {}),
      },
    });
  };

  const themeColors = [
    {
      color: iconColor,
      title: _l('主题深色'),
      value: 'iconColor',
      className: 'themeColorWrap',
    },
    {
      color: lightColor,
      title: _l('主题浅色'),
      value: 'lightColor',
      className: 'themeColorWrap',
    },
  ];

  return (
    <SideWrapper
      isMask={true}
      className={cx('white', className)}
      headerText={
        <Fragment>
          <span className="Font17">{_l('页面配置')}</span>
        </Fragment>
      }
      onClose={() => {
        updatePageInfo({
          urlParams: _.uniq(urlParams.filter(value => value)),
        });
        onClose();
      }}
    >
      <Wrap>
        <BgConfig
          appPkg={appPkg}
          themeColors={themeColors}
          config={config}
          imageUrl={imageUrl}
          previewUrl={previewUrl}
          handleChangeConfig={handleChangeConfig}
          handleChangeImage={handleChangeImage}
        />
        <div className="line mTop20 mBottom20" />
        <ChartColorConfig
          appPkg={appPkg}
          themeColors={themeColors}
          config={config}
          handleChangeConfig={handleChangeConfig}
        />
        <div className="line mTop20 mBottom20" />
        <UrlparamsConfig urlParams={urlParams} updatePageInfo={updatePageInfo} />
        <div className="line mTop20 mBottom20" />
        <PageConfig
          appPkg={appPkg}
          adjustScreen={adjustScreen}
          config={config}
          updatePageInfo={updatePageInfo}
          handleChangeConfig={handleChangeConfig}
        />
      </Wrap>
    </SideWrapper>
  );
};
