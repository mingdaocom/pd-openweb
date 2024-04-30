import React, { Fragment } from 'react';
import { Icon, Dropdown } from 'ming-ui';
import { Tooltip } from 'antd';
import _ from 'lodash';
import cx from 'classnames';
import { USER_TYPE } from '../../../enum';
import { quickSelectUser } from 'ming-ui/functions';
import Member from '../Member';

export default ({
  projectId,
  appId,
  processId,
  hideGoToSettings,
  isApproval,
  title,
  titleInfo,
  userTaskNullMap,
  showDefaultItem,
  updateSource,
}) => {
  const userTaskNullType = parseInt(Object.keys(userTaskNullMap)[0]);
  const USER_TASK_NULL_TYPE = [
    { text: _l('自动进入下一个节点'), value: 1 },
    { text: _l('由流程拥有者代理'), value: 2 },
    { text: _l('指定人员代理'), value: 5 },
    { text: _l('流程结束'), value: 3 },
    { text: isApproval ? _l('使用发起节点中的默认设置') : _l('使用流程默认设置'), value: 0 },
  ];
  const selectCharge = event => {
    quickSelectUser(event.target, {
      offset: {
        top: 10,
        left: 0,
      },
      projectId,
      unique: true,
      filterAll: true,
      filterFriend: true,
      filterOthers: true,
      filterOtherProject: true,
      onSelect: users => {
        updateSource({
          [userTaskNullType]: users.map(item => {
            return {
              type: USER_TYPE.USER,
              entityId: '',
              entityName: '',
              roleId: item.accountId,
              roleName: item.fullname,
              avatar: item.avatar,
            };
          }),
        });
      },
    });
  };

  if (!showDefaultItem || !userTaskNullType) {
    _.remove(USER_TASK_NULL_TYPE, o => o.value === 0);
  }

  return (
    <Fragment>
      <div className="Font13 mTop20 bold">
        {title}
        {titleInfo && (
          <span className="workflowDetailTipsWidth mLeft5 tip-top-right" data-tip={titleInfo}>
            <Icon className="Font16 Gray_9e" icon="info" />
          </span>
        )}
      </div>
      <Dropdown
        className="flowDropdown mTop10"
        data={USER_TASK_NULL_TYPE}
        value={userTaskNullType || undefined}
        placeholder={isApproval ? _l('使用发起节点中的默认设置') : _l('使用流程默认设置')}
        border
        renderTitle={() => (
          <Fragment>
            {USER_TASK_NULL_TYPE.find(o => o.value === userTaskNullType).text}
            {userTaskNullType === 2 && (
              <Tooltip
                title={_l(
                  '流程的拥有者默认为流程创建者，在流程配置中可修改流程拥有者。（当没有流程拥有者时，由应用拥有者代理）',
                )}
              >
                <Icon className="Font14 Gray_9e Absolute" icon="info" style={{ right: 30 }} />
              </Tooltip>
            )}
          </Fragment>
        )}
        onChange={userTaskNullType => updateSource({ [userTaskNullType]: [] })}
      />

      {processId && userTaskNullType === 2 && (
        <div className="Gray_75 mTop5">
          {_l('当前流程还没有流程拥有者')}
          {hideGoToSettings ? (
            _l('，请在 流程发起节点 中配置')
          ) : (
            <span
              className="ThemeColor3 ThemeHoverColor2 pointer mLeft5"
              onClick={() => window.open(`/workflowedit/${processId}/3`)}
            >
              {_l('前往设置')}
            </span>
          )}
        </div>
      )}

      {userTaskNullType === 5 && (
        <div className="flexRow alignItemsCenter">
          <div className="mRight10 mTop12">{_l('代理人')}</div>
          <Member companyId={projectId} appId={appId} leastOne accounts={userTaskNullMap[userTaskNullType]} />
          <div
            className={cx('Gray_c ThemeHoverColor3 mTop12 pointer', {
              mLeft8: userTaskNullMap[userTaskNullType].length,
            })}
            onClick={selectCharge}
          >
            <i
              className={cx(
                'Font28',
                userTaskNullMap[userTaskNullType].length ? 'icon-add-member3' : 'icon-task-add-member-circle',
              )}
            />
          </div>
        </div>
      )}
    </Fragment>
  );
};
