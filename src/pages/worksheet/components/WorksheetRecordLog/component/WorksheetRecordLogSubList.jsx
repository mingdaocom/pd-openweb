import React, { useState, useEffect } from 'react';
import { Dialog } from 'ming-ui';
import {  browserIsMobile } from 'src/util';
import cx from 'classnames';
import '../WorksheetRecordLogValue.less';
import WorksheetRecordLogSubTable from './WorksheetRecordLogSubTable';
import _ from 'lodash';


function WorksheetRecordLogSubList(props) {
  const {  prop } = props;
  const { newValue, oldValue, name } = prop;
  const isMobile = browserIsMobile();
  const newData = safeParse(newValue, 'array');
  const oldData = safeParse(oldValue, 'array');
  const [dialog, setDialog] = useState(false);
  const [listCount, setListCount] = useState({
    add: [],
    update: [],
    remove: [],
  });
  useEffect(() => {
    setListCount({
      add: _.difference(newData, oldData),
      update: _.intersection(newData, oldData),
      remove: _.difference(oldData, newData),
    });
  }, []);
  return (
    <div className="worksheetRecordLogSubList">
      {listCount.add.length !== 0 && (
        <p className="worksheetRecordLogSubListItem">{_l('新增了%0条', listCount.add.length)}</p>
      )}
      {listCount.update.length !== 0 && (
        <p className="worksheetRecordLogSubListItem">{_l('更新了%0条', listCount.update.length)}</p>
      )}
      {listCount.remove.length !== 0 && (
        <p className="worksheetRecordLogSubListItem">{_l('移除了%0条', listCount.remove.length)}</p>
      )}
      <span className={cx('WorksheetRecordLogOpen', { hideEle: isMobile })} onClick={() => setDialog(true)}>
        {_l('查看详情')}
      </span>
      <Dialog
        className="worksheetRecordLogSubDialog"
        style={{ width: '90%', height: '90%', minHeight: '90%', maxWidth: '1600px' }}
        visible={dialog}
        onCancel={() => setDialog(false)}
      >
        <h3 className="tableTitle">{name}</h3>
        <WorksheetRecordLogSubTable {...props} />
      </Dialog>
    </div>
  );
}

export default WorksheetRecordLogSubList;
