import React from 'react';
import styled from 'styled-components';
import { Divider, Segmented, Select } from 'ming-ui/antd-components';
import Carousel from './Carousel';

const Wrap = styled.div`
  display: flex;
  flex: 1;
  padding: 10px 24px;
  min-width: 0;
  background-color: var(--color-background-tertiary);

  .body {
    border-radius: 4px;
    box-shadow: var(--shadow-sm);
    overflow: auto;
    background-color: var(--color-background-card);
  }
`;

const getAnimationTypeOptions = () => [
  {
    value: 'scrollx',
    label: _l('滚动'),
  },
  {
    value: 'fade',
    label: _l('淡入淡出'),
  },
];

const getAutoplaySpeedOptions = () => [
  { value: false, label: _l('关闭') },
  ...Array.from({ length: 8 }, (_, index) => ({
    value: index + 1,
    label: _l('%0秒', index + 1),
  })),
];

const AUTOPLAY_SELECT_STYLE = { minWidth: 70 };

export default function Preview(props) {
  const { componentConfig, config, setConfig } = props;
  return (
    <Wrap className="flexColumn">
      <div className="flexRow valignWrapper header">
        <div className="Font13 overflow_ellipsis mRight10">{_l('样式')}</div>
        <Segmented
          className="bgDisabled mRight20"
          value={config.effect}
          options={getAnimationTypeOptions()}
          onChange={value => {
            setConfig({ effect: value });
          }}
        />
        <div className="Font13 overflow_ellipsis mRight10">{_l('间隔')}</div>
        <Select
          style={AUTOPLAY_SELECT_STYLE}
          value={config.autoplaySpeed}
          options={getAutoplaySpeedOptions()}
          onChange={value => {
            setConfig({ autoplaySpeed: value });
          }}
        />
      </div>
      <Divider className="mTop16 mBottom24" />
      <div className="body flex mBottom72">
        <Carousel componentConfig={componentConfig} config={config} />
      </div>
    </Wrap>
  );
}
