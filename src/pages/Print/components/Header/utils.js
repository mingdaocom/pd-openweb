import axios from 'axios';
import appManagementAjax from 'src/api/appManagement';
import { getPssId } from 'src/utils/platform/auth/pssId';
import { browserIsMobile } from 'src/utils/platform/browser/device';

export const isThirdPartyBrowser = () =>
  browserIsMobile() && (window.isDingTalk || window.isWxWork || window.isFeiShu || window.isWeLink || window.isWeiXin);

const getExportWordUrl = () => `${md.global.Config.WorksheetDownUrl}/ExportWord/ToWord`;

const getAnonymousExportWordHeaders = () => {
  const headers = {
    Authorization: '',
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (window.isMingDaoApp && window.access_token) {
    headers.Authorization = `access_token ${window.access_token}`;
  }

  return headers;
};

export const requestExportWord = async (param, { worksheetId, viewId }) => {
  const token = await appManagementAjax.getToken({ worksheetId, viewId, tokenType: 5 }, { silent: true });

  if (typeof token !== 'string' || !token.trim()) {
    throw new Error('Failed to get Word export token');
  }

  const url = getExportWordUrl();
  const data = { ...param, accountId: md.global.Account.accountId, worksheetId, token };

  if (getPssId()) {
    return window.mdyAPI('', '', data, {
      ajaxOptions: {
        url,
        responseType: 'blob',
      },
      customParseResponse: true,
    });
  }

  return axios({
    method: 'POST',
    url,
    headers: getAnonymousExportWordHeaders(),
    data,
    responseType: 'blob',
  }).then(response => response.data);
};
