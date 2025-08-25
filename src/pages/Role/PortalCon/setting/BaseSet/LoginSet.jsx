import React from 'react';
import { useSetState } from 'react-use';
import { DatePicker } from 'antd';
import localeEn from 'antd/es/date-picker/locale/en_US';
import localeJaJp from 'antd/es/date-picker/locale/ja_JP';
import localeZhCn from 'antd/es/date-picker/locale/zh_CN';
import localeZhTw from 'antd/es/date-picker/locale/zh_TW';
import _ from 'lodash';
import moment from 'moment';
import { Icon } from 'ming-ui';
import EditAgreementOrPrivacy from 'src/pages/Role/PortalCon/components/EditAgreementOrPrivacy';
import { SwitchStyle } from './style';

export default function (props) {
  const { portalSetModel, onChangePortalSet } = props;
  const locales = { 'zh-Hans': localeZhCn, 'zh-Hant': localeZhTw, en: localeEn, ja: localeJaJp };
  const locale = locales[md.global.Account.lang];
  const [{ type, show }, setCommonState] = useSetState({
    type: null,
    show: false,
  });
  return (
    <>
      <h6 className="Font16 Gray Bold mBottom0 mTop24">{_l('登录设置')}</h6>
      <div className="mTop12">
        <SwitchStyle>
          <Icon
            icon={portalSetModel.termsAndAgreementEnable ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font32 Hand TxtBottom"
            onClick={() => {
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  termsAndAgreementEnable: !portalSetModel.termsAndAgreementEnable,
                },
              });
            }}
          />
          <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
            {_l('登录时需同意用户协议和隐私条款')}
          </div>
        </SwitchStyle>
        <div style={{ 'margin-left': '44px' }}>
          {!!portalSetModel.termsAndAgreementEnable && (
            <React.Fragment>
              <p className="Gray_9e LineHeight18 mBottom8 Font13">
                {_l(
                  '平台已预置了通用协议内容（无公司主体），因各门户的具体业务不同收集的用户信息不同，请您务必根据公司实际业务重新上传符合规定的协议内容',
                )}
              </p>
              <div className="bold mTop6 LineHeight24 Font13">
                {_l('设置')}
                <span
                  className="ThemeColor3 Hand mRight10 mLeft10"
                  onClick={() => {
                    setCommonState({ type: 0, show: true });
                  }}
                >
                  {_l('用户协议')}
                </span>
                {_l('和')}
                <span
                  className="ThemeColor3 Hand mLeft10"
                  onClick={() => {
                    setCommonState({ type: 1, show: true });
                  }}
                >
                  {_l('隐私政策')}
                </span>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
      {/* 私有部署不提供是否需要关注服务号的配置 */}
      {!md.global.Config.IsLocal && (
        <div className="mTop5">
          <SwitchStyle>
            <Icon
              icon={portalSetModel.subscribeWXOfficial ? 'ic_toggle_on' : 'ic_toggle_off'}
              className="Font32 Hand"
              onClick={() => {
                let data = {
                  subscribeWXOfficial: !portalSetModel.subscribeWXOfficial,
                };
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    ...data,
                  },
                });
              }}
            />
            <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
              {_l('通过微信扫码登录时，需先关注服务号')}
            </div>
          </SwitchStyle>
        </div>
      )}
      <div className="mTop5">
        <SwitchStyle>
          <Icon
            icon={_.get(portalSetModel, 'registerInfo.enable') ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font32 Hand"
            onClick={() => {
              let registerInfo = {
                ..._.get(portalSetModel, 'registerInfo'),
                enable: !_.get(portalSetModel, 'registerInfo.enable'),
              };
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  registerInfo,
                },
              });
            }}
          />
          <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
            {_l('外部用户注册开始/停止时间')}
          </div>
        </SwitchStyle>
        {_.get(portalSetModel, 'registerInfo.enable') && (
          <div className="rangePicker flexRow alignItemsCenter">
            <DatePicker
              showTime={true}
              className={'flex Hand'}
              locale={locale}
              bordered={false}
              placeholder={_l('开始时间')}
              value={
                !_.get(portalSetModel, 'registerInfo.startTime') ||
                _.get(portalSetModel, 'registerInfo.startTime').substr(0, 4) === '0001'
                  ? null
                  : moment(_.get(portalSetModel, 'registerInfo.startTime'))
              }
              onChange={date => {
                if (
                  !!_.get(portalSetModel, 'registerInfo.endTime') &&
                  moment(_.get(portalSetModel, 'registerInfo.endTime')).isBefore(date)
                ) {
                  return alert(_l('结束时间不能早于开始时间'), 3);
                }
                let registerInfo = {
                  ..._.get(portalSetModel, 'registerInfo'),
                  startTime: date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '',
                };
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    registerInfo,
                  },
                });
              }}
            />
            <span className="pLeft5 pRight5 Gray_d">—</span>
            <DatePicker
              showTime={true}
              locale={locale}
              className={'flex Hand'}
              bordered={false}
              placeholder={_l('结束时间')}
              value={
                !_.get(portalSetModel, 'registerInfo.endTime') ||
                _.get(portalSetModel, 'registerInfo.endTime').substr(0, 4) === '0001'
                  ? null
                  : moment(_.get(portalSetModel, 'registerInfo.endTime'))
              }
              onChange={date => {
                if (
                  !!_.get(portalSetModel, 'registerInfo.startTime') &&
                  moment(date).isBefore(_.get(portalSetModel, 'registerInfo.startTime'))
                ) {
                  return alert(_l('结束时间不能早于开始时间'), 3);
                }
                let registerInfo = {
                  ..._.get(portalSetModel, 'registerInfo'),
                  endTime: date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '',
                };
                onChangePortalSet({
                  portalSetModel: {
                    ...portalSetModel,
                    registerInfo,
                  },
                });
              }}
            />
          </div>
        )}
      </div>
      <div className="mTop5">
        <SwitchStyle>
          <Icon
            icon={portalSetModel.twoAuthenticationEnabled ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font32 Hand"
            onClick={() => {
              let data = {
                twoAuthenticationEnabled: !portalSetModel.twoAuthenticationEnabled,
              };
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  ...data,
                },
              });
            }}
          />
          <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">{_l('两步验证')}</div>
        </SwitchStyle>
        {portalSetModel.twoAuthenticationEnabled && (
          <div style={{ 'margin-left': '44px' }} className="Gray_9e Font13">
            {_l('外部用户通过账号密码或微信扫码登录后，需要额外进行验证码验证，验证通过后才能成功登录')}
          </div>
        )}
      </div>
      <div className="mTop5">
        <SwitchStyle>
          <Icon
            icon={portalSetModel.autoLogin ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font32 Hand"
            onClick={() => {
              let data = {
                autoLogin: !portalSetModel.autoLogin,
              };
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  ...data,
                },
              });
            }}
          />
          <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">{_l('7天免登录')}</div>
        </SwitchStyle>
        {portalSetModel.autoLogin && (
          <div style={{ 'margin-left': '44px' }} className="Gray_9e Font13">
            {_l('登录页面是否显示 7 天免登录的选项')}
          </div>
        )}
      </div>
      <div className="mTop5">
        <SwitchStyle>
          <Icon
            icon={portalSetModel.doubleBinding ? 'ic_toggle_on' : 'ic_toggle_off'}
            className="Font32 Hand"
            onClick={() => {
              let data = {
                doubleBinding: !portalSetModel.doubleBinding,
              };
              onChangePortalSet({
                portalSetModel: {
                  ...portalSetModel,
                  ...data,
                },
              });
            }}
          />
          <div className="switchText LineHeight32 InlineBlock Normal Gray mLeft12">
            {_l('登录后需绑定手机号或者邮箱')}
          </div>
        </SwitchStyle>
        {portalSetModel.doubleBinding && (
          <div style={{ 'margin-left': '44px' }} className="Gray_9e Font13">
            {_l('开启后，登录后需用户再额外绑定邮箱或者手机号，绑定后方可使用应用')}
          </div>
        )}
      </div>
      {show && (
        <EditAgreementOrPrivacy
          show={show}
          type={type}
          data={type === 1 ? portalSetModel.privacyTerms : portalSetModel.userAgreement}
          setShow={() => {
            setCommonState({ type: null, show: false });
          }}
          onChange={data => {
            let da = type === 1 ? { privacyTerms: data } : { userAgreement: data };
            onChangePortalSet({
              portalSetModel: {
                ...portalSetModel,
                ...da,
              },
            });
          }}
        />
      )}
    </>
  );
}
