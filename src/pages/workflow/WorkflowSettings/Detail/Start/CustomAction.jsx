import React, { Fragment } from 'react';
import cx from 'classnames';
import { ACTION_ID, CUSTOM_ACTION_TEXT } from '../../enum';

export default ({ data, isAIActions }) => {
  return (
    <Fragment>
      <div className={cx('flowDetailStartHeader flexColumn', isAIActions ? 'BGBlue' : 'BGBlueAsh')}>
        <div className="flowDetailStartIcon flexRow">
          <i className={cx('Font40', isAIActions ? 'icon-auto_awesome blue' : 'icon-custom_actions gray')} />
        </div>
        <div className="Font16 mTop10">{isAIActions ? _l('AI 动作触发') : _l('按钮触发')}</div>
      </div>
      <div className="workflowDetailBox mTop20">
        <div className="ellipsis">
          {_l('工作表')}
          <span className="mLeft10 bold">{data.appName}</span>
        </div>
        {!isAIActions && (
          <div className="ellipsis mTop15">
            {_l('数据源')}
            <span className="mLeft10 bold">
              {data.actionId === ACTION_ID.BATCH_ACTION ? _l('多条记录') : _l('单条记录')}
            </span>
          </div>
        )}
        <div className="mTop20 bold">{_l('按钮')}</div>
        <div
          className="workflowDetailDesc mTop10"
          style={{ padding: '8px 16px', border: '1px solid var(--color-border-primary)' }}
        >
          <div>{data.triggerName}</div>
          <div className="ellipsis textSecondary">{CUSTOM_ACTION_TEXT[data.clickType]}</div>
        </div>
      </div>
    </Fragment>
  );
};
