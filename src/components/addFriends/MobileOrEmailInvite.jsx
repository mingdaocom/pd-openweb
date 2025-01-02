import React, { Component, Fragment } from 'react';
import { Icon, Button, RadioGroup } from 'ming-ui';
import Tel from 'src/pages/Role/PortalCon/components/Tel';
import InviteController from 'src/api/invitation';
import Requests from 'src/api/addressBook';
import EmailInput from 'src/pages/Role/PortalCon/components/Email';
import { FROM_TYPE, DETAIL_MODE } from './';
import cx from 'classnames';
import { captcha } from 'ming-ui/functions';
import _, { unset } from 'lodash';
import { existAccountHint } from 'src/util';
import { encrypt } from 'src/util';
import DialogSettingInviteRules from 'src/pages/Admin/user/membersDepartments/structure/components/dialogSettingInviteRules';

const DISPLAY_OPTIONS = [
  {
    text: _l('手机'),
    value: 1,
  },
  {
    text: _l('邮箱'),
    value: 2,
  },
];

const TYPE_MODE = {
  MOBILE: 1,
  EMAIL: 2,
};

const defaultList = [{ phone: '', isErr: false }];

export default class MobileOrEmailInvite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: defaultList,
      loading: false,
      keywords: '',
      searchData: null,
      selectType: !md.global.SysSettings.enableSmsCustomContent ? TYPE_MODE.EMAIL : TYPE_MODE.MOBILE,
    };
  }

  getValue = () => {
    // 邮箱或者国际号码带+
    return this.state.keywords.indexOf('@') > -1 || (this.state.keywords || '').startsWith('+')
      ? this.state.keywords
      : `+86${this.state.keywords}`;
  };

  handleSearch = () => {
    const { needAlert } = this.props;
    if (needAlert) {
      alert(_l('非付费用户不允许添加'), 2);
      return;
    }

    const _this = this;
    var throttled = function (res) {
      if (res.ret === 0) {
        Requests.getAccountByAccount({
          account: _this.getValue(),
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.global.getCaptchaType(),
        })
          .then(res => {
            _this.setState({ searchData: res.list });
          })
          .catch(err => {
            if (err) {
              alert(_l('请输入手机号/邮箱地址'), 3);
            }
          });
      }
    };

    if (md.global.getCaptchaType() === 1) {
      new captcha(throttled);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), throttled, { needFeedBack: false }).show();
    }
  };

  handleAdd = () => {
    const { list = [] } = this.state;
    this.setState({
      list: list.concat({ phone: '', isErr: false }),
    });
  };

  handleChange = (data, index) => {
    this.setState({
      list: this.state.list.map((o, i) => {
        if (i === index) {
          return { ...o, phone: data.value, isErr: !!data.isErr };
        } else {
          return o;
        }
      }),
    });
  };

  invite = (accounts, cb) => {
    const { projectId, onCancel, fromType } = this.props;

    InviteController.inviteUser({
      sourceId: projectId || md.global.Account.accountId,
      accounts: accounts,
      fromType,
    })
      .then(result => {
        existAccountHint(result);

        // 1代表成功
        if (result && result.sendMessageResult === 1) {
          onCancel();
        }
        this.setState({ loading: false });
        if (_.isFunction(cb)) {
          cb();
        }
      })
      .catch(() => {
        alert('邀请失败', 2);
        this.setState({ loading: false });
      });
  };

  inviteFriend = item => {
    if (item.accountId === md.global.Account.accountId) {
      alert(_l('不能添加自己为好友'), 3);
      return;
    }

    if (this.state.loading) return;
    this.setState({ loading: true });

    this.invite({ [encrypt(this.getValue())]: '' }, () => {
      this.setState({
        searchData: this.state.searchData.map(i => (i.accountId === item.accountId ? { ...i, disabled: true } : i)),
      });
    });
  };

  submit = () => {
    const { list = [], loading } = this.state;
    const { needAlert } = this.props;
    if (needAlert) {
      alert(_l('非付费用户不允许添加'), 2);
      return;
    }

    if (loading) return;

    this.setState({ loading: true });

    let accountObj = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (list[i] && list[i].phone) {
        accountObj[encrypt(list[i].phone)] = '';
      }
    }
    InviteController.getInviteAccountInfo({
      accounts: accountObj,
    })
      .then(data => {
        this.invite(accountObj);
      })
      .catch(() => {
        alert(_l('邀请发送失败'), 2);
        this.setState({ loading: false });
      });
  };

  renderItem = (item, index) => {
    let content = '';
    if (this.state.selectType === TYPE_MODE.MOBILE) {
      content = (
        <Tel
          data={item}
          inputClassName="rowTel"
          allowDropdown={true}
          onChange={data => this.handleChange(data, index)}
        />
      );
    } else {
      content = (
        <EmailInput data={o} inputClassName="rowTel pLeft8" onChange={data => this.handleChange(data, index)} />
      );
    }

    return (
      <div className="row">
        {content}
        <Icon
          className={cx('Font16  del ThemeColor3 Hand', { op0: index === 0, Hand: index !== 0 })}
          icon="close"
          onClick={() => {
            if (index !== 0) {
              this.setState({
                list: this.state.list.filter((o, i) => i !== index),
              });
            }
          }}
        />
      </div>
    );
  };

  renderUserItem = item => {
    const isDefault = _.isEmpty(this.state.searchData);
    return (
      <div className="userItem">
        <img src={item.avatarBig} />
        <div className="userInfo ellipsis">
          <div className="Font17 Bold">{item.fullname}</div>
          {item.subInfo && <div className="Gray_75 mTop8">{item.subInfo}</div>}
        </div>
        <Button disabled={item.disabled} className="inviteButton" onClick={() => this.inviteFriend(item)}>
          {item.disabled ? _l('已邀请') : isDefault ? _l('发送邀请') : _l('加为好友')}
        </Button>
      </div>
    );
  };

  render() {
    const { projectId, fromType, setDetailMode, showInviteRules } = this.props;
    const { selectType, list, loading, keywords, searchData, showDialogSettingInviteRules } = this.state;
    const hasValue = list.some(i => i.phone && !i.isErr);

    // 好友邀请
    if (fromType === FROM_TYPE.PERSONAL) {
      const listData =
        keywords && searchData
          ? searchData.length > 0
            ? searchData
            : [
                {
                  accountId: 'default',
                  avatarBig: `${md.global.FileStoreConfig.pictureHost.replace(/\/$/, '')}/UserAvatar/default.gif`,
                  fullname: this.getValue(),
                  subInfo: _l('该用户未注册，你可以邀请TA加入并成为好友'),
                },
              ]
          : null;
      return (
        <div className="addFriendsContent">
          <div class="addFriendHeader">
            <div class="inputWrapper">
              <span class="icon-search searchIcon"></span>
              <input
                type="text"
                value={keywords}
                onChange={e => this.setState({ keywords: e.target.value.trim() })}
                placeholder={_l('搜索手机号 / 邮箱添加好友')}
              />
              {keywords && (
                <span
                  class="searchClear icon-delete Hand"
                  onClick={() => {
                    this.setState({ keywords: '', searchData: null });
                  }}
                ></span>
              )}
            </div>
            <Button className="searchBtn" disabled={!keywords} onClick={() => this.handleSearch()}>
              {_l('搜索')}
            </Button>
          </div>

          {listData && <div className="resultContent flex">{listData.map(i => this.renderUserItem(i))}</div>}
        </div>
      );
    }

    const text = fromType === FROM_TYPE.GROUPS ? _l('群组') : _l('组织');

    return (
      <div className="addFriendsContent">
        <div className="Gray_75 mBottom20 flexRow">
          <span className="flex">{_l('邀请后，成员会收到邀请链接，验证后可加入%0', text)}</span>
          {fromType !== FROM_TYPE.GROUPS && (
            <div className="addBox mLeft10">
              <span onClick={() => setDetailMode(DETAIL_MODE.INVITE)}>
                <Icon icon="overdue_network" />
                {_l('邀请记录')}
              </span>
            </div>
          )}
        </div>

        {md.global.SysSettings.enableSmsCustomContent && (
          <RadioGroup
            size="middle"
            className="mBottom20"
            checkedValue={selectType}
            data={DISPLAY_OPTIONS}
            onChange={value => this.setState({ selectType: value, list: defaultList })}
          />
        )}
        <div className="resultContent" style={{ minHeight: 230, overflow: 'unset' }}>
          {list.map((item, index) => this.renderItem(item, index))}
          <div className="addBox ThemeColor3">
            <span onClick={this.handleAdd}>
              <Icon icon="add1" />
              {_l('添加')}
            </span>
          </div>
        </div>

        <div className="footContainer">
          <div className="flexRow flexCenter">
            {fromType !== FROM_TYPE.GROUPS && showInviteRules && (
              <div className="addBox Gray_9e mRight16">
                <span onClick={() => this.setState({ showDialogSettingInviteRules: true })}>
                  <Icon icon="settings1" />
                  {_l('邀请设置')}
                </span>
              </div>
            )}
            {fromType !== FROM_TYPE.GROUPS && (
              <div className="addBox Gray_9e">
                <span onClick={() => window.open(`${location.origin}/admin/structure/${projectId}/importusers`)}>
                  <Icon icon="add_software" />
                  {_l('批量导入')}
                </span>
              </div>
            )}
          </div>
          <Button
            disabled={!hasValue || loading}
            onClick={evt => {
              evt.nativeEvent.stopImmediatePropagation();
              this.submit();
            }}
          >
            {_l('发送邀请')}
          </Button>
        </div>

        {showDialogSettingInviteRules && (
          <DialogSettingInviteRules
            showDialogSettingInviteRules={showDialogSettingInviteRules}
            setValue={({ showDialogSettingInviteRules }) => this.setState({ showDialogSettingInviteRules })}
            projectId={projectId}
          />
        )}
      </div>
    );
  }
}
