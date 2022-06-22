import React, { Fragment } from 'react';
import { ScrollView } from 'ming-ui';
import moment from 'moment';
import styled from 'styled-components';
import EmptyStatus from './EmptyStatus';
import '../less/manageBackupFilesDialog.less';
import cx from 'classnames';
const ActionLogWrap = styled.div`
  border-bottom: 1px solid #eaeaea;
  padding: 13px 20px 18px 0;
  margin: 0 20px;
  .row {
    justify-content: space-between;
    font-size: 13px;
    .avatar {
      width: 24px;
      height: 24px;
      display: inline-block;
      border-radius: 50%;
      background: #9d9d9d;
      vertical-align: middle;
    }
    .name,
    .action,
    .date {
      color: #9e9e9e;
    }
    .actContent {
      color: #333;
      padding-left: 32px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .actContent {
      color: #333;
      .changeBefore {
        color: #bdbdbd;
        text-decoration: line-through;
      }
    }
  }
`;

const OPERATION_DATA_LIST = {
  6: _l('用备份还原了新应用'),
  1: _l('将应用备份为'),
  2: _l('将应用还原为'),
  3: _l('删除了备份'),
  4: _l('重命名了备份'),
  5: _l('下载了备份'),
};

export default function ActionLogs(props) {
  const { actLogList = [], getList = () => {}, isMore, pageIndex } = props;
  if (_.isEmpty(actLogList)) {
    return <EmptyStatus emptyTxt={_l('暂无日志信息')} />;
  }
  const onScrollEnd = _.throttle(() => {
    if (isMore) {
      getList(pageIndex + 1);
    }
  }, 200);
  return (
    <Fragment>
      <ScrollView onScrollEnd={onScrollEnd} className="backupFilesWrap">
        {actLogList.map(item => {
          return (
            <ActionLogWrap key={item.backupRestoreOperationId}>
              <div className="flexRow row">
                <div>
                  <img src={item.operatorHeadImage} className="avatar mRight8" />
                  <span className="name mRight12">{item.operatorName}</span>
                  <span className="action">
                    {(item.operationType || item.operationType === 0) && OPERATION_DATA_LIST[item.operationType]}
                  </span>
                </div>
                <div className="date">{moment(item.operationDateTime).format('YYYY-MM-DD HH:mm:ss')}</div>
              </div>
              <div className="flexRow row">
                <div className="actContent">
                  <span className={cx('mRight6', { changeBefore: item.operationType === 4 })}>
                    {item.operationType === 4 ? item.oldBackupFileName : item.backupFileName}
                  </span>
                  {item.operationType === 4 && <span className="renameContent">{item.backupFileName}</span>}
                </div>
              </div>
            </ActionLogWrap>
          );
        })}
      </ScrollView>
    </Fragment>
  );
}
