import React from 'react';
import { antNotification } from 'ming-ui';
import ErrorDialog from 'src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ErrorDialog';

export default function customNotice() {
  const { socket } = window.IM || {};
  if (socket) {
    $('body').on('click', 'a', function (evt) {
      if ($(evt.target).closest('.customNotification').length) {
        evt.preventDefault();

        const href = ($(evt.target).closest('a').attr('href') || '').toLocaleLowerCase();

        if (href.indexOf('worksheetexcel') > -1) {
          window.open(`${__api_server__ + href}`);
          return;
        }

        if (href.indexOf('excelerrorpage') > -1) {
          const id = href.slice(href.indexOf('excelerrorpage') + 15).split('/');
          new ErrorDialog({ fileKey: id[0] });
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
        duration = null;
      } else {
        action = 'error';
        duration = 3;
      }

      antNotification[action]({
        key: id,
        className: 'customNotification',
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
