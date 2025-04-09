import React from 'react';
import { antNotification, Icon } from 'ming-ui';
import { renderBtnList } from 'ming-ui/functions/mdNotification';
import ErrorDialog from 'src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ErrorDialog';
import { downloadFile, emitter } from 'src/util';
import { navigateTo } from 'src/router/navigateTo';
import _ from 'lodash';
import { match } from 'path-to-regexp';

const integrationParams = match('/integrationConnect/:id?/:tab?');

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

          new ErrorDialog({ fileKey: id[0] });
          stop();
        }

        if (href.indexOf('excelbatcherrorpage') > -1) {
          const id = href.slice(href.indexOf('excelbatcherrorpage') + 15).split('/');

          new ErrorDialog({ fileKey: id[1], isBatch: true });
          stop();
        }

        if (href.indexOf('applang') > -1) {
          navigateTo(`/app/${href.match(/applang\/(.*)/)[1]}/settings/language`);
          stop();
          return;
        }
      }
    });

    socket.on('custom', data => {
      const { id, status, title, msg, link, linkText, color, type } = data;
      const { params } = integrationParams(location.pathname) || {};
      let action = '';
      const linkBtn = {
        text: linkText || _l('查看详情'),
        onClick: () => window.open(link),
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

      antNotification[action]({
        key: id,
        className: 'customNotification',
        closeIcon: <Icon icon="close" className="Font20 Gray_9d ThemeHoverColor3" />,
        duration: 5,
        message: title,
        description: <div dangerouslySetInnerHTML={{ __html: msg }} />,
        loading: status === 1,
        btn: link ? renderBtnList([linkBtn]) : undefined,
        color,
        onBtnClick: () => {
          antNotification.close(id);
        },
      });
    });
  }
}
