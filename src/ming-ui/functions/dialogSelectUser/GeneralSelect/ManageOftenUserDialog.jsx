import React, { forwardRef, Fragment, useEffect, useImperativeHandle, useRef, useState } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv, SortableList } from 'ming-ui';
import { Modal, Radio } from 'ming-ui/antd-components';
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
    border-top: ${({ $activeBorder }) =>
      $activeBorder ? 'var(--color-border-tertiary)' : '1px solid var(--color-border-tertiary)'};
    border-bottom: ${({ $activeBorder }) => ($activeBorder ? 'var(--color-border-tertiary)' : 'none')};
    .empty {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
      text-align: center;
    }
  }
`;

const OftenUserItem = styled.li`
  width: 100%;
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
      background: var(--color-background-hover);
    }
  }
`;

const MODAL_STYLES = {
  body: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
};

const ManageOftenUserContent = forwardRef(function ManageOftenUserContent(props, ref) {
  const { userOptions, onOk = () => {}, dialogSelectUser } = props;

  const [type, setType] = useState(0);
  const [clearFlag, setClearFlag] = useState(false);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrag, setIsDrag] = useState(false);

  useEffect(() => {
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
  }, []);

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
  };

  useImperativeHandle(ref, () => ({ onSave }));

  const renderUserItem = options => {
    return (
      <OftenUserItem className="valignWrapper">
        <Icon icon="drag" className="Font14 Hand textTertiary hoverColorPrimary dragIcon" />
        <div className="flex userItemBox overflow_ellipsis">
          <User
            {...userOptions}
            hideChecked={true}
            disabled={true}
            user={options.item}
            key={'manageOftenUser' + options.item.accountId}
          />
        </div>
        <span
          className="textTertiary removeBtn Hand hoverColorPrimary"
          onClick={() => onRemove(options.item.accountId)}
        >
          {_l('移除')}
        </span>
      </OftenUserItem>
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

    if (clearFlag && !list.length) return <div className="empty textTertiary Font14">{_l('暂无最常协作人员')}</div>;

    return (
      <ul className="GSelect-box">
        <SortableList
          renderBody
          helperClass="GSelect-box"
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
    <Wrap $activeBorder={isDrag}>
      <Radio.Group
        size="middle"
        className="mBottom16"
        value={type}
        options={(OFTEN_USER_OPTIONS || []).map(({ text, ...option }) => ({ ...option, label: text }))}
        onChange={event => setType(event.target.value)}
      />

      <div className="textSecondary mBottom20 Font14">
        {type === 0
          ? _l('最近一段时间与您互动频率较高的用户自动显示在最常协作中')
          : _l('自定义最常协作人员，在组织下查看最常协作时，只显示当前组织下的人员')}
      </div>

      {type === 1 && (
        <Fragment>
          <div className="Font14 valignWrapper actionWrap">
            <span className="colorPrimary flex Hand" onClick={onAdd}>
              <Icon icon="add" className="mRight6" />
              {_l('添加人员')}
            </span>
            <span className="textTertiary Hand mRight25 hoverColorPrimary" onClick={onClear}>
              {_l('清空')}
            </span>
          </div>
          <div className="contentWrap">{renderUserList()}</div>
        </Fragment>
      )}
    </Wrap>
  );
});

function ManageOftenUserDialog(props) {
  const { visible, onClose = () => {}, ...contentProps } = props;
  const contentRef = useRef(null);

  return (
    <Modal
      open={visible}
      width={640}
      title={_l('管理最常协作人员')}
      okText={_l('保存')}
      styles={MODAL_STYLES}
      onOk={() => {
        contentRef.current?.onSave();
        onClose();
      }}
      onCancel={onClose}
    >
      <ManageOftenUserContent ref={contentRef} {...contentProps} />
    </Modal>
  );
}

export default ManageOftenUserDialog;

export const openManageOftenUserDialog = props => {
  const contentRef = React.createRef();

  return Modal.info({
    content: <ManageOftenUserContent ref={contentRef} {...props} />,
    okCancel: true,
    okText: _l('保存'),
    onCancel: props.onClose,
    onOk: () => contentRef.current?.onSave(),
    styles: MODAL_STYLES,
    title: _l('管理最常协作人员'),
    width: 640,
  });
};
