import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import { Icon, Input } from 'ming-ui';
import nav from './img/nav.png';
import navActive from './img/navActive.png';
import sideSlip from './img/sideSlip.png';
import sideSlipActive from './img/sideSlipActive.png';
import column from './img/column.png';
import columnActive from './img/columnActive.png';
import _ from 'lodash';

const MobileConfigWrap = styled.div`
  line-height: normal;
  .line {
    width: 100%;
    height: 1px;
    border-top: 1px solid #ddd;
    margin: 30px 0;
  }
  img {
    width: 55px;
    height: 67px;
    margin-bottom: 10px;
    background-size: cover !important;
    transition: box-shadow 0.3s;
    &:hover {
      box-shadow: 0 4px 20px #00000021, 0 2px 6px #0000001a;
    }
  }
  .iconWrap {
    margin-right: 48px;
  }
  .activeIcon {
    color: #fff;
    position: absolute;
    right: -8px;
    top: -8px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid #ffffff;
    background-color: #2196f3;
  }
  .ming.Radio .Radio-box {
    margin-right: 6px !important;
  }

  .inputWrap {
    .unit {
      position: absolute;
      right: 12px;
      top: 9px;
    }
    input {
      padding-right: 40px;
    }
  }
`;

const dataList = [
  {
    name: _l('侧滑'),
    value: '2',
    imgSrc: sideSlip,
    activeImgSrc: sideSlipActive,
  },
  {
    name: _l('导航'),
    value: '1',
    imgSrc: nav,
    activeImgSrc: navActive,
  },
  {
    name: _l('分栏'),
    value: '3',
    imgSrc: column,
    activeImgSrc: columnActive,
  },
];

export default function MobileConfig(props) {
  const { value, advancedSetting = {}, onChange = () => {}, filterData = {} } = props;
  const { appnavwidth = 60 } = advancedSetting;
  const [width, setWidth] = useState(appnavwidth);

  const changeWidth = value => {
    let val = value
      .replace(/[^-\d.]/g, '')
      .replace(/^\./g, '')
      .replace(/^-/, '$#$')
      .replace(/-/g, '')
      .replace('$#$', '-')
      .replace(/^-\./, '-')
      .replace('.', '$#$')
      .replace(/\./g, '')
      .replace('$#$', '.');

    setWidth(val);
  };

  return (
    <MobileConfigWrap>
      <div className="line"></div>
      <h6 className="Font13 Bold mBottom20">{_l('移动端显示')}</h6>
      <div className="flexRow valignWrapper">
        {dataList
          .filter(v => (_.includes([29, 35], filterData.type) ? v.value !== '3' : true))
          .map(item => {
            return (
              <div
                key={item.value}
                className="flexColumn valignWrapper Relative pointer iconWrap"
                onClick={() => onChange({ appnavtype: item.value })}
              >
                {value === item.value && (
                  <div className="flexRow valignWrapper activeIcon">
                    <Icon icon="done" />
                  </div>
                )}
                <img src={value === item.value ? item.activeImgSrc : item.imgSrc} />
                <div className="TxtCenter">{item.name}</div>
              </div>
            );
          })}
      </div>

      {value === '3' && (
        <Fragment>
          <h6 className="Font13 Bold mTop30 mBottom10">{_l('分栏宽度')}</h6>
          <div className="Relative inputWrap">
            <Input
              className="w100"
              value={width}
              onChange={changeWidth}
              onBlur={() => {
                setWidth(width < 60 ? 60 : width > 180 ? 180 : width);
                onChange({ appnavwidth: width < 60 ? 60 : width > 180 ? 180 : width });
              }}
            />
            <span className="unit Gray_9e">px</span>
          </div>
        </Fragment>
      )}
    </MobileConfigWrap>
  );
}
