import React, { cloneElement } from 'react';
import { Tooltip } from 'antd';
import './index.less';

export default function (props) {
  const { children, destroyTooltipOnHide = true, type = 'black', title, color, shortcut, maxWidth = 350 } = props;

  const renderTitle = () => {
    let content = title;
    if (!content) return null;

    // 如果有快捷键参数，则在 title 后面添加快捷键显示
    if (shortcut) {
      return (
        <span>
          {content}
          <span className="mLeft8 Alpha7">{shortcut}</span>
        </span>
      );
    }

    if (type === 'white') {
      return <div className="Gray">{content}</div>;
    }

    return content;
  };

  return (
    <Tooltip
      {...props}
      color={type === 'white' ? 'white' : color || 'black'}
      title={renderTitle()}
      overlayClassName={`md-tooltip-overlay ${props.overlayClassName}`}
      overlayStyle={{ maxWidth, maxHeight: 300, whiteSpace: 'pre-wrap' }}
      destroyTooltipOnHide={destroyTooltipOnHide}
      zIndex={props.zIndex || 100000}
    >
      {cloneElement(children)}
    </Tooltip>
  );
}
