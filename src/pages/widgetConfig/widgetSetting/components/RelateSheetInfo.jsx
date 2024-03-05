import React from 'react';
import { RelateDetail } from 'src/pages/widgetConfig/styled';
import cx from 'classnames';
import { toEditWidgetPage } from '../../util';

export default function RelateSheetInfo({ name, id }) {
  return (
    <RelateDetail>
      <i className="icon-link_record Font16 Gray_9e"></i>
      <div className="text">{_l('工作表')}</div>
      <div
        className={cx('name Bold overflow_ellipsis', { needLink: !!id })}
        onClick={() => id && toEditWidgetPage({ sourceId: id, fromURL: 'newPage' })}
      >
        {name}
      </div>
    </RelateDetail>
  );
}
