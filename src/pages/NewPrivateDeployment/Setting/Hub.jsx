import React, { Fragment, useState, useEffect, useRef } from 'react';
import { LoadDiv, Dialog, Checkbox } from 'ming-ui';
import { Button, Divider } from 'antd';
import EmailDialog from './components/EmailDialog';
import MessageSettings from './components/MessageSettings';
import emailApi from 'src/api/email';
import smsApi from 'src/api/sms';
import { updateSysSettings } from '../common';
import privateSysSetting from 'src/api/privateSysSetting';
import tencentyunIcon from '../images/tencentyunIcon.png';
import aliyunIcon from '../images/aliyunIcon.png';
import _ from 'lodash';

const Email = props => {
  const [emailDialogVisible, setEmailDialogVisible] = useState(false);
  const [emailConfig, setEmailConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const style = { width: 100 };

  useEffect(() => {
    emailApi.getSmtpSecret().then(result => {
      result && setEmailConfig(result);
      setLoading(false);
    });
  }, []);

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('邮件服务')}</div>
      {loading ? (
        <LoadDiv />
      ) : (
        <Fragment>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">{_l('签名')}</div><div>{emailConfig.signature || _l('未配置')}</div>
          </div>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">{_l('发送邮箱')}</div><div>{emailConfig.fromAddress || _l('未配置')}</div>
          </div>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">{_l('服务器')}</div><div>{emailConfig.server || _l('未配置')}</div>
          </div>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">{_l('账号')}</div><div>{emailConfig.account || _l('未配置')}</div>
          </div>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">{_l('密码')}</div>
            <div>{emailConfig.password ? (emailConfig.password || '').replace(/./g, '*') : _l('未配置')}</div>
          </div>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">{_l('端口')}</div><div>{emailConfig.port || _l('未配置')}</div>
          </div>
          <div className="flexRow valignWrapper mBottom15">
            <div style={style} className="Gray_75">{_l('SSL 链接')}</div><div>{emailConfig.enableSsl ? _l('启用') : _l('未启用')}</div>
          </div>
        </Fragment>
      )}
      <div>
        <Button
          ghost
          type="primary"
          onClick={() => setEmailDialogVisible(true)}
        >
          {_l('设置')}
        </Button>
      </div>
      <EmailDialog
        visible={emailDialogVisible}
        emailConfig={emailConfig}
        onCancel={() => {
          setEmailDialogVisible(false);
        }}
        onChange={(data) => {
          setEmailConfig(data);
        }}
      />
    </div>
  );
};

const Message = props => {
  const { SysSettings } = md.global;
  const [sms, setSms] = useState([]);
  const [loading, setLoading] = useState(true);
  const formContent = useRef(null);
  const [currentSms, setCurrentSms] = useState({});
  const [enableSmsCustomContent, setEnableSmsCustomContent] = useState(SysSettings.enableSmsCustomContent);
  const style = { width: 100 };

  useEffect(() => {
    smsApi.getProviders().then(result => {
      setSms(result);
      setLoading(false);
    });
  }, []);

  const renderSms = (data = {}, smsInfo) => {
    const { name, secret = {}, sms } = data;
    const { tags, keys, icon } = smsInfo;
    const id = secret[keys[0]];
    const key = secret[keys[1]];
    return (
      <Fragment>
        <div className="flexRow valignWrapper mBottom15">
          <img style={{ width: 15 }} src={icon} />
          <div className="Font14 bold mLeft5">{smsInfo.title}</div>
          <div className="Gray_9e mLeft20 pTop2">{_l('仅支持发送登录/注册验证码')}</div>
        </div>
        <div className="flexRow valignWrapper mBottom12">
          <div style={style} className="Gray_75">{tags[0]}</div><div>{id || _l('未配置')}</div>
        </div>
        <div className="flexRow valignWrapper mBottom12">
          <div style={style} className="Gray_75">{tags[1]}</div>
          <div>{key ? key.replace(/./g, '*') : _l('未配置')}</div>
        </div>
        <div className="flexRow valignWrapper mBottom12">
          <div style={style} className="Gray_75">{_l('签名')}</div><div>{data.signature || _l('未配置')}</div>
        </div>
        <div className="flexRow valignWrapper mBottom12">
          <div style={style} className="Gray_75">{_l('短信模板')}</div><div>{_l('%0个', _.get(sms, 'china.templates.length') || 0)}</div>
        </div>
        <div>
          <Button
            ghost
            type="primary"
            onClick={() => {
              setCurrentSms(smsInfo);
            }}
          >
            {_l('设置')}
          </Button>
        </div>
      </Fragment>
    );
  }

  const tencentyunInfo = {
    title: _l('腾讯云'),
    name: 'Tencentyun',
    tags: ['App ID', 'App Key'],
    keys: ['appId', 'appKey'],
    icon: tencentyunIcon,
  };
  const aliyunInfo = {
    title: _l('阿里云'),
    name: 'Aliyun',
    tags: ['Access Key', 'Access Secret'],
    keys: ['accessKey', 'accessSecret'],
    icon: aliyunIcon,
  };

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('短信服务')}</div>
      {loading ? (
        <LoadDiv />
      ) : (
        <Fragment>
          {renderSms(_.find(sms, { name: 'Tencentyun' }), tencentyunInfo)}
          <Divider className="mTop20 mBottom20" />
          {renderSms(_.find(sms, { name: 'Aliyun' }), aliyunInfo)}
        </Fragment>
      )}
      <Divider className="mTop20 mBottom20" />
      <div className="Font15 bold mBottom8">{_l('自助集成服务')}</div>
      <div className="Gray_9e">
        {_l('如果需要启用系统内短信服务相关的功能(如: 工作流短信通知节点、手机号邀请用户加入产品使用),需自行申请第三方短信服务商账号,然后自主集成或由官方技术团队定制开发')}
        ，
        <a
          className="pointer"
          target="_blank"
          href="https://docs.pd.mingdao.com/faq/sms"
        >
          {_l('查看说明')}
        </a>
      </div>
      <div className="mTop30">
        <Checkbox
          checked={!enableSmsCustomContent}
          text={_l('隐藏短信服务相关的系统功能')}
          onClick={checked => {
            const value = checked;
            updateSysSettings({
              enableSmsCustomContent: value
            }, () => {
              setEnableSmsCustomContent(value);
              md.global.SysSettings.enableSmsCustomContent = value;
            });
          }}
        />
        <div className="Gray_9e mTop8 mLeft25">{_l('如果你未完成自主集成,可以在系统内隐藏这些功能入口')}</div>
      </div>
      <Dialog
        visible={!_.isEmpty(currentSms)}
        anim={false}
        title={_l('%0短信配置服务', currentSms.title)}
        width={680}
        okText={_l('保存')}
        onOk={() => {
          formContent.current.editProviders();
        }}
        onCancel={() => setCurrentSms({})}
      >
        <MessageSettings
          ref={formContent}
          name={currentSms.name}
          onSave={(data) => {
            setSms(data);
            setCurrentSms({})
          }}
        />
      </Dialog>
    </div>
  );
};

const PlatformIntegration = props => {
  const platTypes = [
    { type: 'WorkWeixin', text: _l('企业微信') },
    { type: 'Dingding', text: _l('钉钉') },
    { type: 'Welink', text: _l('Welink') },
    { type: 'Feishu', text: _l('飞书') },
    { type: 'Weixin', text: _l('微信') },
  ];
  const [usePlatformInfo, setUserPlatformInfo] = useState({
    hideWorkWeixin: md.global.SysSettings.hideWorkWeixin,
    hideDingding: md.global.SysSettings.hideDingding,
    hideWelink: md.global.SysSettings.hideWelink,
    hideFeishu: md.global.SysSettings.hideFeishu,
    hideWeixin: md.global.SysSettings.hideWeixin,
  });

  const changeCheckedIntegration = (checked, type) => {
    privateSysSetting
      .editSysSettings({
        settings: {
          [`hide${type}`]: checked,
        },
      })
      .then(res => {
        if (res) {
          setUserPlatformInfo({
            ...usePlatformInfo,
            [`hide${type}`]: checked,
          });
          md.global.SysSettings[`hide${type}`] = checked;
          alert(_l('修改成功'));
        } else {
          alert(_l('修改失败'), 2);
        }
      });
  };

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('第三方平台')}</div>
      <div className="mBottom15 Gray_9e">{_l('如果你的企业不使用下列第三方平台，你可以取消勾选')}</div>
      <div className="flexRow">
        {platTypes.map(item => {
          const { type, text } = item;

          return (
            <Fragment key={type}>
              <Checkbox
                checked={!usePlatformInfo[`hide${type}`]}
                onClick={checked => changeCheckedIntegration(checked, type)}
              />
              <span className="mRight30">{text}</span>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default props => {
  return (
    <Fragment>
      <Email {...props} />
      <Message {...props} />
      <PlatformIntegration {...props} />
    </Fragment>
  );
};
