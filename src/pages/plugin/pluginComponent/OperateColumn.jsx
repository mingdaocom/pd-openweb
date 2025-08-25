import React, { useState } from 'react';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Icon, VerifyPasswordInput } from 'ming-ui';
import ProductLicenseInfo from 'src/components/productLicenseInfo';
import verifyPassword from 'src/components/verifyPassword';
import { API_EXTENDS, PLUGIN_TYPE, pluginApiConfig } from '../config';

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
  &.isDel {
    color: #f44336;
  }
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
      border-color: #1677ff !important;
    }
  }
`;

export default function OperateColumn(props) {
  const { pluginId, source, onDeleteSuccess, projectId, pluginType, license = {} } = props;
  const [visible, setVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [needVerifyPwd, setNeedVerifyPwd] = useState(false);
  const [password, setPassword] = useState('');

  const pluginApi = pluginApiConfig[pluginType];

  const onRemove = () => {
    pluginApi.remove({ id: pluginId, source }, API_EXTENDS).then(res => {
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
          password,
          success: () => onRemove(),
        })
      : onRemove();
  };

  return (
    <div onClick={e => e.stopPropagation()}>
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
            {pluginType === 'view' && !_.isEmpty(license) && (
              <ProductLicenseInfo popupAlign={{ points: ['tr', 'tl'], offset: [-305, -139] }} license={license}>
                <MenuItem>{_l('订购计划')}</MenuItem>
              </ProductLicenseInfo>
            )}
            <MenuItem
              className="isDel"
              onClick={() => {
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
        description={
          pluginType === PLUGIN_TYPE.WORKFLOW
            ? _l('删除后，使用该插件的工作流将无法使用')
            : _l('删除后，使用该插件的视图将无法使用')
        }
        buttonType="danger"
        onOk={onDelete}
        onCancel={() => setConfirmVisible(false)}
      >
        {needVerifyPwd && <VerifyPasswordInput onChange={({ password }) => setPassword(password)} />}
      </ConfirmDialog>
    </div>
  );
}
