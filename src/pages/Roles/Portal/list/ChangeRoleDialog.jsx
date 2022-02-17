import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Dropdown, Dialog } from 'ming-ui';
import cx from 'classnames';
const ChangeRoleDialogWrap = styled.div`
  display: flex;
  & > span {
    line-height: 36px;
    margin-right: 16px;
  }
  .Dropdown--input {
    border-radius: 3px;
    background: #ffffff;
    border: 1px solid #e6e6e6;
    display: flex;
    line-height: 36px;
    padding: 0 10px !important;
    .value {
      flex: 1;
      max-width: 100% !important;
    }
    .Dropdown--placeholder {
      flex: 1;
    }
    i {
      &::before {
        line-height: 36px;
      }
    }
  }
`;
export default function ChangeRoleDialog(props) {
  const { setChangeRoleDialog, changeRoleDialog, roleList = [], title } = props;
  const [roleId, setRoleId] = useState('');
  useEffect(() => {
    setRoleId((roleList.find(o => o.isDefault) || {}).roleId);
  }, [roleList]);
  return (
    <Dialog
      title={title || _l('选择角色')}
      okText={_l('确认')}
      cancelText={_l('取消')}
      className="changeRoleDialog"
      headerClass="changeRoleDialogTitle"
      bodyClass="changeRoleDialogCon"
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
      visible={changeRoleDialog}
      updateTrigger="fasle"
    >
      <ChangeRoleDialogWrap>
        <span className="">{_l('角色')}</span>
        <Dropdown
          isAppendToBody
          placeholder={_l('请选择角色')}
          data={roleList.map(o => {
            return { ...o, value: o.roleId, text: o.name };
          })}
          value={roleId}
          className={cx('flex InlineBlock topActDrop mLeft16')}
          onChange={newValue => {
            setRoleId(newValue);
          }}
        />
      </ChangeRoleDialogWrap>
    </Dialog>
  );
}
