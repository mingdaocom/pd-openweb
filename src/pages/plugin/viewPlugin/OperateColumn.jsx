import React, { useState, useRef } from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Input } from 'antd';
import { Icon, Dialog } from 'ming-ui';
import pluginApi from 'src/api/plugin';
import { verifyPassword } from 'src/util';

const OperateMenu = styled.div`
  position: relative !important;
  width: 220px !important;
  padding: 6px 0 !important;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  background: #fff;
`;
const MenuItem = styled.div`
  padding: 0 20px;
  line-height: 36px;
  cursor: pointer;
  color: #f44336;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ConfirmDialog = styled(Dialog)`
  .mui-dialog-desc {
    padding-top: 8px !important;
    font-size: 13px;
  }
  .passwordInput {
    box-shadow: none !important;
    line-height: 28px !important;
    border-radius: 3px !important;
    border: 1px solid #ccc !important;
    padding: 3px 10px !important;
    &.ant-input-affix-wrapper-focused {
      border-color: #2196f3 !important;
    }
  }
`;

export default function OperateColumn(props) {
  const { pluginId, source, onDeleteSuccess, projectId } = props;
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [needVerifyPwd, setNeedVerifyPwd] = useState(false);
  const pwdRef = useRef();

  const onRemove = () => {
    pluginApi.remove({ id: pluginId, source }).then(res => {
      if (res) {
        alert(_l('删除成功'));
        setConfirmVisible(false);
        onDeleteSuccess();
      }
    });
  };

  const onDelete = () => {
    needVerifyPwd
      ? verifyPassword({
          password: pwdRef.current.input.value,
          success: () => onRemove(),
        })
      : onRemove();
  };

  return (
    <React.Fragment>
      <Trigger
        action={['click']}
        popupClassName="moreOption"
        getPopupContainer={() => document.body}
        popupVisible={visible}
        onPopupVisibleChange={visible => setVisible(visible)}
        popupAlign={{
          points: ['tr', 'bl'],
          offset: [25, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
        popup={
          <OperateMenu>
            <MenuItem
              onClick={e => {
                e.stopPropagation();
                setVisible(false);
                setConfirmVisible(true);
                verifyPassword({
                  projectId,
                  checkNeedAuth: true,
                  customActionName: 'checkAccount',
                  ignoreAlert: true,
                  success: () => setNeedVerifyPwd(false),
                  fail: () => setNeedVerifyPwd(true),
                });
              }}
            >
              {_l('删除')}
            </MenuItem>
          </OperateMenu>
        }
      >
        <div className="operateIcon" onClick={e => e.stopPropagation()}>
          <Icon icon="moreop" className="Font18 pointer" />
        </div>
      </Trigger>
      <ConfirmDialog
        width={480}
        visible={confirmVisible}
        title={_l('删除插件')}
        description={_l('删除后，使用该插件的视图将无法使用')}
        buttonType="danger"
        onOk={onDelete}
        onCancel={() => setConfirmVisible(false)}
      >
        {needVerifyPwd && (
          <React.Fragment>
            <p className="mBottom10 Gray">{_l('请输入登录密码')}</p>
            <div style={{ height: '0px', overflow: 'hidden' }}>
              // 用来避免浏览器将用户名塞到其它input里
              <input type="text" />
            </div>
            <Input.Password
              ref={pwdRef}
              autoFocus={true}
              autocomplete="new-password"
              className="passwordInput"
              placeholder={_l('请输入密码确认授权')}
            />
          </React.Fragment>
        )}
      </ConfirmDialog>
    </React.Fragment>
  );
}
