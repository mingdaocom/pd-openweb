import _ from 'lodash';
import { VIEW_CONFIG_RECORD_CLICK_ACTION } from 'src/utils/domain/worksheet/constants';

/** 打开记录中指定链接控件保存的合法外部地址。 */
function openLinkFromRecord(linkControlId, record = {}) {
  if (!linkControlId) return;

  const link = record[linkControlId];

  if (link && /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(link.replace(/\? /, ''))) {
    window.open(link);
  }
}

/** 根据视图点击行为打开记录详情或记录中的链接。 */
export const handleRecordClick = (view, row, openRecord = () => {}) => {
  const clickType = _.get(view, 'advancedSetting.clicktype') || VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_RECORD;

  if (clickType === VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_RECORD) {
    openRecord();
  } else if (clickType === VIEW_CONFIG_RECORD_CLICK_ACTION.OPEN_LINK) {
    openLinkFromRecord(_.get(view, 'advancedSetting.clickcid'), row);
  }
};
