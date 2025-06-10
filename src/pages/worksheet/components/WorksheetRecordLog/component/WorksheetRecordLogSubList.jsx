import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog } from 'ming-ui';
import { browserIsMobile } from 'src/utils/common';
import WorksheetRecordLogSubTable from './WorksheetRecordLogSubTable';
import '../WorksheetRecordLogValue.less';

function WorksheetRecordLogSubList(props) {
  const { prop } = props;
  const { newValue, oldValue, name } = prop;
  const isMobile = browserIsMobile();
  const newData = _.union(safeParse(newValue, 'array'));
  const oldData = _.union(safeParse(oldValue, 'array'));
  const [dialog, setDialog] = useState(false);
  const [listCount, setListCount] = useState({
    add: [],
    update: [],
    remove: [],
  });

  useEffect(() => {
    setListCount(
      prop.editType === 2
        ? {
            add: [],
            update: [],
            remove: _.difference(newData, oldData),
          }
        : {
            add: _.difference(newData, oldData),
            update: _.intersection(newData, oldData),
            remove: _.difference(oldData, newData),
          },
    );
  }, []);

  const getSummary = () => {
    if (prop.editType === 0) {
      return <p className="worksheetRecordLogSubListItem">{_l('更新了%0条', listCount.add.length)}</p>;
    }

    return (
      <React.Fragment>
        {listCount.add.length !== 0 && (
          <p className="worksheetRecordLogSubListItem">{_l('新增了%0条', listCount.add.length)}</p>
        )}
        {listCount.update.length !== 0 && (
          <p className="worksheetRecordLogSubListItem">{_l('更新了%0条', listCount.update.length)}</p>
        )}
        {listCount.remove.length !== 0 && (
          <p className="worksheetRecordLogSubListItem">{_l('移除了%0条', listCount.remove.length)}</p>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="worksheetRecordLogSubList nowrap">
      {getSummary()}
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
