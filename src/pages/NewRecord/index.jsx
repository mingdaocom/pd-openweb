import React, { Component } from 'react';
import { withRouter } from 'react-router';
import cx from 'classnames';
import styled from 'styled-components';
import sheetAjax from 'src/api/worksheet';
import NewRecord from 'src/pages/worksheet/common/newRecord';
import './index.less';

const ScaleButton = styled.div`
  position: absolute;
  z-index: 2;
  right: 4px;
  top: 24px;
  cursor: pointer;
  font-size: 20px;
  line-height: 40px;
  width: 40px;
  text-align: center;
  color: #9e9e9e;
  > span {
    line-height: 1.4em;
  }
  &:hover {
    color: #2196f3;
  }
`;
@withRouter
export default class NewRecordLand extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLarge: localStorage.getItem('NEW_RECORD_IS_LARGE') === 'true',
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
    const { isLarge, error } = this.state;
    return (
      <div className={cx('newRecordLand')} style={isLarge ? { width: 'calc(100% - 64px)', maxWidth: '1200px' } : {}}>
        <ScaleButton
          onClick={() => {
            safeLocalStorageSetItem('NEW_RECORD_IS_LARGE', !isLarge);
            this.setState({ isLarge: !isLarge });
          }}
        >
          <span data-tip={isLarge ? _l('缩小') : _l('放大')}>
            <i className={`icon icon-${isLarge ? 'worksheet_narrow' : 'worksheet_enlarge'}`}></i>
          </span>
        </ScaleButton>
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
    );
  }
}
