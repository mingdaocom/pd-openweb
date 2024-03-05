import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import AppAjax from 'src/api/appManagement';

import cx from 'classnames';
const CopyDialogWrap = styled.div`
  .title {
    line-height: 36px;
  }
  input {
    height: 36px;
    background: #ffffff;
    border: 1px solid #e6e6e6;
    padding: 6px;
  }
`;
export default function CopyRoleDialog(props) {
  const { copyData, setCopyData, updataRoleData, appId, editType } = props;
  const { name, roleId } = copyData || {};
  const [roleName, setRoleName] = useState(name + _l('-复制'));
  const inputRef = useRef(null);
  useEffect(() => {
    if (inputRef && inputRef.current) {
      $(inputRef.current).select().focus();
    }
  }, []);
  return (
    <Dialog
      title={_l('复制角色“%0”', name)}
      className={cx('')}
      headerClass=""
      bodyClass=""
      onCancel={() => {
        setCopyData(null);
      }}
      onOk={() => {
        if (!roleName.trim()) {
          return alert(_l('请输入角色名称！'), 3);
        }
        AppAjax.copyRole({
          appId,
          roleId,
          roleName: roleName.trim(),
          copyPortalRole: editType === 1 ? true : false,
        }).then(res => {
          if (res.resultCode === 1) {
            updataRoleData(res.roleId);
          } else if (res.resultCode === 2) {
            alert(_l('角色名称重复，请重新命名'), 3);
          } else {
            alert(_l('复制失败'), 2);
          }
        });
        setCopyData(null);
      }}
      visible={!!copyData}
      updateTrigger="fasle"
    >
      <CopyDialogWrap>
        <p className="Gray_75">{_l('将复制目标角色的权限设置和描述。角色下的成员不会被复制')}</p>
        <div className="roleInput flexRow">
          <span className="title Gray_75">{_l('角色')}</span>
          <input
            className="flex mLeft16"
            value={roleName}
            ref={inputRef}
            onChange={e => {
              setRoleName(e.target.value);
            }}
          />
        </div>
      </CopyDialogWrap>
    </Dialog>
  );
}
