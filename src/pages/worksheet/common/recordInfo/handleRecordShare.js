import { getRowDetail } from 'worksheet/api';
import { getTitleTextFromControls } from 'src/utils/domain/control/display';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
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
  openShareDialog,
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
    alertIfNotUnauthorized(err, _l('分享失败'), 2);
    console.log(err);
  }
}
