import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';

const StatusWrap = styled.span`
  display: flex;
  align-items: center;
  .circlePoint {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;
    display: inline-block;
  }
  .statusText {
    font-size: 12px;
  }
`;

const STATUS_CONFIG = {
  0: {
    text: _l('创建中，请稍候（约需要几分钟）...'),
    textColor: '#212121',
    loading: true,
    icon: null,
    color: null,
  },
  1: {
    text: _l('创建失败'),
    textColor: '#F51744',
    loading: false,
    icon: 'icon-cancel',
    color: '#F51744',
  },
  2: {
    text: _l('运行中'),
    textColor: '#757575',
    loading: false,
    icon: null,
    color: '#00CA86',
  },
  3: {
    text: _l('启动中'),
    textColor: '#757575',
    loading: false,
    icon: null,
    color: '#00CA86',
  },
  4: {
    text: _l('停止中'),
    textColor: '#F5972B',
    loading: false,
    icon: null,
    color: '#F5972B',
  },
  5: {
    text: _l('已停止'),
    textColor: '#757575',
    loading: false,
    icon: null,
    color: '#BDBDBD',
  },
  6: {
    text: _l('重启中'),
    textColor: '#F5972B',
    loading: false,
    icon: null,
    color: '#F5972B',
  },
  7: {
    text: _l('销毁中'),
    textColor: '#F5972B',
    loading: false,
    icon: null,
    color: '#F5972B',
  },
  8: {
    text: _l('已销毁'),
    textColor: '#757575',
    loading: false,
    icon: null,
    color: '#BDBDBD',
  },
  9: {
    text: _l('销毁失败'),
    textColor: '#F51744',
    loading: false,
    icon: 'icon-cancel',
    color: '#F51744',
  },
};

function Status(props) {
  const { text = '', className = '', textColor = '', value = null, statusConfig } = props;

  const [config, setConfig] = useState(statusConfig ? statusConfig[value] : STATUS_CONFIG[value]);

  useEffect(() => {
    setConfig(statusConfig ? statusConfig[value] : STATUS_CONFIG[value]);
  }, [value]);

  if (!config) return null;

  return (
    <StatusWrap className={className}>
      {config.loading ? (
        <LoadDiv size="small" className="mRight12" />
      ) : (
        <span
          className={config.icon ? `${config.icon} mRight6` : 'circlePoint'}
          style={
            config.icon
              ? {
                  color: config.color,
                }
              : {
                  background: config.color,
                }
          }
        ></span>
      )}

      <span
        className="statusText"
        style={{
          color: textColor || config.textColor,
        }}
      >
        {text || config.text}
      </span>
    </StatusWrap>
  );
}

export default Status;
