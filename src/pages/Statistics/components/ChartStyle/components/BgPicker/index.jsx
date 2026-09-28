import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Popover, Tabs, Tooltip } from 'ming-ui/antd-components';
import { replaceColor } from 'statistics/Charts/NumberChart';
import Color from './Color';
import Custom from './Custom';
import Gradient from './Gradient';
import Image, { images } from './Image';
import Shape, { ShapePreview } from './Shape';

const Wrap = styled.div`
  .hap-tabs {
    .hap-tabs-nav {
      margin: 0 !important;
    }
    .hap-tabs-tab-active {
      font-weight: bold;
    }
    .hap-tabs-tab-btn {
      color: var(--color-text-secondary);
    }
    .hap-tabs-tab {
      padding: 9px 0;
    }
    .hap-tabs-nav-list {
      padding: 0 15px;
    }
    .hap-tabs-body {
      padding: 15px;
    }
    .hap-tabs-tabpane {
      padding: 10px;
    }
  }
`;

const POPOVER_STYLES = {
  container: {
    width: 485,
  },
};

const ClearWrap = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 3px;
  border: 1px solid var(--color-border-primary);
  background-color: var(--color-background-primary);
  position: relative;
  &:hover {
    border-color: var(--color-text-disabled);
  }
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: var(--color-error);
    transform: rotateZ(-45deg) scale(1.35);
  }
`;

const TABS = [
  {
    name: _l('纯色'),
    value: 'color',
  },
  {
    name: _l('渐变'),
    value: 'gradient',
  },
  {
    name: _l('图片'),
    value: 'image',
  },
  {
    name: _l('图形'),
    value: 'shape',
  },
  {
    name: _l('自定义'),
    value: 'custom',
  },
];

const DEFAULT_TYPES = ['color', 'gradient', 'image', 'custom'];

export default function BgPicker(props) {
  const { themeColor, config, onClear, types = DEFAULT_TYPES } = props;
  const shapeConfig = {
    backgroundColor: 'var(--color-background-primary)',
    color: themeColor,
    ...props.shapeConfig,
  };
  const { bgStyleValue, pageBgImage } = config;
  const availableTabs = TABS.filter(item => types.includes(item.value));
  const defaultTab = availableTabs[0]?.value;
  const [tab, setTab] = useState(bgStyleValue || defaultTab);
  const colorPickerRef = useRef();
  const activeTab = availableTabs.some(item => item.value === tab) ? tab : defaultTab;

  const getBgStyle = () => {
    if (bgStyleValue === 'color') {
      const { bgColor = '#fff' } = config;
      const { iconColor } = replaceColor({ iconColor: bgColor }, {}, themeColor);
      return { backgroundColor: iconColor };
    }

    if (bgStyleValue === 'gradient') {
      const { gradient } = config;
      return { background: `linear-gradient(${gradient})` };
    }

    if (bgStyleValue === 'image') {
      const { bgImageIndex } = config;
      const src = images(`./${bgImageIndex}.jpg`);
      return { backgroundImage: `url(${src})`, backgroundSize: 'cover' };
    }

    if (bgStyleValue === 'custom') {
      const { previewUrl } = props;
      return previewUrl
        ? { backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover' }
        : { backgroundColor: 'var(--color-background-primary)' };
    }

    if (bgStyleValue === 'shape') {
      return { backgroundColor: shapeConfig.backgroundColor };
    }

    return { backgroundColor: 'var(--color-background-primary)' };
  };

  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      destroyOnHidden={false}
      noPadding
      styles={POPOVER_STYLES}
      onOpenChange={visible => {
        if (!visible && colorPickerRef.current) {
          colorPickerRef.current.onClose();
        }
      }}
      content={
        <Wrap>
          <Tabs
            activeKey={activeTab}
            onChange={tab => {
              setTab(tab);
            }}
            items={availableTabs.map(item => ({
              key: item.value,
              label: item.name,
              children: (
                <React.Fragment>
                  {item.value === 'color' && <Color value={item.value} {...props} colorPickerRef={colorPickerRef} />}
                  {item.value === 'gradient' && <Gradient value={item.value} {...props} />}
                  {item.value === 'image' && <Image value={item.value} {...props} />}
                  {item.value === 'shape' && <Shape value={item.value} {...props} {...shapeConfig} />}
                  {item.value === 'custom' && <Custom value={item.value} {...props} />}
                </React.Fragment>
              ),
            }))}
            tabBarExtraContent={
              <Tooltip title={_l('清空')} placement="bottom">
                <ClearWrap
                  className="pointer mRight10"
                  onClick={() => {
                    onClear();
                  }}
                />
              </Tooltip>
            }
          />
        </Wrap>
      }
    >
      <div className="colorWrap pointer overflowHidden pAll0">
        {bgStyleValue === 'shape' && pageBgImage ? (
          <ShapePreview {...shapeConfig} name={pageBgImage} />
        ) : (
          <div className="colorBlock w100 h100" style={getBgStyle()}></div>
        )}
      </div>
    </Popover>
  );
}
