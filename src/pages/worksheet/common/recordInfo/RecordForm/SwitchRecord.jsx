import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Tooltip } from 'ming-ui/antd-components';

export default function SwitchRecord(props) {
  const { currentSheetRows, currentIndex, onSwitch } = props;
  const canPrev = currentSheetRows.length > 0 && currentIndex !== 0;
  const canNext = currentSheetRows.length > 0 && currentIndex !== currentSheetRows.length - 1;
  return (
    <React.Fragment>
      <span
        className={cx('prevRecordBtn', { disable: !canPrev, ThemeHoverColor3: canPrev })}
        onClick={
          canPrev
            ? () => {
                onSwitch(false);
              }
            : () => {}
        }
      >
        <Tooltip title={_l('上一条')} shortcut={window.isMacOs ? '⌘⇧,' : 'Ctrl+Shift+,'}>
          <i className="icon icon-arrow-up-border InlineBlock" />
        </Tooltip>
      </span>
      <span
        className={cx('nextRecordBtn', { disable: !canNext, ThemeHoverColor3: canNext })}
        onClick={
          canNext
            ? () => {
                onSwitch(true);
              }
            : () => {}
        }
      >
        <Tooltip title={_l('下一条')} shortcut={window.isMacOs ? '⌘⇧.' : 'Ctrl+Shift+.'}>
          <i className="icon icon-arrow-down-border InlineBlock" />
        </Tooltip>
      </span>
    </React.Fragment>
  );
}

SwitchRecord.propTypes = {
  currentSheetRows: PropTypes.arrayOf(PropTypes.shape({})),
  currentIndex: PropTypes.number,
  onSwitch: PropTypes.func,
};
