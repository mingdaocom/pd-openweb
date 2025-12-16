import React, { Fragment, memo } from 'react';
import { useSetState } from 'react-use';
import { Popup } from 'antd-mobile';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, MobilePersonalInfo } from 'ming-ui';
import { selectUser } from 'src/pages/Mobile/components/SelectUser';
import { updateRecordOwner } from 'src/pages/worksheet/common/recordInfo/crtl.js';
import { compatibleMDJS } from 'src/utils/project';

const OwnerOptionPopup = styled(Popup)`
  .ownerOptionBody {
    padding: 13px 15px;
    border-radius: 12px 12px 0 0;

    .headerBox {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      .popupOwnerText {
        font-size: 13px;
        color: var(--color-text-tertiary);
      }

      .closeIconBox {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: var(--color-background-tertiary);
        color: var(--color-text-tertiary);
        font-size: 13px;
      }
    }
    .optionBox {
      padding-bottom: 24px;
      .optionItem {
        font-size: 15px;
        font-weight: 600;
        color: var(--color-text-primary);
      }
      .optionItem + .optionItem {
        margin-top: 24px;
      }
    }
  }
`;

const RecordOwner = props => {
  const {
    projectId,
    appId,
    worksheetId,
    recordId,
    ownerEditable,
    isRecordLock,
    ownerAccount = {},
    entityName,
    updateRecordDialogOwner,
  } = props;
  const ownerText = _l('拥有者：%0', ownerAccount.fullname);
  const [{ personalInfoVisible, ownerOptionVisible }, setState] = useSetState({
    personalInfoVisible: false,
    ownerOptionVisible: false,
  });

  const switchPersonalInfoPopup = bool => {
    setState({
      personalInfoVisible: bool,
    });
  };

  const switchOwnerOptionPopup = bool => {
    setState({
      ownerOptionVisible: bool,
    });
  };

  const handleUpdateOwner = async users => {
    try {
      const { account, record } = await updateRecordOwner({
        worksheetId,
        recordId,
        accountId:
          users[0].accountId === 'user-self' ? _.get(md, ['global', 'Account', 'accountId']) : users[0].accountId,
      });
      updateRecordDialogOwner(account, record);
      alert(_l('修改成功'));
    } catch (err) {
      if (err && err.resultCode === 72) {
        alert(_l('%0已锁定，修改失败', entityName), 3);
        return;
      }
      console.log(err);
      alert(_l('修改失败'), 2);
    }
  };

  const clickOwner = () => {
    // 拥有者为未指定
    if (ownerAccount.accountId === 'user-undefined') {
      changeOwner();
      return;
    }
    // 有权限且记录为锁定，需要弹出选择层选择操作
    if (ownerEditable && !isRecordLock) {
      switchOwnerOptionPopup(true);
      return;
    }
    // 无修改权限，只能查看拥有者信息
    switchPersonalInfoPopup(true);
  };

  const changeOwner = () => {
    compatibleMDJS(
      'chooseUsers',
      {
        projectId, // 网络ID, 默认为空, 不限制
        count: 1, // 默认为空, 不限制数量
        selected: [],
        success: function (res) {
          // 最终选择结果, 完全替换已有数据
          if (_.isEmpty(res.results)) {
            return;
          }
          handleUpdateOwner(res.results);
        },
        cancel: function () {
          // 用户取消
        },
      },
      () => {
        selectUser({
          type: 'user',
          projectId,
          appId,
          onlyOne: true,
          hideClearBtn: true,
          userType: 3,
          filterAccountIds: [ownerAccount.accountId],
          includeUndefinedAndMySelf: true,
          onSave: users => handleUpdateOwner(users),
        });
      },
    );
  };

  return (
    <Fragment>
      <div className="owner sheetName bold mLeft6" onClick={clickOwner}>
        <span className="ellipsis">{ownerText}</span>
      </div>
      {personalInfoVisible && (
        <MobilePersonalInfo
          visible={personalInfoVisible}
          accountId={ownerAccount.accountId}
          appId={appId}
          projectId={projectId}
          onClose={() => switchPersonalInfoPopup(false)}
        />
      )}
      {ownerEditable && !isRecordLock && (
        <OwnerOptionPopup
          className="mobileModal"
          bodyClassName="ownerOptionBody"
          visible={ownerOptionVisible}
          onMaskClick={() => switchOwnerOptionPopup(false)}
        >
          <div className="headerBox">
            <div className="popupOwnerText">{ownerText}</div>
            <div className="closeIconBox">
              <Icon icon="close" onClick={() => switchOwnerOptionPopup(false)} />
            </div>
          </div>
          <div className="optionBox">
            <div className="optionItem" onClick={changeOwner}>
              {_l('更改拥有者')}
            </div>
            <div className="optionItem" onClick={() => switchPersonalInfoPopup(true)}>
              {_l('查看个人资料')}
            </div>
          </div>
        </OwnerOptionPopup>
      )}
    </Fragment>
  );
};

export default memo(RecordOwner);
