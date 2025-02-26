import React from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';

let sortFlag = 0;
export const SORT_TYPE = {
  ASC: 'ASC',
  DESC: 'DESC',
};
const sortTypes = [null, SORT_TYPE.ASC, SORT_TYPE.DESC];
export default function (props) {
  const { listLoading, sort, keyStr, txt, onSort } = props;
  return (
    <div
      className="item flex flexRow Hand ThemeHoverColor3"
      onClick={() => {
        if (listLoading) return;
        if (sort.fieldName !== keyStr) {
          sortFlag = 1;
        } else {
          sortFlag = sortFlag === 2 ? 0 : sortFlag + 1;
        }
        onSort({ fieldName: sortFlag === 0 ? '' : keyStr, sortDirection: sortTypes[sortFlag] });
      }}
    >
      {txt}
      <div className="flexColumn mLeft6">
        <Icon
          icon="arrow-up"
          className={cx('sortIcon', {
            selected: sort.fieldName === keyStr && sort.sortDirection === SORT_TYPE.ASC,
          })}
        />
        <Icon
          icon="arrow-down"
          className={cx('sortIcon', {
            selected: sort.fieldName === keyStr && sort.sortDirection === SORT_TYPE.DESC,
          })}
        />
      </div>
    </div>
  );
}
