import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import { Select } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Button, Dialog, Icon, Input, LoadDiv, QiniuUpload, Support } from 'ming-ui';
import { captcha } from 'ming-ui/functions';
import accountApi from 'src/api/account';
import merchantInvoiceApi from 'src/api/merchantInvoice';
import orderApi from 'src/api/order';
import paymentApi from 'src/api/payment';
import userApi from 'src/api/user';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import { Step, StepsWrap } from 'src/pages/Admin/pay/components/StepsWrap';
import UploadFile from 'src/pages/worksheet/components/DialogImportExcelCreate/DialogUpload/UploadFile';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductType } from 'src/utils/enum';
import { STEPS } from '../config';

const DivideLine = styled.div`
  width: 1px;
  border-right: 1px solid #f0f0f0;
  margin: -24px 34px 0 30px;
`;

const Description = styled.div`
  background: rgba(33, 150, 243, 0.05);
  border-radius: 5px;
  padding: 8px 10px;
  color: #9e9e9e;
  margin-bottom: 32px;
  color: #151515;
`;

const StepContentWrap = styled.div`
  overflow: hidden;
  padding-inline: 10px;
  margin-inline: -10px;
  .title {
    font-size: 19px;
    font-weight: bold;
  }

  .formLabelText {
    font-weight: 600;
    color: #757575;
    margin: 20px 0 6px;
    .required {
      color: #f44336;
      font-weight: bold;
      font-size: 14px;
    }
  }
  .tips {
    font-size: 12px;
    margin-top: 10px;
    color: #bdbdbd;
  }

  .certLink {
    height: 36px;
    line-height: 36px;
    border-radius: 3px;
    background: #f7f7f7;
    border: 1px solid #e0e0e0;
    color: #1677ff;
    padding-left: 12px;
    cursor: pointer;
    &:hover {
      color: #1565c0;
    }
  }
  .taxNoInput {
    height: 36px;
    background: #fafafa;
    border-radius: 3px;
    line-height: 36px;
    padding: 0 10px;
  }
  input {
    font-size: 13px !important;
    border-color: #ddd !important;
    &::placeholder {
      color: #bdbdbd !important;
    }
    &:hover {
      border-color: #bbb !important;
    }
    &:focus {
      border-color: #1677ff !important;
    }
    &:disabled {
      background-color: #fafafa;
    }
  }
  .line {
    height: 1px;
    background: #f0f0f0;
    margin: 10px 0 20px;
  }
  .secretWrap {
    width: 50%;
    background: #f8f8f8;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
    padding: 14px 16px 4px 20px;
    align-items: center;
    .icon-edit {
      right: 16px;
      top: 40%;
    }
  }
`;

let timer = null;

export default function CreateTaxNumber(props) {
  const { projectId, curTaxNo, curTaxInfo } = props;
  const [step, setStep] = useState(curTaxNo ? 2 : 0);
  const [data, setData] = useSetState(
    md.global.Config.IsLocal && curTaxNo && curTaxInfo
      ? {
          companyName: curTaxInfo.companyName,
          taxNo: curTaxInfo.taxNo,
          taxId: curTaxNo,
        }
      : { taxNo: curTaxNo, email: curTaxNo ? props.email : '' },
  );

  //第一步
  const [loading, setLoading] = useState(!md.global.Config.IsLocal);
  const [certList, setCertList] = useState([]);
  const [codeSending, setCodeSending] = useState(false);
  const [sendCodeText, setSendCodeText] = useState(_l('获取验证码'));
  const [trialDialogVisible, setTrialDialogVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [pwdDialogVisible, setPwdDialogVisible] = useState(false);

  //第三步
  const [productLoading, setProductLoading] = useState(!!curTaxNo);
  const [productList, setProductList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [productUpdating, setProductUpdating] = useState(false);
  const inputRef = useRef(null);

  const {
    certId,
    certSource,
    taxNo,
    email,
    emailCode,
    companyName,
    account,
    password,
    appKey,
    appSecret,
    salt,
    taxId,
  } = data;

  useEffect(() => {
    curTaxNo ? getProductList() : getData();
  }, [curTaxNo]);

  const getProductList = () => {
    setProductLoading(true);
    merchantInvoiceApi
      .getInvoiceProducts({ projectId, taxNo })
      .then(res => {
        setProductList(res.products);
        setProductLoading(false);
      })
      .catch(() => {
        setProductLoading(false);
      });
  };

  const getData = () => {
    if (md.global.Config.IsLocal) {
      return;
    }

    Promise.all([userApi.getAccountBaseInfo(), paymentApi.getAllMerchantInvoiceTaxNo({ projectId })]).then(
      ([accountInfo, companyList]) => {
        setData({ email: accountInfo.email });
        if (companyList.length) {
          const list = companyList.map(item => ({
            label: item.companyName,
            value: item.id,
            ..._.pick(item, ['taxNo', 'source']),
          }));
          const optionList = [
            { label: _l('已认证主体'), options: list.filter(item => item.source === 0) },
            { label: _l('已开通商户主体'), options: list.filter(item => item.source === 1) },
          ].filter(o => o.options.length);
          setCertList(optionList);
          const firstOption = optionList[0]?.options[0];
          setData({ certId: firstOption?.value, taxNo: firstOption?.taxNo, certSource: firstOption?.source });
        }
        setLoading(false);
      },
    );
  };

  // 验证码倒计时
  const countdown = () => {
    let seconds = 30;
    timer = setInterval(() => {
      if (seconds <= 0) {
        setCodeSending(false);
        setSendCodeText(_l('获取验证码'));
        clearInterval(timer);
      } else {
        setSendCodeText(_l('%0秒后重发', seconds));
        seconds--;
      }
    }, 1000);
  };

  // 发送邮箱验证码
  const onSendEmailCode = () => {
    if (codeSending) return;

    const callback = function (res) {
      if (res.ret !== 0) {
        return;
      }

      setCodeSending(true);
      setSendCodeText(_l('发送中...'));

      accountApi
        .sendVerifyCode({
          account: email,
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.global.getCaptchaType(),
        })
        .then(data => {
          if (data === 1) {
            alert(_l('验证码发送成功'), 1);
            inputRef?.current?.focus();
            countdown();
          } else {
            if (data === 8) {
              alert(_l('请先完成图形验证'), 2);
            } else if (data === 10) {
              alert(_l('发送数量超过限制'), 2);
            } else {
              alert(_l('验证码发送失败'), 2);
            }
            setCodeSending(false);
            setSendCodeText(_l('获取验证码'));
          }
        });
    };

    new captcha(callback);
  };

  const onValidate = () => {
    if (!md.global.Config.IsLocal) {
      if (!taxNo) {
        alert(_l('开票主体不能为空'), 3);
        return;
      }

      if (!email?.trim()) {
        alert(_l('请输入邮箱'), 3);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert(_l('请输入正确的邮箱'), 3);
        return;
      }

      if (!emailCode?.trim()) {
        alert(_l('请输入邮箱验证码'), 3);
        return;
      }

      return true;
    }

    if (!companyName?.trim()) {
      alert(_l('请输入开票主体'), 3);
      return;
    }

    if (!taxNo?.trim()) {
      alert(_l('请输入企业税号'), 3);
      return;
    }

    if (!account?.trim()) {
      alert(_l('请输入百望账号'), 3);
      return;
    }

    if (!password?.trim()) {
      alert(_l('请输入百望密码'), 3);
      return;
    }

    if (!appKey?.trim()) {
      alert(_l('请输入AppKey'), 3);
      return;
    }

    if (!appSecret?.trim()) {
      alert(_l('请输入AppSecret'), 3);
      return;
    }

    if (!salt?.trim()) {
      alert(_l('请输入用户盐值'), 3);
      return;
    }

    return true;
  };

  const checkTaxNo = () => {
    if (onValidate()) {
      merchantInvoiceApi.checkTaxInfo({ projectId, taxNo }).then(res => {
        !res
          ? setTrialDialogVisible(true)
          : Dialog.confirm({
              title: _l('当前税号已在其他组织开通'),
              description: _l('当前企业税号已在其他组织开通电子开票服务；每个税号仅能开通一次，当前组织不可重复开通。'),
              okText: _l('知道了'),
              removeCancelBtn: true,
            });
      });
    }
  };

  const onApplyTax = async () => {
    setCreateLoading(true);

    try {
      const createRes = await merchantInvoiceApi.createTaxInfo({
        projectId,
        certId,
        certSource,
        email: email.trim(),
        emailCode: emailCode.trim(),
      });
      const orderRes = await orderApi.addMerchantInvoiceOrder({
        projectId,
        productType: VersionProductType.invoice,
        productOrderType: 0, //试用
        productDetailId: taxNo,
        num: 1,
        startDate: moment().format('YYYY-MM-DD'),
        endDate: moment().add(6, 'day').format('YYYY-MM-DD'),
      });

      if (createRes && orderRes) {
        setStep(step + 1);
        setTrialDialogVisible(false);
      } else {
        alert(_l('创建开票税号失败'), 2);
      }
    } finally {
      setCreateLoading(false);
    }
  };

  const onPrivateCreateTax = () => {
    if (!onValidate()) return;

    const cleanedData = _.mapValues({ companyName, taxNo, account, password, appKey, appSecret, salt }, value =>
      _.isString(value) ? value.trim() : value,
    );

    merchantInvoiceApi
      .createTaxInfo({
        projectId,
        ..._.pick(cleanedData, ['companyName', 'taxNo']),
        merchantTaxInfoConfig: _.pick(cleanedData, ['account', 'password', 'appKey', 'appSecret', 'salt']),
      })
      .then(res => {
        if (res) {
          setStep(step + 1);
          setData({ taxId: res.id, account: '', password: '' });
        } else {
          alert(_l('创建开票税号失败'), 2);
        }
      });
  };

  const onUploaded = fileUrl => {
    setProductUpdating(true);
    console.log('fileUrl', fileUrl);

    merchantInvoiceApi
      .uploadProductExcel({ projectId, taxNo, url: fileUrl })
      .then(res => {
        setProductList(res.products);
        setProductUpdating(false);
      })
      .catch(() => {
        setProductUpdating(false);
      });
  };

  const productColumns = [
    { title: _l('项目名称'), dataIndex: 'projectName', ellipsis: true, fixed: 'left', width: '100' },
    { title: _l('税收服务简称'), dataIndex: 'categoryName', ellipsis: true, fixed: 'left' },
    { title: _l('税收服务编码'), dataIndex: 'categoryCode', width: '7%' },
    { title: _l('税率'), dataIndex: 'taxRate' },
    { title: _l('含税标记'), dataIndex: 'isTaxIncluded', render: text => (text ? _l('含税') : _l('不含税')) },
    { title: _l('是否享受优惠政策'), dataIndex: 'isInDiscountPolicy', render: text => (text ? _l('是') : _l('否')) },
    { title: _l('商品UUID'), dataIndex: 'productId', width: '7%' },
    { title: _l('商品分类UUID'), dataIndex: 'projectCategoryCode' },
    { title: _l('规格型号'), dataIndex: 'specification' },
    { title: _l('单位'), dataIndex: 'unit' },
    { title: _l('单价'), dataIndex: 'price' },
    { title: _l('简码'), dataIndex: 'shortCode' },
    { title: _l('增值税简易计税类型'), dataIndex: 'discountPolicyType' },
  ];

  return (
    <div className="flexRow flex">
      <StepsWrap direction="vertical" current={step} onChange={current => setStep(current)}>
        {STEPS.map((item, index) => {
          return (
            <Step
              key={index}
              title={item.title}
              disabled={step === 0 && !taxId ? index > 0 : md.global.Config.IsLocal ? false : index === 0}
              status={step === index ? 'process' : index < step ? 'finish' : ''}
            />
          );
        })}
      </StepsWrap>
      <DivideLine />

      <StepContentWrap className="flex">
        <Description>
          {step === 0 &&
            (!md.global.Config.IsLocal ? (
              <Fragment>
                <div>
                  {_l('1、完成组织的企业认证或已有支付商户号即可创建开票税号。每个开票税号开通后，享有 7 天免费试用')}
                </div>
                <div>
                  <span>{_l('2、电子发票由知名数电开票合作服务商')}</span>
                  <span
                    className="ThemeColor3 ThemeHoverColor2 pointer mLeft3 mRight3"
                    onClick={() => window.open('https://www.baiwang.com/')}
                  >
                    {_l('百望')}
                  </span>
                  <span>{_l('提供。开票资料需与营业执照信息 保持一致，且真实有效')}</span>
                </div>
                <div>{_l('3、已有百望账号？请联系组织管理员或平台客服人员，协助完成账号绑定')}</div>
                <div>
                  <span>{_l('4、开票税号创建流程可参考')}</span>
                  <Support
                    className="mBottom2"
                    type={3}
                    href="https://help.mingdao.com/org/invoice"
                    text={_l('帮助文档')}
                  />
                </div>
              </Fragment>
            ) : (
              <Fragment>
                <div>
                  <span>{_l('1、电子发票由合作服务商')}</span>
                  <span
                    className="ThemeColor3 ThemeHoverColor2 pointer mLeft3 mRight3"
                    onClick={() => window.open('https://www.baiwang.com/')}
                  >
                    {_l('百望')}
                  </span>
                  <span>{_l('提供，开票资料需与营业执照信息一致、真实有效。')}</span>
                </div>
                <div>{_l('2、填写信息前请联系平台顾问协助开通百望云账号。')}</div>
                <div>
                  <span>{_l('3、开票税号创建流程遇到问题可咨询平台顾问')}</span>
                </div>
              </Fragment>
            ))}
          {step === 1 && (
            <div>
              <span>
                {_l('请您先在百望完成企业信息与登录验证等配置，否则无法开票。')}
                {md.global.Config.IsLocal ? '' : _l('具体操作步骤请查看')}
              </span>
              {!md.global.Config.IsLocal && (
                <Support
                  className="mBottom2"
                  type={3}
                  href="https://help.mingdao.com/org/invoice"
                  text={_l('帮助文档')}
                />
              )}
            </div>
          )}
          {step === 2 && (
            <Fragment>
              <div>{_l('1、导入的“商品管理表”将作为开票时选择的商品类目/税收分类编码的数据来源。')}</div>
              <div>{_l('2、电子税局的商品管理表有更新时，请重新导入以同步最新税率与编码。')}</div>
            </Fragment>
          )}
        </Description>

        {step === 0 &&
          (loading ? (
            <LoadDiv />
          ) : (
            <Fragment>
              <div className="title">{_l('填写开票税号')}</div>
              {md.global.Config.IsLocal && (
                <div className="bold mTop12">
                  <span>{_l('请前往')}</span>
                  <span
                    className="mLeft5 mRight5 ThemeColor ThemeHoverColor2 pointer"
                    onClick={() => window.open('https://work.baiwang.com')}
                  >
                    {_l('百望发票-开放平台')}
                  </span>
                  <span>{_l('完成以下配置')}</span>
                </div>
              )}
              <div className="formLabelText">
                {_l('开票主体(销方)')}
                <span className="required">*</span>
              </div>

              {md.global.Config.IsLocal ? (
                <Input
                  className="w100"
                  placeholder={_l('请输入开票主体')}
                  disabled={!!taxId}
                  value={companyName}
                  onChange={value => setData({ companyName: value })}
                />
              ) : _.isEmpty(certList) ? (
                <div className="certLink" onClick={() => navigateTo(`/admin/sysinfo/${projectId}`)}>
                  {_l('完成组织认证')}
                </div>
              ) : (
                <Select
                  className="w100 mdAntSelect"
                  options={certList}
                  value={certId}
                  onChange={(value, option) => {
                    setData({ certId: value, taxNo: option.taxNo, certSource: option.source });
                  }}
                />
              )}

              <div className="tips">
                {_l('创建后不能更换且不能删除，') +
                  (md.global.Config.IsLocal ? _l('请谨慎填写已付费的主体') : _l('请谨慎选择'))}
              </div>

              <div className="formLabelText">
                {_l('企业税号(统一社会信用代码)')}
                {md.global.Config.IsLocal && <span className="required">*</span>}
              </div>
              {md.global.Config.IsLocal ? (
                <Input
                  className="w100"
                  placeholder={_l('请输入企业税号')}
                  disabled={!!taxId}
                  value={taxNo}
                  onChange={value => setData({ taxNo: value })}
                />
              ) : (
                <div className="taxNoInput">{taxNo}</div>
              )}

              {md.global.Config.IsLocal ? (
                taxId ? (
                  <Fragment>
                    <div className="line"></div>
                    <div className="Gray_75 mBottom5 bold">{_l('百望账户信息')}</div>
                    <div className="secretWrap flexRow Relative">
                      <div className="flex">
                        {[
                          { label: _l('百望账号'), field: 'account' },
                          { label: _l('百望密码'), field: 'password' },
                          { label: _l('AppKey'), field: 'appKey' },
                          { label: _l('AppSecret'), field: 'appSecret' },
                          { label: _l('用户盐值'), field: 'salt' },
                        ].map(item => (
                          <div className="flexRow mBottom10">
                            <div>{item.label}：</div>
                            <div className="flex ellipsis">********************</div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <i
                          className="icon icon-edit Gray_9d Hand Hover_21 Font18 Absolute"
                          onClick={() => setPwdDialogVisible(true)}
                        />
                      </div>
                    </div>
                    <div className="Gray_75 Font12 mTop10 mBottom20">
                      <i className="icon icon-error1 Gray_9d mRight5" />
                      {_l('出于安全考虑，原始账号信息不能直接编辑，点击上方按钮进行替换更新')}
                    </div>
                  </Fragment>
                ) : (
                  <Fragment>
                    <div className="formLabelText">
                      {_l('百望账号')}
                      <span className="required">*</span>
                    </div>
                    <Input
                      className="w100"
                      placeholder={_l('请输入百望账号')}
                      disabled={!!taxId}
                      value={account}
                      onChange={value => setData({ account: value })}
                    />
                    <div className="formLabelText">
                      {_l('百望密码')}
                      <span className="required">*</span>
                    </div>
                    <div className="pwdInputWrapper">
                      <Input
                        className="w100"
                        placeholder={_l('请输入百望密码')}
                        disabled={!!taxId}
                        value={password}
                        onChange={value => setData({ password: value })}
                      />
                    </div>
                    <div className="formLabelText">
                      {_l('AppKey')}
                      <span className="required">*</span>
                    </div>
                    <Input
                      className="w100"
                      placeholder={_l('请输入AppKey')}
                      disabled={!!taxId}
                      value={appKey}
                      onChange={value => setData({ appKey: value })}
                    />
                    <div className="formLabelText">
                      {_l('AppSecret')}
                      <span className="required">*</span>
                    </div>
                    <Input
                      className="w100"
                      placeholder={_l('请输入AppSecret')}
                      disabled={!!taxId}
                      value={appSecret}
                      onChange={value => setData({ appSecret: value })}
                    />
                    <div className="formLabelText">
                      {_l('用户盐值')}
                      <span className="required">*</span>
                    </div>
                    <Input
                      className="w100"
                      placeholder={_l('请输入用户盐值')}
                      disabled={!!taxId}
                      value={salt}
                      onChange={value => setData({ salt: value })}
                    />
                  </Fragment>
                )
              ) : (
                <Fragment>
                  <div className="formLabelText">
                    {_l('联系邮箱')}
                    <span className="required">*</span>
                  </div>
                  <div className="flexRow alignItemsCenter">
                    <Input
                      className="flex"
                      placeholder={_l('请输入邮箱')}
                      value={email}
                      onChange={value => setData({ email: value })}
                    />
                    <Button
                      className="mLeft12"
                      disabled={
                        !email || sendCodeText !== _l('获取验证码') || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                      }
                      onClick={onSendEmailCode}
                    >
                      {sendCodeText}
                    </Button>
                  </div>
                  <div className="tips">{_l('用于接收百望账号开通等消息通知，已有百望账号时不会发送账号信息')}</div>

                  <div className="formLabelText">
                    {_l('验证码')}
                    <span className="required">*</span>
                  </div>
                  <div className="w100">
                    <Input
                      manualRef={inputRef}
                      className="Width200"
                      placeholder={_l('请输入邮箱验证码')}
                      value={emailCode}
                      onChange={value => setData({ emailCode: value })}
                    />
                  </div>
                </Fragment>
              )}

              {!taxId ? (
                <Button
                  className="mTop32 mBottom24"
                  onClick={
                    md.global.Config.IsLocal ? (!taxId ? onPrivateCreateTax : () => setStep(step + 1)) : checkTaxNo
                  }
                >
                  {_l('下一步')}
                </Button>
              ) : null}

              {trialDialogVisible && (
                <Dialog
                  visible
                  title={_l('开通7天试用')}
                  description={_l(
                    '为当前开票税号开启 7 天免费试用，期间可正常开票；到期自动停用，购买后可继续使用。每个税号仅一次试用。',
                  )}
                  okText={createLoading ? _l('开通中...') : _l('确认开通')}
                  okDisabled={createLoading}
                  onOk={onApplyTax}
                  onCancel={() => setTrialDialogVisible(false)}
                />
              )}

              {pwdDialogVisible && (
                <Dialog
                  visible
                  title={_l('百望账号信息')}
                  description={_l('修改前请确保已在百望完成了重置密码')}
                  okText={_l('保存')}
                  onOk={() => {
                    merchantInvoiceApi
                      .updateTaxInfoChannelPassword({ projectId, taxNo, account, password })
                      .then(res => {
                        if (res) {
                          alert(_l('保存成功'));
                          setPwdDialogVisible(false);
                          setData({ account: '', password: '' });
                        } else {
                          alert(_l('请输入正确的账号密码'), 2);
                        }
                      });
                  }}
                  onCancel={() => {
                    setPwdDialogVisible(false);
                    setData({ account: '', password: '' });
                  }}
                >
                  <div className="Gray_75 bold mTop4 mBottom6">{_l('百望账号')}</div>
                  <Input className="w100" value={account} onChange={value => setData({ account: value })} />
                  <div className="Gray_75 bold mTop20 mBottom6">{_l('百望密码')}</div>
                  <Input className="w100" value={password} onChange={value => setData({ password: value })} />
                </Dialog>
              )}
            </Fragment>
          ))}

        {step === 1 && (
          <Fragment>
            <div className="title">{_l('完善开票配置')}</div>
            <div className="Font15 bold mTop24">
              <span>{_l('请前往')}</span>
              <span
                className="mLeft5 mRight5 ThemeColor ThemeHoverColor2 pointer"
                onClick={() => window.open('https://work.baiwang.com')}
              >
                {_l('百望开票平台')}
              </span>
              <span>{_l('完成以下配置')}</span>
            </div>
            <div className="mTop20">
              <span className="bold">{_l('1.登录百望：')}</span>
              <span>{_l('使用邮件中的账号登录')}</span>
              <span className="Gray_9e">{_l('（账号与初始密码已发送至')}</span>
              <span className="ThemeColor mLeft4">{email}</span>
              <span className="Gray_9e mLeft4">{'）'}</span>
            </div>
            <div className="mTop16">
              <span className="bold">{_l('2.开票配置：')}</span>
              <span>{_l('开启并确认开票登录验证（验证码/人脸认证）以保障自动开票')}</span>
            </div>
            <Button className="mTop36" onClick={() => setStep(step + 1)}>
              {_l('下一步')}
            </Button>
          </Fragment>
        )}

        {step === 2 && (
          <Fragment>
            <div className="flexRow alignItemsCenter">
              <div className="title flex">{_l('导入商品管理表')}</div>

              {!productLoading && !!productList.length && (
                <QiniuUpload
                  options={{
                    type: 60,
                    multi_selection: false,
                    filters: { mime_types: [{ extensions: 'xls,xlsx,csv' }] },
                    max_file_size: '20m',
                  }}
                  bucket={3}
                  onUploaded={(up, file) => {
                    onUploaded(file.url);
                    setUploading(false);
                    up.disableBrowse(false);
                  }}
                  onAdd={up => {
                    setUploading(true);
                    up.disableBrowse();
                  }}
                  onError={(up, err, errTip) => {
                    alert(errTip, 2);
                  }}
                >
                  <Button disabled={uploading}>{uploading ? _l('更新中...') : _l('更新')}</Button>
                </QiniuUpload>
              )}
            </div>
            <div className="Font12 Gray_75 mTop16 mBottom20">
              <span>{_l('请先前往')}</span>
              <span
                className="ThemeColor ThemeHoverColor2 pointer mLeft5 mRight5"
                onClick={() => window.open('https://tpass.chinatax.gov.cn:8443/#/login?client_type=itsLogin')}
              >
                {_l('电子税局')}
              </span>
              <span>{_l('下载商品管理表，然后导入数据')}</span>
            </div>
            {productLoading ? (
              <LoadDiv />
            ) : productList.length ? (
              <PageTableCon
                paginationInfo={{ pageIndex: 1, pageSize: productList.length }}
                loading={productUpdating}
                columns={productColumns}
                dataSource={productList}
                count={productList.length}
              />
            ) : (
              <UploadFile fileUploaded={file => onUploaded(file.url)} type={60} />
            )}
          </Fragment>
        )}
      </StepContentWrap>
    </div>
  );
}
