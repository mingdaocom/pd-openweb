import React, { Fragment } from 'react';
import { Tooltip } from 'ming-ui/antd-components';

export const getImportMenuItems = ({
  isCharge,
  allowAdd,
  controls = [],
  projectId,
  appId,
  worksheetId,
  viewId,
  worksheetName,
  onMenuClick = () => {},
  renderMenuLabel = text => text,
  itemStyle,
  importDataFromExcel,
  importAttachmentsDialog,
}) => {
  const hasAttachmentControl = controls.some(control => control.type === 14);

  return [
    allowAdd && {
      key: 'importExcel',
      style: itemStyle,
      label: renderMenuLabel(_l('导入 Excel')),
      onClick: () => {
        onMenuClick();
        importDataFromExcel({ isCharge, appId, worksheetId, worksheetName });
      },
    },
    {
      key: 'importAttachments',
      disabled: !hasAttachmentControl,
      style: itemStyle,
      label: hasAttachmentControl ? (
        renderMenuLabel(_l('导入附件'))
      ) : (
        <Tooltip
          placement="bottom"
          title={
            <Fragment>
              <div>{_l('表单中缺少附件类型字段，无法导入附件。')}</div>
              <div>{_l('请联系应用管理员配置附件字段。')}</div>
            </Fragment>
          }
        >
          <span>{_l('导入附件')}</span>
        </Tooltip>
      ),
      onClick: () => {
        onMenuClick();
        importAttachmentsDialog({ controls, projectId, appId, worksheetId, viewId, allowAdd });
      },
    },
  ].filter(Boolean);
};
