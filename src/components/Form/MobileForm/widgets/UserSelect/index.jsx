import React, { Fragment, memo, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import SelectUser from 'mobile/components/SelectUser';
import { dealUserRange } from '../../../core/utils';
import { useFormStore } from '../../../index';
import { getTabTypeBySelectUser, getUserValue } from '../../tools/utils';

const UserItemBox = styled.div`
  position: relative;
  display: flex !important;
  align-items: center;
  max-width: 100%;
  padding-left: ${props => props.userHeadSize + 8}px !important;
  ${props => props.isUnique && 'background: initial !important;'}

  .userHead {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: ${props => props.userHeadSize}px;
    height: ${props => props.userHeadSize}px;
    border-radius: 50%;
  }
  .userName {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

function UserSelect(props) {
  const {
    from,
    projectId,
    disabled,
    formDisabled,
    enumDefault,
    formData = [],
    appId,
    masterData = {},
    enumDefault2,
    advancedSetting = {},
    value,
    onChange = () => {},
  } = props;
  const {
    state: { emSizeNum },
  } = useFormStore();
  const userHeadSize = emSizeNum * 1.5 + 4;
  const selectUsers = getUserValue(value);
  const filterAccountIds = _.map(selectUsers, 'accountId');
  const [showSelectUser, setShowSelectUser] = useState(false);
  const isUnique = enumDefault === 0;

  const pickUser = () => {
    if (formDisabled || disabled) return;

    const tabType = getTabTypeBySelectUser(props);
    if (
      tabType === 1 &&
      md.global.Account.isPortal &&
      !_.find(md.global.Account.projects, item => item.projectId === projectId)
    ) {
      alert(_l('您不是该组织成员，无法获取其成员列表，请联系组织管理员'), 3);
      return;
    }

    if (
      window.isMingDaoApp &&
      advancedSetting.usertype === '1' &&
      enumDefault2 !== 1 &&
      window.MDJS &&
      window.MDJS.chooseUsers
    ) {
      // 仅限内部用户
      // 支持全范围选择
      // 支持限定网络下选择
      // 不支持指定成员选择
      // 不支持外部用户选择
      window.MDJS.chooseUsers({
        projectId: projectId, // 网络ID, 默认为空, 不限制
        count: isUnique ? 1 : '', // 默认为空, 不限制数量
        //暂不支持 appointed:[], // [accountId], 特定列表, 只加载约定用户
        selected: selectUsers.map(({ accountId, fullname, avatar }) => ({ accountId, fullname, avatar })), // 已选中的用户, 交互上可以取消 [{accountId, fullname, avatar}]
        //暂不支持 disabled: [], // 禁用的用户, 交互上不可选择 [{accountId}]
        //暂不支持 additions: ['user-self', ...], // 默认为空, 不支持额外选项
        // 全部支持项:
        // user-self: 自己
        // user-sub: 下属, 回调数据无头像
        // user-undefined: 未指定, 回调数据无头像
        // user-workflow: 工作流, 回调数据无头像
        // user-system: 系统, 回调数据无头像
        // user-publicform: 公开表单, 回调数据无头像
        // user-api: API, 回调数据无头像
        success: function (res) {
          // 最终选择结果, 完全替换已有数据
          var results = res.results.map(item => ({ ...item, fullname: item.name })); // [{accountId, fullname, avatar}]

          onChange(JSON.stringify(results));
        },
        cancel: function (res) {
          // 用户取消
        },
      });
      return;
    }
    setShowSelectUser(true);
  };

  const onSave = users => {
    const newAccounts = isUnique ? users : _.uniqBy(users, 'accountId');

    onChange(JSON.stringify(newAccounts));
  };

  const removeUser = accountId => {
    const newValue = selectUsers.filter(item => item.accountId !== accountId);
    onChange(JSON.stringify(newValue));
  };

  const renderItem = item => {
    return (
      <UserItemBox key={item.accountId} isUnique={isUnique} userHeadSize={userHeadSize} className="customFormCapsule">
        <img className="userHead" src={item.avatar} />
        <div className="userName">{item.name || item.fullname || item.fullName}</div>

        {!isUnique && !disabled && (
          <i className="icon-minus-square capsuleDel" onClick={() => removeUser(item.accountId)} />
        )}
      </UserItemBox>
    );
  };

  return (
    <div
      className={cx('customFormControlBox controlMinHeight customFormControlCapsuleBox', {
        controlEditReadonly: !formDisabled && !_.isEmpty(selectUsers) && disabled,
        controlDisabled: formDisabled,
        customFormControlNoBorder: !isUnique,
      })}
      onClick={isUnique ? pickUser : () => {}}
    >
      {isUnique ? (
        <div className="flexRow alignItemsCenter" style={{ width: '100%' }}>
          {!_.isEmpty(selectUsers) ? (
            <div className="flex ellipsis">{renderItem(selectUsers[0])}</div>
          ) : (
            <div className="flex Gray_bd">{_l('请选择')}</div>
          )}
          {!formDisabled && <i className="icon icon-arrow-right-border Font16 Gray_bd" />}
        </div>
      ) : (
        <Fragment>
          {selectUsers.map(item => renderItem(item))}
          {!disabled && (
            <div className="TxtCenter customFormAddBtn" onClick={pickUser}>
              <i className="icon-plus icon" />
            </div>
          )}
        </Fragment>
      )}

      {showSelectUser && (
        <SelectUser
          projectId={projectId}
          visible={true}
          type="user"
          userType={getTabTypeBySelectUser(props)}
          appId={appId || ''}
          selectRangeOptions={dealUserRange(props, formData, masterData)}
          onlyOne={isUnique}
          // filterAccountIds={filterAccountIds}
          onClose={() => setShowSelectUser(false)}
          onSave={onSave}
          selectedUsers={selectUsers}
        />
      )}
    </div>
  );
}

UserSelect.propTypes = {
  from: PropTypes.number,
  projectId: PropTypes.string,
  disabled: PropTypes.bool,
  formDisabled: PropTypes.bool,
  enumDefault: PropTypes.number,
  formData: PropTypes.array,
  appId: PropTypes.string,
  masterData: PropTypes.object,
  enumDefault2: PropTypes.number,
  advancedSetting: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default memo(UserSelect, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'formDisabled']),
    _.pick(nextProps, ['value', 'disabled', 'formDisabled']),
  );
});
