import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Support } from 'ming-ui';
import addFriends from 'src/components/addFriends';
import { navigateTo } from 'src/router/navigateTo';
import PurchaseExpandPack from '../../components/PurchaseExpandPack';
import { formatValue, getValue } from '../utils';

// 组织管理首页-用户信息卡片
export default function UserCard(props) {
  const { projectId, data, isLocal, isTrial, isFree } = props;
  const isShowInviteUser = (md.global.Account.projects || []).some(it => it.licenseType === 1);

  return (
    <div className={cx('infoCard', { row1: md.global.Config.IsPlatformLocal === false })}>
      <div>
        <div className="Font16 bold Gray mBottom6 valignWrapper mBottom6">
          {_l('用户')}
          {!isLocal && (
            <Support
              className="mLeft6 helpIcon Hover_21"
              type={1}
              title={_l('点击查看人数计算规则')}
              href="https://help.mingdao.com/purchase/user-billing"
            />
          )}
        </div>
        <div className="mBottom6">
          <span className="Font28 Gray Bold Hand" onClick={() => navigateTo(`/admin/structure/${projectId}`)}>
            {formatValue(getValue(data.effectiveUserCount || 0))}
          </span>
          <span className="mLeft6 Black Font13">{_l('人')}</span>
        </div>
        {(!isTrial || isLocal) && !data.basicLoading && (
          <div className="Font14">
            <span className="Gray_75">{_l('上限 %0 人', getValue(data.limitUserCount || 0))}</span>
            {!isFree && !_.isUndefined(data.limitUserCount) && (
              <PurchaseExpandPack
                className="mLeft8 hoverColor"
                text={_l('扩充人数')}
                type="user"
                projectId={projectId}
              />
            )}
          </div>
        )}
      </div>
      {isShowInviteUser && (
        <div className="buttons">
          <div className="blueBtn Bold" onClick={() => addFriends({ projectId: projectId, fromType: 4 })}>
            {_l('邀请成员')}
          </div>
        </div>
      )}
    </div>
  );
}
