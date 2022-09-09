import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Switch, LoadDiv, Dialog, Icon } from 'ming-ui';
import { Button, Divider } from 'antd';
import Trigger from 'rc-trigger';
import EmailDialog from './components/EmailDialog';
import MessageSettings from './components/MessageSettings';
import emailApi from 'src/api/email';
import smsApi from 'src/api/sms';
import styled from 'styled-components';

const PrivateDesc = styled.div`
  align-items: center;
  background: #F5F5F5;
  padding: 6px 12px;
  border-radius: 4px;
  display: flex;
  .addWeiXin {
    font-size: 13px;
    font-weight: bold;
    color: #47B14B;
    padding: 2px 10px;
    border-radius: 24px;
  }
`;

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
      <div className="flexRow valignWrapper mBottom15">
        <div className="Gray_9e mRight10">{_l('设置后系统内邮件相关功能均可正常使用')}</div>
        <a
          className="pointer"
          target="_blank"
          href='https://docs.pd.mingdao.com/faq/email.html'
        >
          {_l('帮助')}
        </a>
      </div>
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
  const [sms, setSms] = useState([]);
  const [loading, setLoading] = useState(true);
  const formContent = useRef(null);
  const [currentSms, setCurrentSms] = useState({});
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
    icon: require('../images/tencentyunIcon.png'),
  };
  const aliyunInfo = {
    title: _l('阿里云'),
    name: 'Aliyun',
    tags: ['Access Key', 'Access Secret'],
    keys: ['accessKey', 'accessSecret'],
    icon: require('../images/aliyunIcon.png')
  };

  return (
    <div className="privateCardWrap flexColumn">
      <div className="Font17 bold mBottom8">{_l('短信服务')}</div>
      <div className="flexRow valignWrapper mBottom15">
        <div className="Gray_9e mRight10">{_l('设置后可发送验证码类型短信')}</div>
        <a
          className="pointer"
          target="_blank"
          href='https://docs.pd.mingdao.com/faq/sms.html'
        >
          {_l('帮助')}
        </a>
      </div>
      <PrivateDesc className="Font13 mBottom15">
        {_l('设置短信服务需要先购买腾讯云或阿里云的「短信服务」，如需自定义短信服务请')}
        <Trigger
          action={['hover']}
          popup={<img className="card z-depth-2" style={{ width: 300 }} src={require('../images/weixin.png')} />}
          popupAlign={{
            offset: [0, 7],
            points: ['tc', 'bc'],
            overflow: { adjustX: 1, adjustY: 2 },
          }}
        >
          <div className="addWeiXin pointer">
            <Icon icon="weixin" className="mRight2" />
            {_l('添加微信')}
          </div>
        </Trigger>
        {_l('寻求技术支持')}
      </PrivateDesc>
      {loading ? (
        <LoadDiv />
      ) : (
        <Fragment>
          {renderSms(_.find(sms, { name: 'Tencentyun' }), tencentyunInfo)}
          <Divider className="mTop20 mBottom20" />
          {renderSms(_.find(sms, { name: 'Aliyun' }), aliyunInfo)}
        </Fragment>
      )}
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

export default props => {
  return (
    <Fragment>
      <Email {...props} />
      <Message {...props} />
    </Fragment>
  );
};


