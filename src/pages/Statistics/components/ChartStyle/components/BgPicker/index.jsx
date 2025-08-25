import React, { useRef, useState } from 'react';
import { Tabs, Tooltip } from 'antd';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { replaceColor } from 'statistics/Charts/NumberChart';
import Color from './Color';
import Custom from './Custom';
import Gradient from './Gradient';
import Image, { images } from './Image';

const Wrap = styled.div`
  background: #fff;
  border-radius: 8px;
  width: 485px;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  .ant-tabs {
    .ant-tabs-nav {
      margin: 0 !important;
    }
    .ant-tabs-tab-active {
      font-weight: bold;
    }
    .ant-tabs-tab-btn {
      color: #757575;
    }
    .ant-tabs-tab {
      padding: 9px 0;
    }
    .ant-tabs-nav-list {
      padding: 0 15px;
    }
    .ant-tabs-tabpane {
      padding: 10px;
    }
  }
`;

const ClearWrap = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 3px;
  border: 1px solid #dddddd;
  background-color: #fff;
  position: relative;
  &:hover {
    border-color: #bdbdbd;
  }
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: red;
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
    name: _l('自定义'),
    value: 'custom',
  },
];

export default function BgPicker(props) {
  const { themeColor, config, onChange } = props;
  const { bgStyleValue } = config;
  const [tab, setTab] = useState(bgStyleValue || TABS[0].value);
  const colorPickerRef = useRef();

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
      const { displaySetup } = props;
      const previewUrl = displaySetup.previewUrl || displaySetup.imageUrl;
      return { backgroundImage: `url(${previewUrl})`, backgroundSize: 'cover' };
    }
    return { backgroundColor: '#fff' };
  };

  return (
    <Trigger
      zIndex={1000}
      action={['click']}
      popupAlign={{ points: ['tl', 'bl'], offset: [0, 5], overflow: { adjustX: true, adjustY: true } }}
      onPopupVisibleChange={visible => {
        if (!visible && colorPickerRef.current) {
          colorPickerRef.current.onClose();
        }
      }}
      popup={
        <Wrap>
          <Tabs
            activeKey={tab}
            onChange={tab => {
              setTab(tab);
            }}
            tabBarExtraContent={
              <Tooltip title={_l('清空')} placement="bottom">
                <ClearWrap
                  className="pointer mRight10"
                  onClick={() => {
                    onChange({ bgStyleValue: '', bgColor: '#fff' });
                  }}
                />
              </Tooltip>
            }
          >
            {TABS.map(tab => (
              <Tabs.TabPane tab={tab.name} key={tab.value}>
                {tab.value === 'color' && <Color value={tab.value} {...props} colorPickerRef={colorPickerRef} />}
                {tab.value === 'gradient' && <Gradient value={tab.value} {...props} />}
                {tab.value === 'image' && <Image value={tab.value} {...props} />}
                {tab.value === 'custom' && <Custom value={tab.value} {...props} />}
              </Tabs.TabPane>
            ))}
          </Tabs>
        </Wrap>
      }
    >
      <div className="colorWrap pointer overflowHidden pAll0">
        <div className="colorBlock" style={getBgStyle()}></div>
      </div>
    </Trigger>
  );
}
