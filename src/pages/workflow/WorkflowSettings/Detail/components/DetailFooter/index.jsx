import React from 'react';
import { any, func } from 'prop-types';
import cx from 'classnames';

DetailFooter.propTypes = {
  isCorrect: any,
  onSave: func,
  closeDetail: func,
};

export default function DetailFooter({ isCorrect, onSave, closeDetail, isIntegration }) {
  return (
    <div className={cx('workflowDetailFooter flexRow', { workflowDetailFooterWhile: isIntegration })}>
      <span
        className={cx('footerSaveBtn ThemeBGColor3 ThemeHoverBGColor2 mRight10', { Alpha5: !isCorrect })}
        onClick={onSave}
      >
        {_l('保存')}
      </span>

      <span
        className="footerCancelBtn ThemeBorderColor3 ThemeHoverBorderColor2 ThemeColor3 ThemeHoverColor2"
        onClick={closeDetail}
      >
        {_l('取消')}
      </span>
    </div>
  );
}
