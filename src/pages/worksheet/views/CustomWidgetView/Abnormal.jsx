import React from 'react';
import cx from 'classnames';
import { isFunction } from 'lodash';
import { includes } from 'lodash';
import { bool, number, string } from 'prop-types';
import styled from 'styled-components';
import { Button } from 'ming-ui';
import { CUSTOM_WIDGET_VIEW_STATUS } from 'worksheet/constants/enum';
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
    background: #151515;
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

const statusIcons = {
  [CUSTOM_WIDGET_VIEW_STATUS.NOT_PUBLISH]: <i className={`icon icon-setting`}></i>,
  [CUSTOM_WIDGET_VIEW_STATUS.LOAD_SCRIPT_ERROR]: <img src={abnormal} />,
  [CUSTOM_WIDGET_VIEW_STATUS.DELETED]: <i className={`icon icon-setting`}></i>,
};

const statusTexts = {
  [CUSTOM_WIDGET_VIEW_STATUS.NOT_PUBLISH]: _l('插件未发布'),
  [CUSTOM_WIDGET_VIEW_STATUS.DEVELOPING]: _l('插件开发中'),
  [CUSTOM_WIDGET_VIEW_STATUS.DELETED]: _l('插件已删除，请重新创建'),
  [CUSTOM_WIDGET_VIEW_STATUS.EXPIRED]: _l('插件已过期'),
  [CUSTOM_WIDGET_VIEW_STATUS.LOAD_SCRIPT_ERROR]: _l('插件加载出错，请检查项目URL'),
};

export default function Abnormal(props) {
  const { showDebugButton, status = CUSTOM_WIDGET_VIEW_STATUS.NOT_PUBLISH } = props;
  const isDark = status === CUSTOM_WIDGET_VIEW_STATUS.NOT_PUBLISH;

  return (
    <Con className={cx('absCenter', { isDark })}>
      <div className="iconCon absCenter">
        {statusIcons[status] || statusIcons[CUSTOM_WIDGET_VIEW_STATUS.NOT_PUBLISH]}
      </div>
      <div className="tip">
        {props.text || statusTexts[status] || statusTexts[CUSTOM_WIDGET_VIEW_STATUS.NOT_PUBLISH]}
      </div>
      {window.isSafari && status === CUSTOM_WIDGET_VIEW_STATUS.LOAD_SCRIPT_ERROR && (
        <div className="tip-sec">
          {_l('由于插件运行的机制，开发模式下 Safari 无法正常运行插件，请使用 Chrome 或 Firefox 开发插件。')}
        </div>
      )}
      {status === CUSTOM_WIDGET_VIEW_STATUS.LOAD_SCRIPT_ERROR &&
        md.global.Config.IsLocal &&
        !window.isFirefox &&
        location.protocol === 'http:' &&
        !(location.host || '').startsWith('localhost') && (
          <div className="tip-sec">{_l('非 https 下 Chrome 无法加载本地脚本，请使用 Firefox 开发插件。')}</div>
        )}
      <div className="tip-sec">{_l('Chrome 最近限制了本地脚本的加载，出现这种情况时，请使用 Firefox 开发插件。')}</div>
      {showDebugButton &&
        includes([CUSTOM_WIDGET_VIEW_STATUS.DEVELOPING, CUSTOM_WIDGET_VIEW_STATUS.LOAD_SCRIPT_ERROR], status) && (
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
  text: string,
};
