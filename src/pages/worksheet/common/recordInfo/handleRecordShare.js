import { getRowDetail } from 'worksheet/api';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils.js';
import { openShareDialog } from 'src/pages/worksheet/components/Share';
import { isOwner } from './crtl';

export async function handleShare({
  isCharge,
  appId,
  worksheetId,
  viewId,
  recordId,
  hidePublicShare,
  privateShare = true,
  title,
  ...rest
}) {
  try {
    const row = await getRowDetail({ appId, worksheetId, viewId, rowId: recordId });
    let recordTitle = getTitleTextFromControls(row.formData);
    let allowChange = isCharge || isOwner(row.ownerAccount, row.formData);
    let shareRange = row.shareRange;
    openShareDialog({
      ...rest,
      from: 'recordInfo',
      title: title || _l('分享记录'),
      isPublic: shareRange === 2,
      isCharge: allowChange,
      hidePublicShare,
      privateShare,
      params: {
        appId,
        worksheetId,
        viewId,
        rowId: recordId,
        title: recordTitle,
      },
      getCopyContent: (type, url) => `${url} ${row.entityName}：${recordTitle}`,
    });
  } catch (err) {
    alert(_l('分享失败'), 2);
    console.log(err);
  }
}
