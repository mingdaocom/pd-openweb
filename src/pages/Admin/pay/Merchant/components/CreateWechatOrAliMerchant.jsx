// 微信支付 or 支付宝支付
import React, { Fragment, useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import CryptoJS from 'crypto-js';
import _, { isEmpty } from 'lodash';
import { Button, Dialog, Icon, LoadDiv, Support, Textarea } from 'ming-ui';
import paymentAjax from 'src/api/payment';
import projectAjax from 'src/api/project';
import { handlePrePayOrder } from 'src/pages/Admin/pay/PrePayorder';
import { PUBLIC_KEY } from 'src/util/enum';
import './createMerchant.less';

const wechatFormInfo = [
  { label: _l('开发者ID(AppID)'), field: 'appId', placeholder: _l('输入开发者ID(AppID)') },
  { label: _l('商户号'), field: 'sellerId', placeholder: _l('输入微信支付商户号') },
  { label: _l('商户简称'), field: 'shortName', placeholder: _l('输入商户简称') },
  { label: _l('商户APIv2密钥'), field: 'appSecret', placeholder: _l('输入商户APIv2密钥') },
  { label: _l('商户API证书'), field: 'privateKey', placeholder: _l('输入商户API证书') },
];
const aliFormInfo = [
  { label: _l('商户号'), field: 'sellerId', placeholder: _l('输入商户号') },
  { label: _l('商户简称'), field: 'shortName', placeholder: _l('输入商户简称') },
  { label: _l('应用APPID'), field: 'appId', placeholder: _l('输入应用APPID') },
  { label: _l('应用私钥'), field: 'privateKey', placeholder: _l('输入应用私钥') },
  { label: _l('支付宝公钥'), field: 'publicKey', placeholder: _l('输入支付宝公钥') },
];

const encryptRequestData = data => {
  if (!_.trim(data)) return '';
  if (data.includes('*********')) return data;

  const key = CryptoJS.enc.Utf8.parse(PUBLIC_KEY.replace(/\r|\n/, '').slice(26, 42));
  const encrypt = CryptoJS.AES.encrypt(_.trim(data), key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  return encrypt.toString();
};

export default function CreateWechatOrAliMerchant(props) {
  const {
    projectId,
    merchantPaymentChannel,
    currentMerchantInfo = {},
    onClose = () => {},
    changeCreateMerchant = () => {},
    updateCurrentMerchant = () => {},
    getDataList = () => {},
  } = props;
  const isCreate = _.isEmpty(currentMerchantInfo);

  const [formData, setFormData] = useSetState({});
  const [showSecretDialog, setShowSecretDialog] = useState(false);

  const {
    appId,
    sellerId,
    shortName,
    appSecret,
    privateKey,
    publicKey,
    isSubmit,
    formChanged,
    initData = {},
  } = formData;
  const isWechat = merchantPaymentChannel === 2;
  const formInfo = isCreate
    ? isWechat
      ? wechatFormInfo
      : aliFormInfo
    : isWechat
      ? wechatFormInfo.filter(item => _.includes(['appId', 'shortName'], item.field))
      : aliFormInfo.slice(1, 2);
  const secretFormInfo = isWechat
    ? wechatFormInfo.filter(item => !_.includes(['appId', 'shortName'], item.field))
    : aliFormInfo.filter(item => item.field !== 'shortName');
  const [isScroll, setIsScroll] = useState(false);
  const [loading, setLoading] = useState(!isCreate || isWechat);
  let timer = null;

  const requestConfigInfo = {
    appId: _.trim(appId) || initData.appId,
    sellerId: _.trim(sellerId) || initData.sellerId,
    appSecret: encryptRequestData(appSecret) || encryptRequestData(initData.appSecret),
    privateKey: encryptRequestData(privateKey) || encryptRequestData(initData.privateKey),
    publicKey: encryptRequestData(publicKey) || encryptRequestData(initData.publicKey),
    extraInfo: '',
  };

  // 获取商户信息
  const getMerchant = () => {
    paymentAjax
      .getMerchant({
        projectId,
        merchantId: currentMerchantInfo.id,
      })
      .then((res = {}) => {
        setLoading(false);
        const merchantInfo = {
          ...(res.merchantPayConfigInfo || {}),
          shortName: res.shortName,
        };
        setFormData({
          ...merchantInfo,
          ...clearSecretInfo(merchantInfo.appId),
          initData: merchantInfo,
        });
      })
      .catch(err => {
        setLoading(false);
      });
  };

  // 成功后返回商户列表更新数据
  const updateData = () => {
    setFormData({
      formChanged: false,
      initData: {
        ...initData,
        shortName: _.trim(shortName),
        sellerId: requestConfigInfo.sellerId,
        appId: requestConfigInfo.appId,
      },
    });
    onClose();
    changeCreateMerchant(false);
    setShowSecretDialog(false);
    if (isCreate) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        getDataList();
      }, 1000);
    } else {
      updateCurrentMerchant({
        ...currentMerchantInfo,
        shortName,
        merchantPayConfigInfo: { appId, appSecret, privateKey, publicKey, sellerId },
      });
    }
  };

  const clearSecretInfo = appId => {
    return { appSecret: '', privateKey: '', publicKey: '', sellerId: '', appId: isWechat ? appId : '' };
  };

  // 验证&创建&保存商户
  const checkMerchant = type => {
    if (
      (!isCreate && type === 'save' && !shortName) ||
      ((isCreate || type === 'check') &&
        (!sellerId ||
          !shortName ||
          !appId ||
          (isWechat && (!appSecret || !privateKey)) ||
          (!isWechat && (!privateKey || !publicKey))))
    ) {
      setFormData({ isSubmit: true });
      return;
    }
    setFormData({ isSubmit: false });

    paymentAjax
      .createMerchant({
        projectId,
        name: _.trim(shortName),
        merchantPaymentChannel,
        merchantNo: currentMerchantInfo.merchantNo || '',
        merchantPayConfigInfo: requestConfigInfo,
      })
      .then(res => {
        // res.result 0: 保存 1：验证

        // 直接修改简称
        if (res.result === 0) {
          alert(_l('保存成功'));
          updateData();
          return;
        }

        handlePrePayOrder({
          title: _l('验证商户信息'),
          paymentModule: 5,
          orderId: res.orderId,
          payFinished: ({ onCancel = () => {} }) => {
            alert(_l('保存成功'));
            onCancel();
            updateData();
          },
        });
      });
  };

  // 获取微信服务号appid
  const getWeiXinBindingInfo = () => {
    projectAjax
      .getWeiXinBindingInfo({ projectId })
      .then(res => {
        if (res && _.isArray(res) && !isEmpty(res)) {
          setFormData({ appId: res[0].appId });
        }
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!isCreate && loading) {
      getMerchant();
    }
    if (!isWechat || !isCreate) return;
    getWeiXinBindingInfo();
  }, []);

  useEffect(() => {
    const ele = document.querySelector('.secretBody');
    if (ele) {
      setIsScroll(ele.scrollHeight > ele.clientHeight);
    }
  }, [showSecretDialog]);

  if (!isCreate && loading) {
    return <LoadDiv className="mTop90" />;
  }

  const renderFormInfo = forData => {
    return forData.map(item => {
      return (
        <div
          className={cx('formItem mBottom15 Relative', { w100: _.includes(['privateKey', 'publicKey'], item.field) })}
          key={item.field}
        >
          {isSubmit && (item.field !== 'appId' || !isWechat) && !_.trim(formData[item.field]) && (
            <div className="errorMessage">
              <span>{item.placeholder}</span>
              <i className="errorArrow" />
            </div>
          )}
          <div className="Gray_75 mBottom5 bold Relative">
            {(item.field !== 'appId' || !isWechat) && <div className="required">*</div>}
            {item.label}
          </div>
          <div className="form">
            {isWechat && item.field === 'appId' ? (
              loading ? (
                <LoadDiv />
              ) : !!appId ? (
                <div className="disabledForm">{appId}</div>
              ) : (
                <div className="Gray_9e noBindWeiXin">
                  {_l('暂未绑定认证的服务号，')}
                  <a href={`/admin/weixin/${projectId}`} className="ThemeColor">
                    {_l('请前往组织后台')}
                  </a>
                  {_l('添加微信服务号')}
                </div>
              )
            ) : (
              <Textarea
                className={`w100 placeholderColor ${
                  _.includes(['privateKey', 'publicKey'], item.field) ? '' : 'isSingleLine'
                }`}
                style={{ maxHeight: 350 }}
                value={formData[item.field]}
                placeholder={item.placeholder}
                onChange={value => {
                  setFormData({
                    [item.field]: value,
                    isSubmit: !value,
                    formChanged: _.trim(value) !== initData[item.field],
                  });
                }}
              />
            )}
          </div>
        </div>
      );
    });
  };

  return (
    <Fragment>
      <div className="orgManagementHeader">
        <div className="createMerchantHeader bold Font17">
          <Icon icon="backspace" className="Font22 ThemeHoverColor3 pointer mRight10" onClick={onClose} />
          {isWechat ? _l('微信支付') : _l('支付宝支付')}
        </div>
      </div>
      <div className="orgManagementContent createMerchantContent">
        <div className="description pLeft15 mBottom30">
          {isWechat ? (
            <Fragment>
              <div>
                <span className="TxtMiddle mRight5">{_l('1、支付费率及提现费率可在您的')}</span>
                <a target="_blank" href="https://pay.weixin.qq.com">{_l('微信支付商户平台')}</a>
                <span className="TxtMiddle mLeft5">{_l('查看')}</span>
              </div>
              {md.global.Config.IsLocal ? (
                <div>{_l('2、资金直达微信，本平台仅收取商户功能费')}</div>
              ) : (
                <div>
                  <span className="TxtMiddle mRight5">
                    {_l('2、资金直达微信，本平台仅收取商户功能费，支持先试用后付费，点击')}
                  </span>
                  <a target="_blank" href={`/upgrade/choose?projectId=${projectId}`}>{_l('查看具体费用')}</a>
                </div>
              )}
              <div>{_l('3、密钥、证书等字段信息采用动态加密存储，保存后掩码显示，保障信息安全')}</div>
              <div>
                <span className="TxtMiddle mRight5"> {_l('4、配置内容请参考')}</span>
                <a target="_blank" href={`${md.global.Config.WebUrl}wechatmerchantguide`}>{_l('商户号配置指引')}</a>
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div>
                <span className="mRight5"> {_l('1、支付费率及提现费率可在您的')}</span>
                <a target="_blank" href="https://b.alipay.com">{_l('支付宝商户平台')}</a>
                <span className="TxtMiddle mLeft5">{_l('查看')}</span>
              </div>
              {md.global.Config.IsLocal ? (
                <div>{_l('2、资金直达支付宝，本平台仅收取商户功能费')}</div>
              ) : (
                <div>
                  <span className="TxtMiddle mRight5">
                    {_l('2、资金直达支付宝，本平台仅收取商户功能费，支持先试用后付费，点击')}
                  </span>
                  <a target="_blank" href={`/upgrade/choose?projectId=${projectId}`}>{_l('查看具体费用')}</a>
                </div>
              )}
              <div>{_l('3、支付宝退款退费：退款时服务费不退回，请及时充值保证后续退款成功')}</div>
              <div>{_l('4、密钥、证书等字段信息采用动态加密存储，保存后掩码显示，保障信息安全')}</div>
              <div>
                <span className="TxtMiddle mRight5"> {_l('5、配置内容请参考')}</span>{' '}
                <a target="_blank" href={`${md.global.Config.WebUrl}alimerchantguide`}>{_l('商户号配置指引')}</a>
              </div>
            </Fragment>
          )}
        </div>
        {renderFormInfo(formInfo)}
        {!isCreate && (
          <Fragment>
            <div className="Gray_75 mBottom5 bold">{_l('密钥信息')}</div>
            <div className="secretWrap flexRow Relative">
              <div className="flex">
                {secretFormInfo.map(item => (
                  <div className="flexRow mBottom10">
                    <div>{item.label}：</div>
                    <div className="flex ellipsis">{initData[item.field]}</div>
                  </div>
                ))}
              </div>
              <div>
                <i
                  className="icon icon-edit Gray_9d Hand Hover_21 Font18 Absolute"
                  onClick={() => setShowSecretDialog(true)}
                />
              </div>
            </div>
            <div className="Gray_75 Font12 mTop10">
              <i className="icon icon-task-setting_promet Gray_9d mRight5" />
              {_l('出于安全考虑，原始密钥信息不能直接编辑，点击上方按钮进行替换更新')}
            </div>
          </Fragment>
        )}
        <div className="mTop50 mBottom20">
          <Button
            className="submit"
            disabled={loading || (isWechat && !appId) || (!isCreate && shortName === initData.shortName)}
            onClick={() => checkMerchant('save')}
          >
            {_l('保存')}
          </Button>
        </div>
      </div>

      {showSecretDialog && (
        <Dialog
          className={cx('secretDialog', { secretScrollDialog: isScroll })}
          width={880}
          bodyClass="secretBody"
          visible={showSecretDialog}
          title={_l('密钥信息')}
          okText={_l('去验证')}
          okDisabled={!formChanged}
          onOk={() => checkMerchant('check')}
          onCancel={() => {
            setFormData(clearSecretInfo(appId));
            setShowSecretDialog(false);
          }}
        >
          <div className="Font14 Gray_75 mBottom20">
            {_l('修改配置后，需支付0.01元验证您填写的商户信息，支付成功后自动保存')}
          </div>
          {renderFormInfo(secretFormInfo)}
        </Dialog>
      )}
    </Fragment>
  );
}
