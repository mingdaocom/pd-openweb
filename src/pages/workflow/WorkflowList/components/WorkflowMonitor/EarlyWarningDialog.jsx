import React, { Component } from 'react';
import { Dialog, Button, UserHead, Input, Tooltip } from 'ming-ui';
import { Select } from 'antd';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { dialogSelectUser } from 'ming-ui/functions';
import styled from 'styled-components';
import cx from 'classnames';

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

const InputWrap = styled(Input)`
  &.overLimit,
  &.overLimit.Input:focus {
    border-color: #f00 !important;
  }
`;

class EarlyWarningDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifiers: props.notifiers || [],
      warningValue: props.type === 'balance' && props.warningValue < 10 ? undefined : props.warningValue,
    };
  }
  addNotifier = () => {
    const { projectId } = this.props;
    const { notifiers } = this.state;

    dialogSelectUser({
      fromAdmin: true,
      SelectUserSettings: {
        selectedAccountIds: notifiers.map(it => it.accountId),
        projectId,
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

  changeBalanceWarningValue = value => {
    let val = value.replace(/[^0-9]/g, '');
    const overLimit = Number(val) < 10 || Number(val) > 100000;

    this.setState({ warningValue: val, overLimit });
  };

  renderSetting = () => {
    const { type } = this.props;
    const { warningValue, overLimit } = this.state;

    switch (type) {
      case 'balance':
        return (
          <div className="mBottom16">
            <span className="mRight16">{_l('当组织账户余额低于')}</span>
            <InputWrap
              placeholder={_l('请输入')}
              className={cx('mRight16', { overLimit, mTop10: _.includes([1], getCurrentLangCode()) })}
              value={warningValue}
              onChange={this.changeBalanceWarningValue}
            />
            <span>{_l('时')}</span>
          </div>
        );

      case 'workflow':
        return (
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
        );
      default:
        return null;
    }
  };

  render() {
    const { type, isWarning, onCancel = () => {}, closeWarning = () => {} } = this.props;
    const { notifiers = [], warningValue } = this.state;
    const isWorkflow = type === 'workflow';

    return (
      <Dialog
        title={
          type === 'balance' ? (
            <div>
              <span>{_l('余额预警')}</span>
              <Tooltip
                text={_l(
                  '设置后，在扣款时若组织账户余额低于预警值则会发送预警给通知人（每天仅发送 1 次预警，若重置预警值则会再次发送）',
                )}
              >
                <i className="icon icon-info Gray_bd mLeft8" />
              </Tooltip>
            </div>
          ) : (
            _l('预警设置')
          )
        }
        visible
        onCancel={onCancel}
        overlayClosable={false}
        footer={
          <div className="flexRow">
            <div className="flex TxtLeft">
              {isWarning ? (
                <Button
                  className="pLeft0 pRight0"
                  style={{ minWidth: 0 }}
                  type="link"
                  onClick={() => closeWarning(isWorkflow ? 0 : warningValue, [], onCancel)}
                >
                  {_l('关闭预警')}
                </Button>
              ) : (
                ''
              )}
            </div>
            <Button type="link" onClick={onCancel}>
              {_l('取消')}
            </Button>
            <Button
              onClick={() => {
                if (
                  type === 'balance' &&
                  (!warningValue || Number(warningValue) < 10 || Number(warningValue) > 100000)
                ) {
                  this.setState({ overLimit: true });
                  alert(_l('输入金额错误，输入的金额范围在10到100,000之间'), 3);
                  return;
                }

                if (_.isEmpty(notifiers)) {
                  return alert(_l('请选择通知人'), 3);
                }

                this.props.onOk(warningValue, notifiers, onCancel);
              }}
            >
              {_l('确定')}
            </Button>
          </div>
        }
      >
        {this.renderSetting()}
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
