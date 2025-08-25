import React, { useContext, useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import { getCurrentProject } from 'src/utils/project';

/**
 * 返回当前显示设备的物理像素分辨率与CSS像素分辨率之比
 *
 * @param context
 * @see api 有些废弃了，其实类型 CanvasRenderingContext2D
 */
const getPixelRatio = context => {
  if (!context) {
    return 1;
  }
  const backingStore =
    context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio ||
    1;
  return (window.devicePixelRatio || 1) / backingStore;
};

const WaterMark = props => {
  const {
    children,
    style,
    className,
    markStyle,
    markClassName,
    // antd 内容层 zIndex 基本上在 10 以下 https://github.com/ant-design/ant-design/blob/6192403b2ce517c017f9e58a32d58774921c10cd/components/style/themes/default.less#L335
    zIndex = 9,
    gapX = 212,
    gapY = 222,
    width = 120,
    height = 64,
    rotate = -22, // 默认旋转 -22 度
    image,
    content,
    offsetLeft,
    offsetTop,
    fontStyle = 'normal',
    fontWeight = 'normal',
    fontColor = 'rgba(0,0,0,.15)',
    fontSize = 16,
    fontFamily = 'sans-serif',
    prefixCls: customizePrefixCls,
  } = props;

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const prefixCls = getPrefixCls('pro-layout-watermark', customizePrefixCls);
  const wrapperCls = classNames(`${prefixCls}-wrapper`, className);
  const waterMakrCls = classNames(prefixCls, markClassName);
  const [base64Url, setBase64Url] = useState('');

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const ratio = getPixelRatio(ctx);

    const canvasWidth = `${(gapX + width) * ratio}px`;
    const canvasHeight = `${(gapY + height) * ratio}px`;
    const canvasOffsetLeft = offsetLeft || gapX / 2;
    const canvasOffsetTop = offsetTop || gapY / 2;

    canvas.setAttribute('width', canvasWidth);
    canvas.setAttribute('height', canvasHeight);

    if (ctx) {
      // 旋转字符 rotate
      ctx.translate(canvasOffsetLeft * ratio, canvasOffsetTop * ratio);
      ctx.rotate((Math.PI / 180) * Number(rotate));
      const markWidth = width * ratio;
      const markHeight = height * ratio;

      if (image) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.referrerPolicy = 'no-referrer';
        img.src = image;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, markWidth, markHeight);
          setBase64Url(canvas.toDataURL());
        };
      } else if (content) {
        const markSize = Number(fontSize) * ratio;
        ctx.font = `${fontStyle} normal ${fontWeight} ${markSize}px/${markHeight}px ${fontFamily}`;
        ctx.fillStyle = fontColor;
        ctx.fillText(content, 0, 0);
        setBase64Url(canvas.toDataURL());
      }
    } else {
      console.error('当前环境不支持Canvas');
    }
  }, [
    gapX,
    gapY,
    offsetLeft,
    offsetTop,
    rotate,
    fontStyle,
    fontWeight,
    width,
    height,
    fontFamily,
    fontColor,
    image,
    content,
    fontSize,
  ]);

  return (
    <div
      style={{
        position: 'relative',
        ...style,
      }}
      className={wrapperCls}
    >
      {children}
      <div
        className={waterMakrCls}
        style={{
          zIndex,
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          backgroundSize: `${gapX + width}px`,
          pointerEvents: 'none',
          backgroundRepeat: 'repeat',
          backgroundImage: `url('${base64Url}')`,
          ...markStyle,
        }}
      />
    </div>
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
      <WaterMark
        content={getContent()}
        className="w100 h100"
        rotate={45}
        fontSize={18}
        gapX={200}
        gapY={200}
        fontColor="rgba(0, 0, 0, .06)"
        markStyle={{ zIndex: props.zIndex || 100000000 }}
        {...props}
      >
        {props.children}
      </WaterMark>
    );
  }

  return props.children;
};
