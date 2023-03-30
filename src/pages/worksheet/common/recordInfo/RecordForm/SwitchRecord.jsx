import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Tooltip } from 'ming-ui';

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
        <Tooltip
          offset={[-18, 0]}
          text={
            <span>
              {navigator.userAgent.indexOf('Mac OS') > 0
                ? _l('上个记录（⌘ + ⇧ + ,）')
                : _l('上个记录（Ctrl + Shift + ,）')}
            </span>
          }
        >
          <i className="icon icon-arrow-up-border" />
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
        <Tooltip
          text={
            <span>
              {navigator.userAgent.indexOf('Mac OS') > 0
                ? _l('下个记录（⌘ + ⇧ + .）')
                : _l('下个记录（Ctrl + Shift + .）')}
            </span>
          }
        >
          <i className="icon icon-arrow-down-border" />
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
