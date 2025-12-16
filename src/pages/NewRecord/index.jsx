import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import styled from 'styled-components';
import { BgIconButton, Button, LoadDiv } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import mingoCreateIcon from 'src/components/Mingo/assets/ai_create_date.svg';
import { MINGO_TASK_TYPE } from 'src/components/Mingo/ChatBot/enum';
import NewRecord from 'src/pages/worksheet/common/newRecord';
import { navigateTo } from 'src/router/navigateTo';
import { emitter } from 'src/utils/common';
import successPng from './success.png';
import './index.less';

const ScaleButton = styled(BgIconButton.Group)`
  position: absolute;
  z-index: 2;
  right: 12px;
  top: 30px;
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
    this.handleMingoCreateRecordActive = this.handleMingoCreateRecordActive.bind(this);
  }
  componentDidMount() {
    emitter.on('MINGO_CREATE_RECORD_ACTIVE', this.handleMingoCreateRecordActive);
  }
  componentWillUnmount() {
    emitter.off('MINGO_CREATE_RECORD_ACTIVE', this.handleMingoCreateRecordActive);
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
  handleMingoCreateRecordActive(value) {
    this.setState({ mingoActive: value });
  }
  render() {
    const { match = {}, appPkg = {}, createOptions, isMingoCreate, onClose, onAdd = () => {} } = this.props;
    const { appId, worksheetId, viewId } = createOptions || match.params || {};
    const { isLarge, status, mingoActive } = this.state;

    if (!appPkg.id) {
      return (
        <div className="newRecordLand">
          <LoadDiv />
        </div>
      );
    }

    return (
      <div
        className={cx('newRecordLand', { isMingoCreate })}
        style={isLarge ? { width: 'calc(100% - 64px)', maxWidth: '1600px' } : {}}
      >
        {status === STATUS.NORMAL && (
          <ScaleButton gap={12}>
            {!mingoActive && (
              <BgIconButton
                className="mingoCreate"
                text={_l('AI 填写')}
                iconComponent={<img src={mingoCreateIcon} />}
                onClick={() => {
                  window.mingoPendingStartTask = { type: MINGO_TASK_TYPE.CREATE_RECORD_ASSIGNMENT };
                  emitter.emit('SET_MINGO_VISIBLE');
                }}
              />
            )}
            {isMingoCreate && (
              <BgIconButton
                tooltip={_l('清空')}
                icon="clean"
                onClick={() => {
                  emitter.emit('MINGO_NEW_RECORD_CLEAN');
                }}
              />
            )}
            <BgIconButton
              icon={isLarge ? 'worksheet_narrow' : 'worksheet_enlarge'}
              tooltip={isLarge ? _l('缩小') : _l('放大')}
              onClick={() => {
                safeLocalStorageSetItem('NEW_RECORD_IS_LARGE', !isLarge);
                this.setState({ isLarge: !isLarge });
              }}
            />
            <BgIconButton icon="close" onClick={onClose} />
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
              noDisableClick
              showFillNext
              isMingoCreate={isMingoCreate}
              needCache={!isMingoCreate}
              notDialog
              className="flexColumn"
              appId={appId}
              viewId={viewId}
              worksheetId={worksheetId}
              addType={1}
              visible
              changeWorksheetStatusCode={() => this.setState({ status: STATUS.ERROR })}
              onAdd={(row, { continueAdd }) => {
                if (isMingoCreate) {
                  if (continueAdd) {
                    emitter.emit('MINGO_CREATE_RECORD_CLEAN', row);
                  } else {
                    onAdd();
                    onClose();
                  }
                  return;
                }
                if (!continueAdd) {
                  this.setState({ status: STATUS.SUCCESS });
                }
              }}
              hideNewRecord={onClose}
            />
          </div>
        )}
      </div>
    );
  }
}
