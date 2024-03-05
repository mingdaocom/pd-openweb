import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { Icon } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import styled from 'styled-components';

const EditInputCon = styled.div`
  display: flex;
  overflow: hidden;
  .backupFileName {
    display: inline-block;
    font-weight: 600;
    max-width: 240px;
  }
  .input {
    width: 212px;
    border: none;
    border-bottom: 2px solid #2196f3;
    padding: 4px 0;
    margin-bottom: 10px;
  }
  .ant-input:focus,
  .ant-input-focused {
    box-shadow: unset;
  }
  .editIcon {
    margin-left: 20;
    display: inline-block;
    width: 100px;
  }
`;

export default function EditInput(props) {
  const { actCurrentFileInfo = {}, projectId, appId } = props;
  const [canEdit, setCanEdit] = useState(false);
  const [value, setValue] = useState(actCurrentFileInfo.backupFileName || '');

  useEffect(() => {
    setValue(actCurrentFileInfo.backupFileName);
  }, [actCurrentFileInfo]);

  return (
    <EditInputCon>
      {!canEdit && <span className="backupFileName mBottom15">{value}</span>}
      {canEdit && (
        <Input
          className="input flex"
          value={value}
          onChange={e => {
            let value = e.target.value.trim();
            setValue(value);
          }}
          onBlur={() => {
            $('.editIcon').removeClass('hidden');
            setCanEdit(false);
            if (!value) return setValue(actCurrentFileInfo.backupFileName);
            if (value === actCurrentFileInfo.backupFileName) return;
            appManagementAjax
              .renameBackupFileName({
                projectId,
                appId,
                id: actCurrentFileInfo.id,
                fileName: value,
                fileOldName: actCurrentFileInfo.backupFileName,
              })
              .then(res => {
                if (res) {
                  alert(_l('修改成功'));
                  setValue(value);
                  props.updateFileList({ ...actCurrentFileInfo, backupFileName: value });
                } else {
                  alert(_l('修改失败'), 2);
                  setValue(actCurrentFileInfo.backupFileName);
                }
              });
          }}
          onFocus={() => {
            $('.editIcon').addClass('hidden');
          }}
        />
      )}
      <span
        className="editIcon"
        onClick={e => {
          setTimeout(() => {
            $('.input').focus();
          }, 50);
          e.stopPropagation();
          setCanEdit(true);
          $('.editIcon').addClass('hidden');
        }}
      >
        <Icon icon="edit" className="Hand mLeft4 iconEdit Gray_9e" />
      </span>
    </EditInputCon>
  );
}
