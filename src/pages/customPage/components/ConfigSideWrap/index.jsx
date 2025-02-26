import React, { useState, Fragment } from 'react';
import cx from 'classnames';
import { generate } from '@ant-design/colors';
import SideWrap from 'src/pages/customPage/components/SideWrap';
import styled from 'styled-components';
import BgConfig from './BgConfig';
import ChartColorConfig from './ChartColorConfig';
import UrlparamsConfig from './UrlparamsConfig';
import PageConfig from './PageConfig';
import store from 'redux/configureStore';

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
    position: relative;
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
  .themeColorWrap::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 12px 12px 0 0;
    border-color: #fff transparent transparent transparent;
    border-radius: 2px 0 0 0;
    top: 1px;
    left: 1px;
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
    width: 70px;
    margin-right: 20px;
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
    &.selectTitleSelect {
      .ant-select-selector, .ant-select-selection-item {
        height: 42px;
        line-height: 40px;
      }
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

export const defaultConfig = {
  pageStyleType: 'light',
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
  customColors: [],
  webNewCols: 48
};

export default (props) => {
  const { adjustScreen, className, urlParams = [] } = props;
  const { onClose, updatePageInfo, updateModified = _.noop } = props;
  const { appPkg } = store.getState();
  const { iconColor } = appPkg;
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
    value: 'iconColor',
    className: 'themeColorWrap'
  }, {
    color: lightColor,
    title: _l('主题浅色'),
    value: 'lightColor',
    className: 'themeColorWrap'
  }];

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
        <BgConfig
          appPkg={appPkg}
          themeColors={themeColors}
          config={config}
          handleChangeConfig={handleChangeConfig}
        />
        <div className="line mTop20 mBottom20" />
        <ChartColorConfig
          appPkg={appPkg}
          themeColors={themeColors}
          config={config}
          handleChangeConfig={handleChangeConfig}
        />
        <div className="line mTop20 mBottom20" />
        <UrlparamsConfig
          urlParams={urlParams}
          updatePageInfo={updatePageInfo}
        />
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
}
