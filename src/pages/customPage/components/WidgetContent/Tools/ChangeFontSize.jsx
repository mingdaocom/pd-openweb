import React, { useState } from 'react';
import cx from 'classnames';
import { Input, Popover, Slider } from 'ming-ui/antd-components';
import { formatNumberFromInput } from 'src/utils/domain/control/number';

export default props => {
  const { highlight, toolItem, widget, toolsWrapRef, handleToolClick } = props;
  const { config = {} } = widget;
  const { type, icon } = toolItem;
  const [fontSize, setFontSize] = useState(config.mobileFontSize || 15);
  return (
    <Popover
      placement="bottom"
      arrow={{ pointAtCenter: true }}
      content={
        <div className="changeFontSizePopover flexRow">
          <Slider
            className="flex"
            value={fontSize}
            min={12}
            max={28}
            onChange={value => {
              setFontSize(value);
              handleToolClick(type, {
                config: {
                  ...config,
                  mobileFontSize: value,
                },
              });
            }}
          />
          <Input
            className="mLeft10"
            value={fontSize}
            onChange={event => {
              const value = Number(formatNumberFromInput(event.target.value, false) || 0);
              setFontSize(value);
            }}
            onBlur={() => {
              let value = fontSize;

              if (value <= 12) {
                value = 12;
              }

              if (value >= 28) {
                value = 28;
              }

              setFontSize(value);
              handleToolClick(type, {
                config: {
                  ...config,
                  mobileFontSize: value,
                },
              });
            }}
          />
        </div>
      }
      getPopupContainer={() => toolsWrapRef.current || document.body}
    >
      <div className={cx('toolItem', type, { highlight })} key={type}>
        <i className={`icon-${icon} Font18`}></i>
      </div>
    </Popover>
  );
};
