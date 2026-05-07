import React, { Fragment } from 'react';
import { Menu, MenuItem } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { importAttachmentsDialog } from '../WorksheetBody/ImportAttachments';
import { importDataFromExcel } from '../WorksheetBody/ImportDataFromExcel';

export default function ImportMenu(props) {
  const {
    isCharge,
    allowAdd,
    controls,
    projectId,
    appId,
    worksheetId,
    viewId,
    worksheetName,
    onMenuClick = () => {},
    className = '',
  } = props;

  return (
    <Menu className={className}>
      {allowAdd && (
        <MenuItem
          data-event="importExcel"
          onClick={() => {
            onMenuClick();
            importDataFromExcel({ isCharge, appId, worksheetId, worksheetName });
          }}
        >
          {_l('导入 Excel')}
        </MenuItem>
      )}
      {controls.some(control => control.type === 14) ? (
        <MenuItem
          data-event="importAttachments"
          disabled={!controls.some(control => control.type === 14)}
          onClick={() => {
            onMenuClick();
            importAttachmentsDialog({ controls, projectId, appId, worksheetId, viewId, allowAdd });
          }}
        >
          {_l('导入附件')}
        </MenuItem>
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
          <MenuItem data-event="importAttachments" disabled>
            {_l('导入附件')}
          </MenuItem>
        </Tooltip>
      )}
    </Menu>
  );
}
