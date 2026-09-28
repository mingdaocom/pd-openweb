import React, { useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, VerifyPasswordInput } from 'ming-ui';
import { Button, Modal, Popover } from 'ming-ui/antd-components';
import verifyPassword from 'ming-ui/functions/verifyPassword';
import ProductLicenseInfo from 'src/components/productLicenseInfo';
import { API_EXTENDS, PLUGIN_TYPE, pluginApiConfig } from '../config';

const OperateMenu = styled.div`
  position: relative !important;
  width: 220px !important;
  padding: 6px 0 !important;
`;
const MenuItem = styled.div`
  padding: 0 20px;
  line-height: 36px;
  cursor: pointer;
  &.isDel {
    color: var(--color-error);
  }
  &:hover {
    background-color: var(--color-background-hover);
  }
`;

const ConfirmDialog = styled(Modal)`
  .passwordInput {
    box-shadow: none !important;
    line-height: 28px !important;
    border-radius: 3px !important;
    border: 1px solid var(--color-border-tertiary) !important;
    padding: 3px 10px !important;
    &.hap-input-affix-wrapper-focused {
      border-color: var(--color-primary) !important;
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
      <Popover
        noPadding
        trigger="click"
        getPopupContainer={() => document.body}
        open={visible}
        onOpenChange={setVisible}
        align={{
          points: ['tr', 'bl'],
          offset: [25, 5],
          overflow: { adjustX: true, adjustY: true },
        }}
        content={
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
      </Popover>
      <ConfirmDialog
        width={480}
        open={confirmVisible}
        title={_l('删除插件')}
        onCancel={() => setConfirmVisible(false)}
        footer={
          <div>
            <Button color="primary" variant="link" onClick={() => setConfirmVisible(false)}>
              {_l('取消')}
            </Button>
            <Button color="danger" variant="solid" onClick={onDelete} data-id="confirmBtn">
              {_l('确认')}
            </Button>
          </div>
        }
      >
        <div className="Font13 textSecondary mBottom15">
          {pluginType === PLUGIN_TYPE.WORKFLOW
            ? _l('删除后，使用该插件的工作流将无法使用')
            : _l('删除后，使用该插件的视图将无法使用')}
        </div>
        {needVerifyPwd && <VerifyPasswordInput onChange={({ password }) => setPassword(password)} />}
      </ConfirmDialog>
    </div>
  );
}
