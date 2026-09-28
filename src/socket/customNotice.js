import React from 'react';
import _ from 'lodash';
import { match } from 'path-to-regexp';
import { Icon } from 'ming-ui';
import { Notification } from 'ming-ui/antd-components';
import { renderBtnList } from 'ming-ui/functions/mdNotification';
import ErrorDialog from 'src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ErrorDialog';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { sanitizePostMessageHtml } from 'src/utils/core/sanitizeHtml';
import { emitter } from 'src/utils/platform/browser/dom';
import { downloadFile } from 'src/utils/platform/browser/download';
import { getPathWithoutSubPath } from 'src/utils/platform/navigation/path';

const integrationParams = match('/integrationConnect/:id?/:tab?');

const getSafeNoticeLink = link => {
  if (!link) return '';

  try {
    const url = new URL(link, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? link : '';
  } catch {
    return '';
  }
};

function addWebUrlForWorksheetHref(content = '') {
  const webUrl = _.get(md, 'global.Config.WebUrl', '');

  if (!content || !webUrl) return content;

  return content.replace(/href=(['"])(\/worksheet\/[^'"]*?)\1/gi, (matched, quote, href = '') => {
    if (/^https?:\/\//i.test(href)) {
      return matched;
    }

    const baseUrl = webUrl.replace(/\/$/, '');
    return `href=${quote}${baseUrl}${href}${quote}`;
  });
}

export default function customNotice() {
  const { socket } = window.IM || {};

  if (socket) {
    $('body').on('click', 'a', function (evt) {
      if ($(evt.target).closest('.customNotification').length) {
        const href = ($(evt.target).closest('a').attr('href') || '').toLocaleLowerCase();

        const stop = () => {
          evt.preventDefault();
          evt.stopImmediatePropagation();
        };

        if (href.indexOf('worksheetexcel') > -1) {
          const downloadUrl = `${__api_server__.main + href}`;

          window.open(downloadFile(downloadUrl));
          stop();
          return;
        }

        if (href.indexOf('excelerrorpage') > -1) {
          const id = href.slice(href.indexOf('excelerrorpage') + 15).split('/');

          ErrorDialog({ fileKey: id[0] });
          stop();
        }

        if (href.indexOf('excelbatcherrorpage') > -1) {
          const id = href.slice(href.indexOf('excelbatcherrorpage') + 15).split('/');

          ErrorDialog({ fileKey: id[1], isBatch: true });
          stop();
        }

        if (href.indexOf('applang') > -1) {
          navigateTo(`/app/${href.match(/applang\/(.*)/)[1]}/settings/language`);
          stop();
          return;
        }

        if (href.indexOf('importattachmentserrorpage') > -1) {
          const arr = href.split('/');

          ErrorDialog({ fileKey: arr[arr.length - 1], isAttachment: true });
          stop();
        }
      }
    });

    socket.on('custom', data => {
      const { id, status, title, msg, link, linkText, color, type } = data;
      const { params } = integrationParams(getPathWithoutSubPath(location.pathname)) || {};
      let action = '';
      const formatMsg = addWebUrlForWorksheetHref(msg);
      const safeFormatMsg = sanitizePostMessageHtml(formatMsg);
      const safeLink = getSafeNoticeLink(link);
      const linkBtn = {
        text: linkText || _l('查看详情'),
        onClick: () => window.open(safeLink, '_blank', 'noopener,noreferrer'),
      };

      if (status === 1) {
        action = 'info';
      } else if (status === 2) {
        action = 'success';
      } else if (status === 3) {
        action = 'warning';
      } else {
        action = 'error';
      }

      // api集成导入升级 type=2 导出，type=101 api导入，type=102 api升级
      if (status === 2 && type === 102 && !_.isEmpty(params) && params.id === data.id) {
        setTimeout(() => {
          window.location.reload();
        }, 200);
      }

      // 引用关系--工作流模块
      if (status === 2 && type === 201) {
        setTimeout(() => {
          emitter.emit('refreshReference');
        }, 200);
      }

      Notification[action]({
        key: id,
        className: 'customNotification',
        closeIcon: <Icon icon="close" className="Font20 textTertiary hoverColorPrimary" />,
        duration: 5,
        message: title,
        description: <div dangerouslySetInnerHTML={{ __html: safeFormatMsg }} />,
        loading: status === 1,
        actions: safeLink ? renderBtnList([linkBtn]) : undefined,
        color,
        onBtnClick: () => {
          Notification.close(id);
        },
      });
    });
  }
}
