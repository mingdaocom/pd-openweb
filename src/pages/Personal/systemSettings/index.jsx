import React from 'react';
import { Switch } from 'antd';
import { LoadDiv, Tooltip } from 'ming-ui';
import accountSetting from 'src/api/accountSetting';
import cx from 'classnames';
import './index.less';
import langConfig from 'src/common/langConfig';
const { personal: {accountChart} } = window.private

const configs = [
  // {
  //  id: 'wechartnotice',
  //  label: _l('微信通知'),
  //  component: 'weixinSwitch',
  // },
  {
    id: 'langnotice',
    label: _l('语言设置'),
    component: 'languague',
  },
].filter(item => !accountChart[item.id]);

const languagueList = [{ key: 'zh-Hans', value: '简体中文' }].concat(langConfig);

const settingOptions = {
  openWeixinLogin: 3,
  joinFriendMode: 5,
  isPrivateMobile: 9,
  isPrivateEmail: 10,
};

export default class AccountChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // / 开启微信登录提醒
      openWeixinLogin: false,
      // / 隐私设置，加我好友的类型
      joinFriendMode: 1,
      // 手机号是否仅自己可见
      isPrivateMobile: false,
      // 邮箱是否仅自己可见
      isPrivateEmail: false,
      loading: false,
      isHasWeixin: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    this.setState({ loading: true });
    accountSetting.getAccountSettings({}).then(data => {
      this.setState({
        openWeixinLogin: data.openWeixinLogin,
        joinFriendMode: data.joinFriendMode,
        isPrivateMobile: data.isPrivateMobile,
        isPrivateEmail: data.isPrivateEmail,
        isHasWeixin: data.isHasWeixin,
        loading: false,
      });
    });
  }

  // common修改
  sureSettings(settingNum, value, successCallback) {
    accountSetting
      .editAccountSetting({
        settingType: settingOptions[settingNum],
        settingValue: value,
      })
      .then(data => {
        if (data) {
          alert(_l('设置成功'));
          if (_.isFunction(successCallback)) {
            successCallback();
          }
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .fail();
  }

  weixinSwitch = () => {
    return (
      <Switch
        checked={this.state.openWeixinLogin}
        onClick={openWeixinLogin => {
          if (!this.state.isHasWeixin) {
            this.openWeixinLoginDialog();
            return;
          }
          // 已关注未开启提醒
          this.sureSettings('openWeixinLogin', openWeixinLogin ? 1 : 0, () => {
            // 开启微信登录提醒
            this.setState({
              openWeixinLogin,
            });
          });
        }}
      />
    );
  };

  openWeixinLoginDialog() {
    require(['src/api/weixin', 'mdDialog'], function(weixin) {
      let html = '';
      html += "<div class='weixinLoginNotifyDialog LineHeight25'>";
      html += "<div class='LeneHeight25'>" + _l('您的账号绑定微信后，方可开启微信登陆提醒');
      html += '<br />' + _l('请使用您的微信“扫一扫”扫描二维码，关注服务号，并绑定账号。') + '</div>';
      html += "<div class='mTop10'>";
      html += "<div class='Left weixinImg'>" + <LoadDiv /> + '</div>';
      html += "<div class='Left'>";
      html += "<input type='button' value='" + _l('我已经绑定了微信账号');
      html += "' title='" + _l('我已经绑定了微信账号');
      html += "' class='ming Button Button--primary Button--small bindService' />";
      html += '</div>';
      html += "<div class='Clear'></div>";
      html += '</div>';
      html += '</div>';
      $.DialogLayer({
        dialogBoxID: 'weixinLoginNotify',
        width: 420,
        container: {
          header: _l('开启微信登陆提醒'),
          content: html.toString(),
          noText: '',
          yesText: '',
        },
        readyFn: function() {},
        callback: function() {},
        drag: true,
      });
      weixin.getWeiXinServiceNumberQRCode().then(function(dataWeixin) {
        let content = '加载失败';
        if (dataWeixin) {
          content = "<img src='" + dataWeixin + "' width='98' height='98'/>";
        }
        const $el = $('#weixinLoginNotify .weixinLoginNotifyDialog');
        $el.find('.weixinImg').html(content);
      });

      // 检测是否已经绑定位置帐号
      $('.weixinLoginNotifyDialog .bindService').on('click', function() {
        weixin.checkWeiXinServiceNumberBind().then(function(dataWeixin) {
          if (!dataWeixin) {
            alert(_l('您的帐号还未绑定微信，请扫描左侧二维码'), 3);
          } else {
            alert(_l('您的帐号已绑定微信，赶快去开启微信登录提醒吧'));
          }
        });
      });
    });
  }

  //语言设置
  languague = () => {
    return (
      <div className="languagueSetting">
        {languagueList.map(item => {
          return (
            <div
              className={cx('languagueItem', {
                active: (getCookie('i18n_langtag') || getNavigatorLang()) === item.key,
              })}
              onClick={() => {
                setCookie('i18n_langtag', item.key);
                window.location.reload();
              }}
            >
              {item.value}
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    if (this.state.loading) {
      return <LoadDiv />;
    }
    return (
      <div className="systemSettingsContainer">
        <div className="mTop24 Gray Font15 Bold">{_l('偏好设置')}</div>
        {configs.map((item, index) => {
          return (
            <div className="systemSettingItem" key={index}>
              <div className="systemSettingsLabel Gray_75">
                {item.label}
                {item.component === 'weixinSwitch' && (
                  <Tooltip popupPlacement="top" text={<span>{_l('开启后，登录会收到微信通知')}</span>}>
                    <span className="icon-novice-circle Font15 Gray_bd mLeft5 Hand" />
                  </Tooltip>
                )}
              </div>
              <div className="systemSettingsRight">{this[item.component]()}</div>
            </div>
          );
        })}
      </div>
    );
  }
}
