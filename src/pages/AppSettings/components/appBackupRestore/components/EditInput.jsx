import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';

const EditInputCon = styled.div`
  display: flex;
  overflow: hidden;
  .backupFileName {
    display: inline-block;
    font-weight: 600;
  }
  .input {
    border: none;
    border-bottom: 2px solid #1677ff;
    padding: 4px 0;
  }
  .ant-input:focus,
  .ant-input-focused {
    box-shadow: unset;
  }
  .editIcon {
    display: inline-block;
    &.hidden {
      display: none !important;
    }
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
      {!canEdit && <span className="backupFileName ellipsis">{value}</span>}
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
