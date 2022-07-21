import React from 'react';
import { antNotification, Icon } from 'ming-ui';
import ErrorDialog from 'src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ErrorDialog';
import { downloadFile } from 'src/util';
import { navigateTo } from 'src/router/navigateTo';

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

        if (href.indexOf('backup') > -1) {
          const currentAppId = location.href.slice(
            location.href.indexOf('/app/') + 5,
            location.href.indexOf('/app/') + 41,
          );
          const appId = href.slice(href.indexOf('/app/') + 5, href.indexOf('/app/') + 41);

          if (currentAppId === appId) {
            navigateTo(`${location.pathname}?backup`);
          } else {
            navigateTo(`/app/${appId}/?backup`);
          }
        }

        if (href.indexOf('restore') > -1) {
          const url = location.href.slice(0, location.href.indexOf('/app/') + 41);
          location.assign(url);
        }
      }
    });

    socket.on('custom', data => {
      const { id, status, title, msg } = data;
      let duration = null;
      let action = '';

      if (status === 1) {
        action = 'info';
      } else if (status === 2) {
        action = 'success';
        duration = 5;
      } else {
        action = 'error';
        duration = 5;
      }

      antNotification[action]({
        key: id,
        className: 'customNotification',
        closeIcon: <Icon icon="close" className="Font20 Gray_9d ThemeHoverColor3" />,
        duration,
        message: title,
        description: <div dangerouslySetInnerHTML={{ __html: msg }} />,
        loading: status === 1,
        onBtnClick: () => {
          antNotification.close(id);
        },
      });
    });
  }
}
