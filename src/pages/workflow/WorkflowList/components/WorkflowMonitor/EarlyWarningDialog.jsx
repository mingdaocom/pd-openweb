import React, { Component } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { Button, Checkbox, Dialog, Icon, Input, Tooltip, UserHead } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { dialogSelectUser } from 'ming-ui/functions';

const NotifierCon = styled.div`
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  .notifierUsers {
    display: flex;
    gap: 10px 20px;
    flex: 1;
    flex-wrap: wrap;
  }
`;
const NotifierItem = styled.div`
  display: flex;
  align-items: center;
  background: #f7f7f7;
  padding-right: 10px;
  border-radius: 24px;
  max-width: 200px;
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

const NoticeMethod = styled.div`
  .methods {
    display: flex;
    gap: 40px;
    flex-wrap: wrap;
  }
`;

const NOTICE_METHOD_OPTIONS = [
  { value: '1', label: _l('系统消息') },
  { value: '2', label: _l('短信') },
  { value: '3', label: _l('邮件') },
];

const ALERT_TIP = {
  workflow: _l('请输入整数，数值必须 大于0，小于 100001'),
  balance: _l('输入金额错误，输入的金额范围在10到100,000之间'),
};

class EarlyWarningDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notifiers: props.notifiers || [],
      warningValue: props.type === 'balance' && props.warningValue < 10 ? undefined : props.warningValue,
      noticeTypes: props.noticeTypes && props.noticeTypes.length ? props.noticeTypes : ['1'],
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
    const { type = 'balance' } = this.props;
    let val = value.replace(/[^0-9]/g, '');
    const overLimit =
      type === 'workflow' ? Number(val) < 1 || Number(val) > 100001 : Number(val) < 10 || Number(val) > 100000;

    overLimit && alert(ALERT_TIP[type], 3);

    this.setState({ warningValue: val, overLimit });
  };

  onChangeNoticeTypes = value => {
    const { noticeTypes } = this.state;

    this.setState({
      noticeTypes: _.uniq(
        noticeTypes.includes(value) ? noticeTypes.filter(l => l !== value) : noticeTypes.concat(value),
      ),
    });
  };

  renderSetting = () => {
    const { type } = this.props;
    const { warningValue, overLimit } = this.state;

    if (!_.includes(['balance', 'workflow'], type)) return null;

    return (
      <div className="mBottom26">
        <span className="mRight16">
          {type === 'balance' ? _l('当组织账户余额低于') : _l('当累积排队超过 / 降低到')}
        </span>
        <InputWrap
          placeholder={_l('请输入')}
          className={cx('mRight16', { overLimit, mTop10: _.includes([1], getCurrentLangCode()) })}
          value={warningValue}
          onChange={this.changeBalanceWarningValue}
        />
        <span>{type === 'balance' ? _l('时%25310') : _l('条时')}</span>
      </div>
    );
  };

  renderNoticeMethod = () => {
    const { noticeTypes } = this.state;

    return (
      <NoticeMethod className="mTop26">
        <div className="mBottom12">
          {_l('通知方式')}
          <Tooltip text={_l('默认通过系统消息向通知人发送提醒。您可设置更多提醒方式。')}>
            <Icon icon="info" className="Gray_bd mLeft8 Font16" />
          </Tooltip>
        </div>
        <div className="methods">
          {NOTICE_METHOD_OPTIONS.filter(v =>
            _.get(md, 'global.Config.IsLocal') && !_.get(md, 'global.SysSettings.enableSmsCustomContent')
              ? v.value !== '2'
              : true,
          ).map((item, index) => (
            <Checkbox
              checked={noticeTypes.includes(item.value)}
              disabled={index === 0}
              onClick={() => this.onChangeNoticeTypes(item.value)}
            >
              <span>{item.label}</span>
            </Checkbox>
          ))}
        </div>
      </NoticeMethod>
    );
  };

  render() {
    const { type = 'balance', isWarning, onCancel = () => {}, closeWarning = () => {} } = this.props;
    const { notifiers = [], warningValue, noticeTypes, overLimit } = this.state;
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
                  style={{ minWidth: 0, padding: '0 8px' }}
                  type="link"
                  onClick={() => closeWarning(isWorkflow ? 0 : warningValue, [], [], onCancel)}
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
                if (overLimit) {
                  alert(ALERT_TIP[type], 3);
                  return;
                }

                if (_.isEmpty(notifiers)) {
                  return alert(_l('请选择通知人'), 3);
                }

                this.props.onOk(warningValue, notifiers, noticeTypes, onCancel);
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
          <div className="notifierUsers">
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
          </div>
        </NotifierCon>
        {this.renderNoticeMethod()}
      </Dialog>
    );
  }
}

export const settingEarlyWarning = props => functionWrap(EarlyWarningDialog, props);
