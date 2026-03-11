import React from 'react';
import cx from 'classnames';
import { RelateDetail } from 'src/pages/widgetConfig/styled';
import { toEditWidgetPage } from '../../util';

export default function RelateSheetInfo({ name, id }) {
  return (
    <RelateDetail>
      <i className="icon-link_record Font16 textTertiary"></i>
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
