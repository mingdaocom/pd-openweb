import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { Dropdown, Tooltip } from 'ming-ui/antd-components';
import IconBtn from '../IconBtn';
import useRecordPrintMenuItems, { PRINT_MENU_STYLE } from './useRecordPrintMenuItems';

const PRINT_DROPDOWN_TRIGGER = ['click'];

export default function RecordPrintButton(props) {
  const { items, holder, loadPrintList, loadPrintCount, hasPrintTemplates } = useRecordPrintMenuItems({
    ...props,
    enabled: true,
    mode: 'toolbar',
  });
  const handleOpenChange = useCallback(
    open => {
      if (open) {
        loadPrintList().then(templates => templates && loadPrintCount({ force: true, templates }));
      }
    },
    [loadPrintCount, loadPrintList],
  );

  if (!hasPrintTemplates) {
    return null;
  }

  return (
    <React.Fragment>
      {holder}
      <Dropdown
        trigger={PRINT_DROPDOWN_TRIGGER}
        placement="topRight"
        autoAdjustOverflow
        menu={{ items, selectable: false, style: PRINT_MENU_STYLE }}
        onOpenChange={handleOpenChange}
      >
        <IconBtn className="hoverColorPrimary">
          <Tooltip title={_l('打印')} placement="bottom">
            <Icon icon="print" className="Font22 Hand" />
          </Tooltip>
        </IconBtn>
      </Dropdown>
    </React.Fragment>
  );
}

RecordPrintButton.propTypes = {
  appId: PropTypes.string,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  instanceId: PropTypes.string,
  isCharge: PropTypes.bool,
  printCountEnabled: PropTypes.bool,
  projectId: PropTypes.string,
  recordId: PropTypes.string,
  showDownload: PropTypes.bool,
  viewId: PropTypes.string,
  workId: PropTypes.string,
  worksheetId: PropTypes.string,
};
