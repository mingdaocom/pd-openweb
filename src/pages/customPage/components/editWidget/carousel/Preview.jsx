import React from 'react';
import { Divider } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import SelectCount from 'src/pages/customPage/components/editWidget/button/SelectCount';
import Carousel from './Carousel';

const Wrap = styled.div`
  display: flex;
  flex: 1;
  padding: 10px 24px;
  min-width: 0;

  .body {
    border-radius: 4px;
    box-shadow: 0px 1px 4px #00000029;
    overflow: auto;
    background-color: #fff;
  }
`;

const ANIMATION_TYPE = [
  {
    value: 'scrollx',
    text: _l('滚动'),
  },
  {
    value: 'fade',
    text: _l('淡入淡出'),
  },
];

export default function Preview(props) {
  const { componentConfig, config, setConfig } = props;
  return (
    <Wrap className="flexColumn">
      <div className="flexRow valignWrapper header">
        <div className="Font13 overflow_ellipsis mRight10">{_l('样式')}</div>
        <div className="btnStyle mRight20">
          {ANIMATION_TYPE.map(({ value, text }) => (
            <div
              className={cx('item', { active: value === config.effect })}
              key={value}
              onClick={() => {
                setConfig({ effect: value });
              }}
            >
              <div className="ellipsis Font14">{text}</div>
            </div>
          ))}
        </div>
        <div className="Font13 overflow_ellipsis mRight10">{_l('间隔')}</div>
        <SelectCount
          maxCount={8}
          minCount={1}
          count={config.autoplaySpeed}
          needCloseSelect={true}
          suffix={_l('秒')}
          mode="select"
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
