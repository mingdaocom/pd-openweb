import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Input } from 'ming-ui';
import { AREA } from 'src/pages/worksheet/common/Sheet/GroupFilter/constants.js';

const MobileConfigWrap = styled.div`
  line-height: normal;
  .line {
    width: 100%;
    height: 1px;
    border-top: 1px solid var(--color-border-primary);
    margin: 30px 0;
  }
  .navTypeIconWrap {
    width: 55px;
    height: 67px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition:
      color 0.2s,
      background-color 0.2s;
    color: var(--color-text-secondary);
    &:hover {
      color: var(--color-primary);
    }
    &.active {
      color: var(--color-primary);
    }
    .ming.Icon {
      font-size: 70px;
    }
  }
  .iconWrap {
    margin-right: 48px;
  }
  .activeIcon {
    color: var(--color-white);
    position: absolute;
    right: -8px;
    top: -8px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid var(--color-white);
    background-color: var(--color-primary);
  }
  .activeTxt {
    color: var(--color-primary);
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
  { name: _l('侧滑'), value: '2', icon: 'group_swipe' },
  { name: _l('导航'), value: '1', icon: 'group_navigation' },
  { name: _l('分栏'), value: '3', icon: 'grouping_columns' },
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
          .filter(v => (_.includes([...AREA, 29, 35], filterData.type) ? v.value !== '3' : true))
          .map(item => {
            return (
              <div
                key={item.value}
                className="flexColumn valignWrapper Relative pointer iconWrap"
                onClick={() => onChange({ appnavtype: item.value })}
              >
                {value === item.value && (
                  <div className="flexRow valignWrapper activeIcon">
                    <Icon icon="done" className="Font14" />
                  </div>
                )}
                <div className={`navTypeIconWrap flexColumn valignWrapper ${value === item.value ? 'active' : ''}`}>
                  <Icon icon={item.icon} />
                </div>
                <div className={cx('TxtCenter', { activeTxt: value === item.value })}>{item.name}</div>
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
            <span className="unit textTertiary">px</span>
          </div>
        </Fragment>
      )}
    </MobileConfigWrap>
  );
}
