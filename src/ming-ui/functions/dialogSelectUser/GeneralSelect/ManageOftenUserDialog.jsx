import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Dialog, FunctionWrap, Icon, LoadDiv, RadioGroup, SortableList } from 'ming-ui';
import accountSettingAjax from 'src/api/accountSetting';
import addressBookAjax from 'src/api/addressBook';
import userAjax from 'src/api/user';
import { MAX_OFTEN_USERS, OFTEN_USER_OPTIONS } from './constant';
import User from './User';

const Wrap = styled.div`
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  .actionWrap {
    padding-bottom: 12px;
  }
  .contentWrap {
    height: 390px;
    position: relative;
    overflow-y: scroll;
    border-top: ${({ activeBorder }) => (activeBorder ? '1px solid rgba(253 ,180,50 ,0.3)' : '1px solid #eaeaea')};
    border-bottom: ${({ activeBorder }) => (activeBorder ? '1px solid rgba(253 ,180,50 ,0.3)' : 'none')};
    .empty {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
      text-align: center;
    }
    ul {
      li {
        .userItemBox {
          flex: 1;
          width: 100%;
          .GSelect-User__fullname {
            flex: 1;
            width: auto;
          }
          .GSelect-User__companyName {
            flex: 2;
            width: auto;
          }
        }
        .removeBtn {
          line-height: 40px;
          padding-right: 15px;
        }
        &:hover {
          .userItemBox,
          .removeBtn {
            background: #f5f5f5;
          }
        }
      }
    }
  }
`;

const OftenUserDialog = styled(Dialog)`
  .manageOftenUserDialog {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
`;

function ManageOftenUserDialog(props) {
  const { visible, userOptions, onOk = () => {}, onClose = () => {}, dialogSelectUser } = props;

  const [type, setType] = useState(0);
  const [clearFlag, setClearFlag] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  useEffect(() => {
    if (!visible) return;

    getData();
  }, [visible]);

  const getData = () => {
    setLoading(true);
    userAjax
      .getOftenMetionedUser({
        count: MAX_OFTEN_USERS,
        projectId: '',
        includeUndefinedAndMySelf: false,
      })
      .then(res => {
        setLoading(false);
        setList(res);
      });
    accountSettingAjax.getAccountSettings().then(({ addressBookOftenMetioned }) => {
      setType(addressBookOftenMetioned);
    });
  };

  const onClear = () => {
    setList([]);
    !clearFlag && setClearFlag(true);
    alert(_l('清空成功，保存后生效'));
  };

  const onSortEnd = newItems => {
    setIsDrag(false);
    setList(newItems);
  };

  const onAdd = () => {
    dialogSelectUser({
      SelectUserSettings: {
        projectId: userOptions.projectId,
        filterAccountIds: [md.global.Account.accountId],
        hideOftenUsers: true,
        hideManageOftenUsers: true,
        selectedAccountIds: list.map(l => l.accountId),
        callback: users => {
          const data = list.concat(users);

          if (data.length > 50) alert(_l('最多可选择%0个最常协作人', MAX_OFTEN_USERS), 3);
          setList(data.slice(0, 50));
        },
      },
    });
  };

  const onRemove = accountId => setList(list.filter(l => l.accountId !== accountId));

  const onSave = () => {
    Promise.all([
      accountSettingAjax.editAccountSetting({ settingType: 22, settingValue: type }),
      addressBookAjax.editAddressBookOftenMetioned({ accountIds: list.map(l => l.accountId) }),
    ]).then(() => {
      onOk(type);
    });

    onClose();
  };

  const renderUserItem = options => {
    return (
      <li className="valignWrapper">
        <Icon icon="drag" className="Font14 Hand Gray_9e Hover_21 dragIcon" />
        <div className="flex userItemBox overflow_ellipsis">
          <User
            {...userOptions}
            hideChecked={true}
            disabled={true}
            user={options.item}
            key={'manageOftenUser' + options.item.accountId}
          />
        </div>
        <span className="Gray_9e removeBtn Hand Hover_21" onClick={() => onRemove(options.item.accountId)}>
          {_l('移除')}
        </span>
      </li>
    );
  };

  const renderUserList = () => {
    if (loading) {
      return (
        <div className="empty">
          <LoadDiv />
        </div>
      );
    }

    if (clearFlag && !list.length) return <div className="empty Gray_9e Font14">{_l('暂无最常协作人员')}</div>;

    return (
      <ul className="GSelect-box">
        <SortableList
          items={list}
          itemKey="accountId"
          onSortEnd={newItems => onSortEnd(newItems)}
          renderItem={renderUserItem}
          moveItem={() => setIsDrag(true)}
        />
      </ul>
    );
  };

  return (
    <OftenUserDialog
      bodyClass="manageOftenUserDialog"
      width={640}
      zIndex={10002}
      visible={visible}
      title={_l('管理最常协作人员')}
      okText={_l('保存')}
      onOk={onSave}
      onCancel={onClose}
    >
      <Wrap activeBorder={isDrag}>
        <RadioGroup
          size="middle"
          className="mBottom16"
          checkedValue={type}
          data={OFTEN_USER_OPTIONS}
          onChange={value => setType(value)}
        />

        <div className="Gray_75 mBottom20 Font14">
          {type === 0
            ? _l('最近一段时间与您互动频率较高的用户自动显示在最常协作中')
            : _l('自定义最常协作人员，在组织下查看最常协作时，只显示当前组织下的人员')}
        </div>

        {type === 1 && (
          <Fragment>
            <div className="Font14 valignWrapper actionWrap">
              <span className="ThemeColor flex Hand" onClick={onAdd}>
                <Icon icon="add" className="mRight6" />
                {_l('添加人员')}
              </span>
              <span className="Gray_9e Hand mRight25 Hover_21" onClick={onClear}>
                {_l('清空')}
              </span>
            </div>
            <div className="contentWrap">{renderUserList()}</div>
          </Fragment>
        )}
      </Wrap>
    </OftenUserDialog>
  );
}

export default ManageOftenUserDialog;

export const openManageOftenUserDialog = props => {
  FunctionWrap(ManageOftenUserDialog, { ...props });
};
