import React, { Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Select, Tooltip } from 'ming-ui/antd-components';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { USER_TYPE } from '../../../enum';
import Member from '../Member';

const SELECT_LABEL_STYLE = { position: 'relative', zIndex: 1 };

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
    { label: _l('自动进入下一个节点'), value: 1 },
    { label: _l('由流程拥有者代理'), value: 2 },
    { label: _l('指定人员代理'), value: 5 },
    { label: _l('流程结束'), value: 3 },
    { label: isApproval ? _l('使用发起节点中的默认设置') : _l('使用流程默认设置'), value: 0 },
  ];

  if (!showDefaultItem || !userTaskNullType) {
    _.remove(USER_TASK_NULL_TYPE, o => o.value === 0);
  }

  return (
    <Fragment>
      <div className="Font13 mTop20 bold flexRow alignItemsCenter">
        {title}
        {titleInfo && (
          <Tooltip title={titleInfo}>
            <Icon className="Font16 textTertiary mLeft5" icon="info" />
          </Tooltip>
        )}
      </div>
      <Select
        className="flowDropdown mTop10"
        options={USER_TASK_NULL_TYPE}
        value={userTaskNullType || undefined}
        placeholder={isApproval ? _l('使用发起节点中的默认设置') : _l('使用流程默认设置')}
        labelRender={() => (
          <span className="flexRow alignItemsCenter" style={SELECT_LABEL_STYLE}>
            <span>{(USER_TASK_NULL_TYPE.find(o => o.value === userTaskNullType) || {}).label}</span>
            {userTaskNullType === 2 && (
              <Tooltip
                title={_l(
                  '流程的拥有者默认为流程创建者，在流程配置中可修改流程拥有者。（当没有流程拥有者时，由应用拥有者代理）',
                )}
              >
                <Icon className="Font14 textTertiary mLeft5" icon="info" />
              </Tooltip>
            )}
          </span>
        )}
        onChange={userTaskNullType => updateSource({ [userTaskNullType]: [] })}
      />

      {processId && userTaskNullType === 2 && (
        <div className="Font13 textSecondary mTop5">
          {_l('当前流程还没有流程拥有者')}
          {hideGoToSettings ? (
            _l('，请在 流程发起节点 中配置')
          ) : (
            <span
              className="colorPrimary hoverColorPrimaryDark pointer mLeft5"
              onClick={() => window.open(pathCompletion(`/workflowedit/${processId}/3`))}
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
          <UserSelectPopover
            offset={{ top: 10, left: 0 }}
            projectId={projectId}
            unique
            filterAll
            filterFriend
            filterOthers
            filterOtherProject
            onSelect={users => {
              updateSource({
                [userTaskNullType]: users.map(item => ({
                  type: USER_TYPE.USER,
                  entityId: '',
                  entityName: '',
                  roleId: item.accountId,
                  roleName: item.fullname,
                  avatar: item.avatar,
                })),
              });
            }}
          >
            <div
              className={cx('textPlaceholder hoverColorPrimary mTop12 pointer', {
                mLeft8: userTaskNullMap[userTaskNullType].length,
              })}
            >
              <i
                className={cx(
                  'Font28',
                  userTaskNullMap[userTaskNullType].length ? 'icon-add-member3' : 'icon-task-add-member-circle',
                )}
              />
            </div>
          </UserSelectPopover>
        </div>
      )}
    </Fragment>
  );
};
