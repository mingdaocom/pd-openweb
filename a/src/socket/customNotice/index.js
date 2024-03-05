import React from 'react';
import { antNotification, Icon } from 'ming-ui';
import { renderBtnList } from 'ming-ui/functions/notify';
import ErrorDialog from 'src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ErrorDialog';
import { downloadFile } from 'src/util';
import { navigateTo } from 'src/router/navigateTo';
import _ from 'lodash';

export default function customNotice() {
  const { socket } = window.IM || {};
  if (socket) {
    $('body').on('click', 'a', function(evt) {
      if ($(evt.target).closest('.customNotification').length) {
        evt.preventDefault();

        const href = (
          $(evt.target)
            .closest('a')
            .attr('href') || ''
        ).toLocaleLowerCase();

        if (href.indexOf('worksheetexcel') > -1) {
          const downloadUrl = `${__api_server__.main + href}`;
          window.open(downloadFile(downloadUrl));
          return;
        }

        if (href.indexOf('excelerrorpage') > -1) {
          const id = href.slice(href.indexOf('excelerrorpage') + 15).split('/');
          new ErrorDialog({ fileKey: id[0] });
        }
        if (href.indexOf('excelerrorpage') > -1) {
          const id = href.slice(href.indexOf('excelbatcherrorpage') + 15).split('/');
          new ErrorDialog({ fileKey: id[1], isBatch: true });
        }

        if (href.indexOf('backup') > -1 || href.indexOf('restore') > -1) {
          const currentAppId = location.href.slice(
            location.href.indexOf('app/') + 4,
            location.href.indexOf('app/') + 40,
          );
          const appId = href.slice(href.indexOf('app/') + 4, href.indexOf('app/') + 40);

          if (href.indexOf('backup') > -1) {
            location.href = `/app/${appId}/settings/backup`;
          } else {
            if (currentAppId === appId) {
              location.href = `/app/${appId}`;
            } else {
              navigateTo(`/app/${appId}`);
            }
          }
        }
      }
    });

    socket.on('custom', data => {
      const { id, status, title, msg, link, color } = data;
      let action = '';
      const linkBtn = {
        text: _l('查看详情'),
        onClick: () => window.open(link),
      };

      if (status === 1) {
        action = 'info';
      } else if (status === 2) {
        action = 'success';
      } else if(status === 3) {
        action = 'warning';
      } else {
        action = 'error';
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
