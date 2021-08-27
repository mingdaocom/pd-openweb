import React, { Component } from 'react';
import { withRouter } from 'react-router';
import cx from 'classnames';
import { LoadDiv, ScrollView, Button } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import NewRecord from 'src/pages/worksheet/common/newRecord';
import './index.less';

@withRouter
export default class NewRecordLand extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
    };
  }
  handleAddWorksheetRow(args, callBack) {
    sheetAjax.addWorksheetRow(args).then(res => {
      if (res && res.data) {
        alert(_l('添加成功'));
        if (callBack) {
          callBack(res.data);
        }
      } else {
        alert(_l('添加失败,请稍后重试'));
      }
    });
  }
  render() {
    const { match = {} } = this.props;
    const { appId, worksheetId, viewId } = match.params || {};
    const { error } = this.state;
    return (
      <ScrollView>
        <div className={cx('newRecordLand')}>
          {error && (
            <div
              className="errorCon shadow"
              style={{ height: window.innerHeight - 130 + 'px', lineHeight: window.innerHeight - 130 + 'px' }}
            >
              {_l('您没有新建记录权限，请联系该应用管理员')}
            </div>
          )}
          {!error && (
            <div className="newRecordCon" style={{ minHeight: window.innerHeight - 130 + 'px' }}>
              <NewRecord
                showFillNext
                notDialog
                className="flexColumn"
                appId={appId}
                viewId={viewId}
                worksheetId={worksheetId}
                addType={1}
                visible
                changeWorksheetStatusCode={() => this.setState({ error: true })}
              />
            </div>
          )}
        </div>
      </ScrollView>
    );
  }
}
