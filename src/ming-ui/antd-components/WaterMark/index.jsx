import React, { useContext, useEffect, useMemo, useState } from 'react';
import ConfigProvider from 'antd/es/config-provider';
import AntdWatermark from 'antd/es/watermark';
import classNames from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { emitter } from 'src/utils/platform/browser/dom';
import { getCurrentProject } from 'src/utils/services/project';

const StyledWatermark = styled(AntdWatermark)``;

const DEFAULT_FONT_WEIGHT = 300;

const getNumberValue = (value, defaultValue) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? defaultValue : numberValue;
};

const getTextWidthRatio = char => {
  if (/[\u2e80-\u9fff\uf900-\ufaff]/.test(char)) {
    return 1;
  }

  if (/\s/.test(char)) {
    return 0.3;
  }

  return 0.6;
};

const getEstimatedTextWidth = (text, fontSize) =>
  Array.from(String(text || '')).reduce((sum, char) => sum + getTextWidthRatio(char) * fontSize, 0);

const getEstimatedContentWidth = (content, fontSize) => {
  const contents = Array.isArray(content) ? content : [content];

  if (!contents.length) {
    return 0;
  }

  const width = Math.max(...contents.map(item => getEstimatedTextWidth(item, fontSize)));

  return Math.ceil(width || 0);
};

const getLegacyOffset = ({ gapX, gapY, offsetLeft, offsetTop, fontSize, width, contentWidth, image }) => {
  const legacyOffsetLeft = offsetLeft ?? gapX / 2;
  const legacyOffsetTop = offsetTop ?? gapY / 2;
  const legacyFontSize = getNumberValue(fontSize, 16);

  return [
    legacyOffsetLeft + contentWidth / 2 + gapX / 2 - width / 2,
    legacyOffsetTop - (image ? 0 : legacyFontSize) + gapY / 2,
  ];
};

const getWatermarkProps = props => {
  const {
    children,
    style,
    className,
    markStyle = {},
    markClassName,
    zIndex = 9,
    gapX = 212,
    gapY = 222,
    width = 120,
    height = 64,
    rotate = -22,
    image,
    content,
    offsetLeft,
    offsetTop,
    fontStyle = 'normal',
    fontWeight = DEFAULT_FONT_WEIGHT,
    fontColor = 'rgba(0,0,0,.15)',
    fontSize = 16,
    fontFamily = 'sans-serif',
    prefixCls: customizePrefixCls,
    font,
    gap,
    offset,
    rootClassName,
    ...restProps
  } = props;

  return {
    children,
    style,
    className,
    markStyle: markStyle || {},
    markClassName,
    zIndex,
    gapX,
    gapY,
    width,
    height,
    rotate,
    image,
    content,
    offsetLeft,
    offsetTop,
    fontStyle,
    fontWeight,
    fontColor,
    fontSize,
    fontFamily,
    customizePrefixCls,
    font,
    gap,
    offset,
    rootClassName,
    restProps,
  };
};

const WaterMarkBase = props => {
  const {
    children,
    style,
    className,
    markStyle,
    markClassName,
    zIndex,
    gapX,
    gapY,
    width,
    height,
    rotate,
    image,
    content,
    offsetLeft,
    offsetTop,
    fontStyle,
    fontWeight,
    fontColor,
    fontSize,
    fontFamily,
    customizePrefixCls,
    font,
    gap,
    offset,
    rootClassName,
    restProps,
  } = getWatermarkProps(props);

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('pro-layout-watermark', customizePrefixCls);
  const wrapperCls = classNames(`${prefixCls}-wrapper`, className);
  const mergedRootClassName = classNames(prefixCls, markClassName, rootClassName);
  const mergedGap = gap || [gapX, gapY];
  const mergedFontSize = getNumberValue((font || {}).fontSize ?? fontSize, 16);
  const estimatedContentWidth = image ? width : getEstimatedContentWidth(content, mergedFontSize);
  const mergedWidth = image ? width : Math.max(width, estimatedContentWidth);
  const mergedOffset =
    offset ||
    getLegacyOffset({
      gapX: mergedGap[0],
      gapY: mergedGap[1],
      offsetLeft,
      offsetTop,
      fontSize: mergedFontSize,
      width: mergedWidth,
      contentWidth: estimatedContentWidth || mergedWidth,
      image,
    });

  const watermarkFont = useMemo(
    () => ({
      color: fontColor,
      fontSize: mergedFontSize,
      fontStyle,
      fontWeight,
      fontFamily,
      ...font,
    }),
    [font, fontColor, fontFamily, fontStyle, fontWeight, mergedFontSize],
  );

  return (
    <StyledWatermark
      {...restProps}
      className={wrapperCls}
      rootClassName={mergedRootClassName}
      style={style}
      zIndex={markStyle.zIndex ?? zIndex}
      gap={mergedGap}
      offset={mergedOffset}
      width={mergedWidth}
      height={height}
      rotate={rotate}
      image={image}
      content={content}
      font={watermarkFont}
    >
      {children}
    </StyledWatermark>
  );
};

export default props => {
  const currentProject =
    md.global.Account.accountId && props.projectId !== 'external' ? getCurrentProject(props.projectId, true) : {};

  useEffect(() => {
    window.hadWaterMark = true;
    return () => {
      window.hadWaterMark = false;
    };
  }, []);

  const [themeMode, setThemeMode] = useState(() => window.themeMode || 'light');
  useEffect(() => {
    const onThemeChange = mode => setThemeMode(mode || window.themeMode || 'light');
    emitter.on('CHANGE_THEME_MODE', onThemeChange);
    return () => emitter.off('CHANGE_THEME_MODE', onThemeChange);
  }, []);
  const fontColor = themeMode === 'dark' ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, .08)';

  const getValue = key => {
    switch (key) {
      case 'mobilePhone':
        return (_.get(md, 'global.Account.mobilePhone') || '').substr(-4, 4);
      case 'email':
        return (_.get(md, 'global.Account.email') || '').replace(/@.*/g, '');
      case 'companyName':
        return currentProject.companyName || '';
      default:
        return _.get(md, `global.Account.${key}`) || '';
    }
  };

  const getContent = () => {
    if (md.global.Account.watermark == 1 && md.global.Account.isPortal && md.global.Account.watermarkTxt) {
      return md.global.Account.watermarkTxt.replace(/\$(\w+)\$/g, (_, key) => getValue(key));
    }

    if (currentProject.enabledWatermarkTxt) {
      return currentProject.enabledWatermarkTxt.replace(/\$(\w+)\$/g, (_, key) => getValue(key));
    }

    return md.global.Account.fullname + '/' + (getValue('mobilePhone') || getValue('email'));
  };

  if (
    (md.global.Account.accountId &&
      props.projectId !== 'external' &&
      (currentProject.enabledWatermark || (md.global.Account.watermark == 1 && md.global.Account.isPortal))) ||
    props.showWaterMark
  ) {
    return (
      <WaterMarkBase
        content={getContent()}
        className="w100 h100"
        rotate={-45}
        fontSize={18}
        gapX={200}
        gapY={200}
        fontColor={fontColor}
        markStyle={{ zIndex: props.zIndex || 100000000 }}
        {...props}
      >
        {props.children}
      </WaterMarkBase>
    );
  }

  return props.children;
};
