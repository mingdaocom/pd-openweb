import React from 'react';
import { bool, number, string } from 'prop-types';
import { Button } from 'ming-ui';
import { isFunction } from 'lodash';
import cx from 'classnames';
import styled from 'styled-components';
import { includes } from 'lodash';
import abnormal from 'src/pages/worksheet/assets/abnormal.png';

const Con = styled.div`
  width: 100%;
  height: 100%;
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
  .iconCon {
    width: 130px;
    height: 130px;
    border-radius: 130px;
    background: #f5f5f5;
    display: flex;
    justify-content: center;
    align-items: center;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .icon {
      font-size: 70px;
      color: #a5a5a5;
    }
  }
  .tip {
    font-size: 17px;
    margin-top: 40px;
    color: #757575;
  }
  .tip-sec {
    font-size: 14px;
    margin-top: 20px;
    color: #aaa;
  }
  .continueDevelop {
    margin-top: 45px;
  }
  &.isDark {
    background: #333;
    .iconCon {
      background: #4a4a4a;
      .icon {
        color: #818181;
      }
    }
    .tip {
      color: #9e9e9e;
    }
  }
`;

const compMap = {
  3: {
    icon: <i className={`icon icon-setting`}></i>,
    tip: _l('插件开发中'),
  },
  5: {
    icon: <img src={abnormal} />,
    tip: _l('插件加载出错，请检查项目URL'),
  },
  6: {
    icon: <i className={`icon icon-setting`}></i>,
    tip: _l('插件已删除，请重新创建'),
  },
};

export default function Abnormal(props) {
  const { showDebugButton, status = 3 } = props;
  const comp = compMap[status] || compMap[3];
  const isDark = status === 3;
  const isSafari = /^((?!chrome).)*safari.*$/.test(navigator.userAgent.toLowerCase());
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
  return (
    <Con className={cx('absCenter', { isDark })}>
      <div className="iconCon absCenter">{comp.icon}</div>
      <div className="tip">{comp.tip}</div>
      {isSafari && status === 5 && (
        <div className="tip-sec">
          {_l('由于插件运行的机制，开发模式下 Safari 无法正常运行插件，请使用 Chrome 或 Firefox 开发插件。')}
        </div>
      )}
      {status === 5 &&
        md.global.Config.IsLocal &&
        !isFirefox &&
        location.protocol === 'http:' &&
        !(location.host || '').startsWith('localhost') && (
          <div className="tip-sec">{_l('非 https 下 Chrome 无法加载本地脚本，请使用 Firefox 开发插件。')}</div>
        )}
      {showDebugButton && includes([3, 5], status) && (
        <Button
          className="continueDevelop"
          onClick={() => {
            if (isFunction(window.openViewConfig)) {
              window.openViewConfig();
            }
          }}
        >
          {_l('继续开发')}
        </Button>
      )}
    </Con>
  );
}

Abnormal.propTypes = {
  showDebugButton: bool,
  status: number,
};
