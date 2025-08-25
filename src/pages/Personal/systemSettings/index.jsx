import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Dropdown, LoadDiv, RadioGroup } from 'ming-ui';
import accountSetting from 'src/api/accountSetting';
import fixedDataApi from 'src/api/fixedData';
import privateMapAjax from 'src/api/privateMap';
import langConfig from 'src/common/langConfig';
import common from '../common';
import './index.less';

const configs = [
  // {
  //  id: 'wechartnotice',
  //  label: _l('微信通知'),
  //  component: 'weixinSwitch',
  // },
  {
    label: _l('语言设置'),
    component: 'languague',
  },
];

export default class AccountChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // / 隐私设置，加我好友的类型
      joinFriendMode: 1,
      // 手机号是否仅自己可见
      isPrivateMobile: false,
      // 邮箱是否仅自己可见
      isPrivateEmail: false,
      loading: false,
      disabledSetLanguage: false,
      timeZones: [],
      currentTimeZone: md.global.Account.timeZone,
      map: md.global.Account.map || 0,
      mapList: [],
    };
  }

  componentDidMount() {
    this.getData();
    this.getAvailableMapList();
  }

  getData() {
    this.setState({ loading: true });

    accountSetting.getAccountSettings({}).then(data => {
      this.setState({
        joinFriendMode: data.joinFriendMode,
        isPrivateMobile: data.isPrivateMobile,
        isPrivateEmail: data.isPrivateEmail,
        isOpenMessageSound: data.isOpenMessageSound,
        isOpenMessageTwinkle: data.isOpenMessageTwinkle,
        backHomepageWay: data.backHomepageWay || 1,
        loading: false,
      });
    });

    fixedDataApi.loadTimeZones().then(res => {
      const timeZones = [];

      Object.keys(res).forEach(key => {
        timeZones.push({ text: res[key], value: parseInt(key) });
      });

      this.setState({
        timeZones: [{ text: _l('跟随设备时区（配置时区，依据您正在使用设备的系统时区设置）'), value: 1 }].concat(
          timeZones.sort((a, b) => a.value - b.value),
        ),
      });
    });
  }

  // 已配置地图列表
  getAvailableMapList = () => {
    if (!md.global.SysSettings.enableMap) return;
    privateMapAjax.getAvailableMapList({}).then(res => {
      const list = (res || []).map(item => ({
        text: item.type === 0 ? _l('高德地图') : _l('Google地图'),
        value: item.type,
      }));
      this.setState({ mapList: list });
    });
  };

  // common修改
  sureSettings(settingNum, value, successCallback) {
    accountSetting
      .editAccountSetting({
        settingType: common.settingOptions[settingNum],
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
      .catch();
  }

  //语言设置
  languague = () => {
    return (
      <div className="languagueSetting">
        {langConfig.map(item => {
          return (
            <div
              className={cx('languagueItem', {
                active: (getCookie('i18n_langtag') || md.global.Config.DefaultLang) === item.key,
              })}
              onClick={() => {
                if (this.state.disabledSetLanguage) return;
                if (!md.global.Account.isPortal) {
                  this.setState({ disabledSetLanguage: true });
                  accountSetting
                    .editAccountSetting({ settingType: '6', settingValue: getCurrentLangCode(item.key).toString() })
                    .then(res => {
                      if (res) {
                        setCookie('i18n_langtag', item.key);
                        window.location.reload();
                      }
                    })
                    .catch(() => {
                      this.setState({ disabledSetLanguage: false });
                    });
                } else {
                  setCookie('i18n_langtag', item.key);
                  window.location.reload();
                }
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
      return <LoadDiv className="mTop40" />;
    }

    return (
      <div className="systemSettingsContainer">
        <div className="mTop24 Gray Font15 Bold">{_l('偏好设置')}</div>
        {configs.map((item, index) => {
          return (
            <div className="systemSettingItem borderNoe" key={index}>
              <div className="systemSettingsLabel Gray_75 LineHeight32">{item.label}</div>
              <div className="systemSettingsRight">{this[item.component]()}</div>
            </div>
          );
        })}
        <div className="systemSettingItem">
          <div className="systemSettingsLabel Gray_75 LineHeight32">{_l('时区')}</div>
          <div className="systemSettingsRight">
            <div className="Gray_75 mBottom16">
              <Dropdown
                className="systemSettingsZone Gray w100"
                border
                value={this.state.currentTimeZone}
                data={this.state.timeZones}
                openSearch
                showItemTitle
                renderTitle={(selectedData = {}) => <span title={selectedData.text}>{selectedData.text}</span>}
                onChange={value => {
                  this.sureSettings('timeZone', value, () => {
                    this.setState({ currentTimeZone: value });
                    md.global.Account.timeZone = value;
                  });
                }}
              />
            </div>
            <div className="systemSettingsZoneDesc">
              {_l(
                '时区为beta功能，仅适用于工作表中日期时间类型的日期字段和系统字段。您可以设置个人时区，便于您录入和查看时间数据。例如，您在东京时，可以将个人时区设置为东九时区(UTC+9:00)。你输入的时间被平台视作东京时间，同时，工作表中的日期时间数据以东京时间呈现。',
              )}
            </div>
          </div>
        </div>
        {md.global.SysSettings.enableMap && (
          <div className="systemSettingItem">
            <div className="systemSettingsLabel Gray_75 LineHeight32">{_l('地图')}</div>
            <div className="systemSettingsRight">
              <div className="Gray_75 mBottom10">
                <Dropdown
                  className="systemSettingsZone Gray"
                  border
                  value={this.state.map}
                  data={this.state.mapList}
                  onChange={value => {
                    this.sureSettings('map', value, () => {
                      this.setState({ map: value });
                      md.global.Account.map = value;
                    });
                  }}
                />
              </div>
              <div className="Gray_9e">
                {this.state.map === 1
                  ? _l('包含全球地图，暂不支持搜索名称定位。')
                  : _l('支持搜索地点名称定位，地图信息只包含：中国大陆、香港、澳门、台湾地区')}
              </div>
            </div>
          </div>
        )}
        <div className="systemSettingItem borderNoe">
          <div className="systemSettingsLabel Gray_75">{_l('浏览器新消息通知')}</div>
          <div className="systemSettingsRight">
            <div className="Gray_75 mBottom16">{_l('当有新消息时以何种方式提醒')}</div>
            <div className="mBottom16">
              <Checkbox
                checked={this.state.isOpenMessageSound}
                onClick={isOpenMessageSound => {
                  this.sureSettings('isOpenMessageSound', !isOpenMessageSound ? 1 : 0, () => {
                    window.isOpenMessageSound = !isOpenMessageSound;
                    this.setState({
                      isOpenMessageSound: !isOpenMessageSound,
                    });
                  });
                }}
              >
                {_l('通知音')}
              </Checkbox>
            </div>
            <div>
              <Checkbox
                checked={this.state.isOpenMessageTwinkle}
                onClick={isOpenMessageTwinkle => {
                  this.sureSettings('isOpenMessageTwinkle', !isOpenMessageTwinkle ? 1 : 0, () => {
                    window.isOpenMessageTwinkle = !isOpenMessageTwinkle;
                    this.setState({
                      isOpenMessageTwinkle: !isOpenMessageTwinkle,
                    });
                  });
                }}
              >
                {_l('浏览器标签闪烁')}
              </Checkbox>
            </div>
          </div>
        </div>
        <div className="systemSettingItem borderNoe">
          <div className="systemSettingsLabel Gray_75">{_l('应用返回首页方式')}</div>
          <div className="systemSettingsRight">
            <RadioGroup
              size="middle"
              className="mBottom20"
              vertical={true}
              data={[
                {
                  text: _l('点击直接返回'),
                  value: 1,
                },
                {
                  text: _l('悬停时先侧滑打开应用列表'),
                  value: 2,
                },
              ]}
              checkedValue={this.state.backHomepageWay}
              onChange={value => {
                this.sureSettings('backHomepageWay', value, () => {
                  window.backHomepageWay = value;
                  this.setState({
                    backHomepageWay: value,
                  });
                });
              }}
            ></RadioGroup>
          </div>
        </div>
      </div>
    );
  }
}
