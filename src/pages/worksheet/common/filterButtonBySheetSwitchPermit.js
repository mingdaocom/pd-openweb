import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';

export function filterButtonBySheetSwitchPermit(
  buttons = [],
  sheetSwitchPermit,
  viewId,
  row = {
    allowedit: true,
    allowdelete: true,
  },
) {
  return (buttons = buttons.filter(button => {
    if (button.type === 'delete') {
      return isOpenPermit(permitList.recordDelete, sheetSwitchPermit, viewId) && row.allowdelete;
    } else if (button.type === 'share') {
      return (
        (isOpenPermit(permitList.recordShareSwitch, sheetSwitchPermit, viewId) ||
          isOpenPermit(permitList.embeddedLink, sheetSwitchPermit, viewId)) &&
        !md.global.Account.isPortal
      );
    } else if (button.type === 'copy') {
      return isOpenPermit(permitList.recordCopySwitch, sheetSwitchPermit, viewId) && row.allowedit;
    } else if (button.type === 'sysprint') {
      return isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId);
    }

    return true;
  }));
}
