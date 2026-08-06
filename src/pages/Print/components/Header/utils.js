import axios from 'axios';
import { browserIsMobile } from 'src/utils/common.js';
import { getPssId } from 'src/utils/pssId';

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

export const requestExportWord = param => {
  const url = getExportWordUrl();

  if (getPssId()) {
    return window.mdyAPI('', '', param, {
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
    data: param,
    responseType: 'blob',
  }).then(response => response.data);
};
