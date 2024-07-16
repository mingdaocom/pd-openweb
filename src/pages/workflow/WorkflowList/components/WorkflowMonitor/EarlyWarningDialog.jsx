import React, { Component } from 'react';
import { Dialog, Button, UserHead } from 'ming-ui';
import { Select } from 'antd';
import flowMonitor from 'src/pages/workflow/api/processVersion.js';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { dialogSelectUser } from 'ming-ui/functions';
import styled from 'styled-components';

const NotifierCon = styled.div`
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
`;
const NotifierItem = styled.div`
  display: flex;
  align-items: center;
  background: #f7f7f7;
  margin-right: 20px;
  margin-bottom: 10px;
  padding-right: 10px;
  border-radius: 24px;
`;

const AddNotifierBtn = styled.div`
  width: 28px;
  height: 28px;
  text-align: center;
  line-height: 28px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  color: #757575;
  &:hover {
    border: 1px solid #2196f3;
    color: #2196f3;
  }
`;

class EarlyWarningDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifiers: props.accountIds || [],
      warningValue: props.warningValue || 100,
    };
  }
  addNotifier = () => {
    const { projectId } = this.props;
    const { notifiers } = this.state;
    dialogSelectUser({
      SelectUserSettings: {
        filterAccountIds: notifiers.map(it => it.accountId),
        projectId,
        filterOtherProject: true,
        unique: false,
        callback: users => {
          this.setState({ notifiers: notifiers.concat(users) });
        },
      },
    });
  };
  deleteNotifier = accountId => {
    const { notifiers } = this.state;
    this.setState({ notifiers: notifiers.filter(v => v.accountId !== accountId) });
  };

  setWarningValue = (value, notifiers) => {
    const { projectId } = this.props;

    flowMonitor
      .updateWarning({
        accountIds: notifiers.map(it => it.accountId),
        companyId: projectId,
        value,
      })
      .then(res => {
        if (res) {
          alert(_l('操作成功'));
          this.props.onOk(value, notifiers);
          this.props.onCancel();
        } else {
          alert(_l('操作失败'), 2);
        }
      });
  };

  render() {
    const { isWarning, onCancel = () => {} } = this.props;
    const { notifiers = [], warningValue } = this.state;
    return (
      <Dialog
        title={_l('预警设置')}
        visible
        onCancel={onCancel}
        overlayClosable={false}
        footer={
          <div>
            <Button
              type="link"
              onClick={() => {
                if (isWarning) {
                  this.setState({ warningValue: 0, notifiers: [] }, () => this.setWarningValue(0, []));
                } else {
                  onCancel();
                }
              }}
            >
              {isWarning ? _l('关闭预警') : _l('取消')}
            </Button>
            <Button
              onClick={() => {
                if (_.isEmpty(notifiers)) {
                  return alert(_l('请选择通知人'), 3);
                }
                this.setWarningValue(warningValue, notifiers);
              }}
            >
              {_l('确定')}
            </Button>
          </div>
        }
      >
        <div className="mBottom16">
          <span>{_l('当累积排队超过 / 降低到')}</span>
          <Select
            className="mdAntSelect mLeft20 mRight10"
            style={{ width: 160 }}
            value={warningValue}
            onChange={val => this.setState({ warningValue: val })}
          >
            {[
              { value: 1, label: 1 },
              { value: 10, label: 10 },
              { value: 20, label: 20 },
              { value: 50, label: 50 },
              { value: 100, label: 100 },
              { value: 200, label: 200 },
              { value: 500, label: 500 },
              { value: 1000, label: 1000 },
            ].map(it => (
              <Select.Option key={it.value} value={it.value}>
                {it.label}
              </Select.Option>
            ))}
          </Select>
          <span>{_l('条时')}</span>
        </div>
        <NotifierCon>
          <span className="txtMiddle mRight20 pTop5">{_l('通知')}</span>
          {notifiers.map(it => {
            return (
              <NotifierItem>
                <UserHead
                  className="circle"
                  user={{
                    userHead: it.avatar,
                    accountId: it.accountId,
                  }}
                  size={28}
                />
                <div className="userName flexRow pLeft5">
                  <span className="ellipsis flex">{it.fullname}</span>
                  <i
                    className="ming Icon icon-default icon icon-close Font16 mLeft8 Gray_75 Hand"
                    onClick={() => this.deleteNotifier(it.accountId)}
                  />
                </div>
              </NotifierItem>
            );
          })}
          <AddNotifierBtn className="Hand" onClick={this.addNotifier}>
            <i className="ming Icon icon-default icon icon-plus Font16" />
          </AddNotifierBtn>
        </NotifierCon>
      </Dialog>
    );
  }
}

export const settingEarlyWarning = props => functionWrap(EarlyWarningDialog, props);
