import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Button, LoadDiv } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import sheetAjax from 'src/api/worksheet';
import NewRecord from 'src/pages/worksheet/common/newRecord';
import successPng from './success.png';
import './index.less';
import { navigateTo } from 'src/router/navigateTo';

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

const Success = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  img {
    width: 120px;
  }
  .status {
    font-size: 17px;
    color: #757575;
    margin: 24px 0 32px;
  }
`;

const STATUS = {
  NORMAL: 1,
  SUCCESS: 2,
  ERROR: 3,
};

@withRouter
@connect(({ appPkg }) => ({ appPkg }))
export default class NewRecordLand extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLarge: localStorage.getItem('NEW_RECORD_IS_LARGE') === 'true',
      status: STATUS.NORMAL,
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
        alert(_l('添加失败,请稍后重试'), 2);
      }
    });
  }
  render() {
    const { match = {}, appPkg } = this.props;
    const { appId, worksheetId, viewId } = match.params || {};
    const { isLarge, status } = this.state;
    
    if (!appPkg.id) {
      return (
        <div className="newRecordLand">
          <LoadDiv />
        </div>
      );
    }

    return (
      <div className={cx('newRecordLand')} style={isLarge ? { width: 'calc(100% - 64px)', maxWidth: '1200px' } : {}}>
        {status === STATUS.NORMAL && (
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
        )}
        {status !== STATUS.NORMAL && (
          <div className="errorCon shadow" style={{ height: window.innerHeight - 130 + 'px' }}>
            {status === STATUS.ERROR && _l('您没有新建记录权限，请联系该应用管理员')}
            {status === STATUS.SUCCESS && (
              <Success>
                <img src={successPng} alt="" />
                <span className="status">{_l('创建成功')}</span>
                <div>
                  <Button onClick={() => this.setState({ status: STATUS.NORMAL })}>{_l('继续创建')}</Button>
                  <Button
                    type="ghost"
                    className="mLeft10"
                    onClick={() => navigateTo(`/worksheet/${worksheetId}${viewId ? `/view/${viewId}` : ''}`)}
                  >
                    {_l('查看我的数据')}
                  </Button>
                </div>
              </Success>
            )}
          </div>
        )}
        {status === STATUS.NORMAL && (
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
              changeWorksheetStatusCode={() => this.setState({ status: STATUS.ERROR })}
              onAdd={(row, { continueAdd }) => {
                if (!continueAdd) {
                  //
                  this.setState({ status: STATUS.SUCCESS });
                }
              }}
            />
          </div>
        )}
      </div>
    );
  }
}
