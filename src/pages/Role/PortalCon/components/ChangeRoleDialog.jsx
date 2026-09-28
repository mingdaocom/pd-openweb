import React, { useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Modal, Select } from 'ming-ui/antd-components';
import { getTranslateInfo } from 'src/utils/services/app';

const ChangeRoleDialogWrap = styled.div`
  display: flex;
  & > span {
    line-height: 36px;
    margin-right: 16px;
  }
  .topActDrop {
    flex-shrink: 0;
    min-width: 0;
  }
`;

export default function ChangeRoleDialog(props) {
  const { appId, setChangeRoleDialog, changeRoleDialog, roleList = [], title } = props;
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const defaultRoleId = (roleList.find(o => o.isDefault) || {}).roleId;
  const roleId = roleList.some(o => o.roleId === selectedRoleId) ? selectedRoleId : defaultRoleId;
  return (
    <Modal
      title={title || _l('选择角色')}
      okText={_l('确认')}
      cancelText={_l('取消')}
      className="changeRoleDialog"
      onCancel={() => {
        setChangeRoleDialog(false);
      }}
      onOk={() => {
        if (!roleId) {
          alert(_l('请选择角色'), 3);
          return;
        }

        props.onOk(roleId);
        setChangeRoleDialog(false);
      }}
      open={changeRoleDialog}
    >
      <ChangeRoleDialogWrap>
        <span className="">{_l('角色')}</span>
        <Select
          placeholder={_l('请选择角色')}
          options={roleList.map(o => {
            return { ...o, value: o.roleId, label: getTranslateInfo(appId, null, o.roleId).name || o.name };
          })}
          value={roleId}
          className={cx('flex topActDrop mLeft16')}
          onChange={newValue => {
            setSelectedRoleId(newValue);
          }}
        />
      </ChangeRoleDialogWrap>
    </Modal>
  );
}
