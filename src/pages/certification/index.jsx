import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import DocumentTitle from 'react-document-title';
import { Icon, Button, Dropdown, Input, Avatar } from 'ming-ui';
import { Form, DatePicker, Popover } from 'antd';
import enterpriseImg from './images/enterprise.png';
import personalImg from './images/personal.png';
import marketplacePaymentApi from 'src/api/marketplacePayment';
import UploadCertificate from './UploadCertificate';
import accountApi from 'src/api/account';
import { captcha } from 'ming-ui/functions';
import certificationApi from 'src/api/certification';
import { getRequest } from 'src/util';
import localeZhCn from 'antd/es/date-picker/locale/zh_CN';
import localeJaJp from 'antd/es/date-picker/locale/ja_JP';
import localeZhTw from 'antd/es/date-picker/locale/zh_TW';
import localeEn from 'antd/es/date-picker/locale/en_US';
import moment from 'moment';
import Trigger from 'rc-trigger';
import HelpCollection from 'src/pages/PageHeader/components/CommonUserHandle/HelpCollection';
import developerGroupImg from './images/developer-group.png';

const { RangePicker } = DatePicker;

const Wrapper = styled.div`
  background: #fff;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .headerBar {
    display: flex;
    align-items: center;
    height: 56px;
    padding: 0 24px;
    box-shadow: 0px 1px 2px 1px rgba(0, 0, 0, 0.16);
    .backBtn {
      width: fit-content;
      font-size: 17px;
      font-weight: 500;
      &:hover {
        color: #2196f3;
      }
    }
    .helpWrap {
      width: 72px;
      height: 32px;
      line-height: 32px;
      border-radius: 20px;
      padding-left: 10px;
      margin-right: 20px;
      cursor: pointer;
      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }
    }
  }
  .contentWrap {
    flex: 1;
    overflow: auto;
    .successIcon {
      font-size: 80px;
      color: #4caf50;
    }
  }

  .formContent {
    width: 960px;
    margin: 0 auto;

    .explain {
      background: #f2fafe;
      border-radius: 3px;
      padding: 12px 20px;
      margin-top: 20px;
      font-size: 13px;
      color: #151515;
    }
    .moduleTitle {
      font-size: 15px;
      font-weight: 600;
      padding: 32px 0 10px;
      border-bottom: 1px solid #ccc;
      margin-bottom: 16px;
    }
    .ant-form-item {
      margin-bottom: 0;
      .ant-form-item-required {
        font-size: 13px !important;
        color: #757575 !important;
        font-weight: bold;
      }
      .ant-form-item-explain-error {
        margin-top: 4px;
        font-size: 12px;
      }

      &:not(&.isLast) {
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 16px;
        margin-bottom: 16px;
      }
    }
    input {
      width: 100%;
      border-color: #ddd;
      font-size: 13px;
      &:hover {
        border-color: #ccc;
      }
      &:focus {
        border-color: #1e88e5 !important;
      }
      &::placeholder {
        color: #bdbdbd;
      }
    }
    .verifyWrapper {
      display: flex;
      align-items: end;
      .codeInput {
        width: 50%;
        margin-top: 10px;
      }
    }
    .mTop56 {
      margin-top: 56px;
    }
  }
`;

const TypeCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 490px;
  height: 380px;
  padding: 24px;
  cursor: pointer;
  border-radius: 14px;
  &:hover {
    background: #fafafa;
  }
  img {
    width: 100px;
  }
`;

const CommonRangePicker = styled(RangePicker)`
  width: 50%;
  height: 36px;
  border-radius: 4px !important;
  border-color: #ccc;
  box-shadow: none !important;
  &:hover,
  &.ant-picker-focused {
    border-color: #2196f3;
  }
`;

const types = [
  {
    key: 'enterprise',
    text: _l('企业认证'),
    description: _l('使用企业营业执照认证，自动审核，无需等待'),
    value: 2,
  },
  {
    key: 'personal',
    text: _l('个人认证'),
    description: _l('使用个人身份证认证，自动审核，无需等待'),
    value: 1,
  },
];

export const SOURCE_TYPE = {
  personal: 0,
  project: 1,
  market: 2,
};

let timer = null;
export default function Certification(props) {
  const { certSource, projectId } = _.get(props, 'match.params');
  const { type, returnUrl } = getRequest();
  const [currentPage, setCurrentPage] = useState(
    certSource === 'personal' ? 'personal' : type === 'upgrade' ? 'enterprise' : '',
  );
  const [bizLicenseOCRInfo, setBizLicenseOCRInfo] = useState({});
  const [iDCardOCRFrontInfo, setIDCardOCRFrontInfo] = useState({});
  const [iDCardOCRBackInfo, setIDCardOCRBackInfo] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [sendCodeText, setSendCodeText] = useState(_l('获取验证码'));
  const [showCodeField, setShowCodeField] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [form] = Form.useForm();

  const locales = { 'zh-Hans': localeZhCn, 'zh-Hant': localeZhTw, en: localeEn, ja: localeJaJp };
  const locale = locales[md.global.Account.lang];

  useEffect(() => {
    if (['personal', 'enterprise'].includes(currentPage)) {
      certSource === 'personal' || type === 'upgrade'
        ? checkIsCert(currentPage === 'personal' ? 1 : 2, getCertFailedInfo)
        : getCertFailedInfo();
    }
  }, [currentPage]);

  const checkIsCert = (authType, callback = () => {}) => {
    certificationApi.checkIsCert({ projectId, authType, certSource: SOURCE_TYPE[certSource] }).then(res => {
      if (res) {
        alert(_l('已认证，不支持重复认证'), 3);
        setTimeout(() => {
          (certSource === 'personal' || type === 'upgrade') &&
            returnUrl &&
            (location.href = decodeURIComponent(returnUrl));
        }, 1000);
      } else {
        callback();
      }
    });
  };

  const checkIsCertByCertNo = ({ idNumber, creditCode }) => {
    certificationApi.checkIsCertByCertNo({ idNumber, creditCode }).then(res => {
      res && alert(idNumber ? _l('身份证已认证，不支持重复认证') : _l('营业执照已认证，不支持重复认证'), 3);
    });
  };

  const getCertFailedInfo = () => {
    certificationApi
      .getCertFailedInfo({
        authType: currentPage === 'personal' ? 1 : 2,
        certSource: SOURCE_TYPE[certSource],
        projectId,
      })
      .then(res => {
        if (res) {
          const { authType, personalInfo, enterpriseInfo = {} } = res;
          const { idCardFront, idCardFrontUrl, idCardBack, idCardBackUrl, idCardValidDateStart, idCardValidDateEnd } =
            personalInfo || {};
          const {
            legalName,
            legalIdCardFront,
            legalIdCardFrontUrl,
            legalIdCardBack,
            legalIdCardBackUrl,
            legalIdCardValidDateStart,
            legalIdCardValidDateEnd,
            businessLicense,
            businessLicenseUrl,
            businessLicenseValidDateStart,
            businessLicenseValidDateEnd,
          } = enterpriseInfo || {};

          let defaultValues = {};
          let idCardFrontKey = '';
          let idCardBackKey = '';

          if (authType === 1) {
            defaultValues = {
              ..._.pick(personalInfo, ['idNumber', 'fullName', 'mobile']),
              idCardFront: { key: idCardFront, url: idCardFrontUrl },
              idCardBack: { key: idCardBack, url: idCardBackUrl },
              idCardValidDate: [moment(idCardValidDateStart), moment(idCardValidDateEnd)],
            };
            idCardFrontKey = idCardFront;
            idCardBackKey = idCardBack;
            setShowCodeField(true);
          } else {
            defaultValues = {
              ..._.pick(enterpriseInfo, ['enterpriseType', 'companyName', 'creditCode', 'idNumber', 'mobile']),
              fullName: legalName,
              idCardFront: { key: legalIdCardFront, url: legalIdCardFrontUrl },
              idCardBack: { key: legalIdCardBack, url: legalIdCardBackUrl },
              idCardValidDate: [moment(legalIdCardValidDateStart), moment(legalIdCardValidDateEnd)],
              businessLicense: { key: businessLicense, url: businessLicenseUrl },
              creditValidDate: [moment(businessLicenseValidDateStart), moment(businessLicenseValidDateEnd)],
            };
            idCardFrontKey = legalIdCardFront;
            idCardBackKey = legalIdCardBack;
            setBizLicenseOCRInfo({ resultCode: 1, key: businessLicense });
          }

          form.setFieldsValue(defaultValues);
          setIDCardOCRFrontInfo({ resultCode: 1, key: idCardFrontKey });
          setIDCardOCRBackInfo({ resultCode: 1, key: idCardBackKey });
        }
      });
  };

  const formatCreditDate = period => {
    const dateArr = period.split('至');
    const startDate = moment(dateArr[0], 'YYYY年MM月DD日');
    const endDate = dateArr[1] === '长期' ? moment('2099-12-31') : moment(dateArr[1], 'YYYY年MM月DD日');
    return [startDate, endDate];
  };

  const onSubmit = () => {
    form.validateFields().then(values => {
      const {
        businessLicense,
        legalIdCard,
        idCardFront,
        idCardBack,
        idCardValidDate,
        verifyCode,
        fullName,
        creditValidDate,
        ...other
      } = values;
      const data = {};
      // 个人
      if (currentPage === 'personal') {
        data.certSource = SOURCE_TYPE[certSource];
        data.projectId = projectId;
        data.verifyCode = verifyCode;
        data.personalInfo = {
          bucket: 3,
          idType: 1,
          idCardFront: _.get(idCardFront, 'key'),
          idCardBack: _.get(idCardBack, 'key'),
          idCardValidDateStart: moment(idCardValidDate[0]).format('YYYY-MM-DD'),
          idCardValidDateEnd: moment(idCardValidDate[1]).format('YYYY-MM-DD'),
          fullName,
          ...other,
        };
      }
      // 企业
      if (currentPage === 'enterprise') {
        data.certSource = SOURCE_TYPE[certSource];
        data.entityId = projectId;
        data.isUpgrade = type === 'upgrade';
        data.enterpriseInfo = {
          bucket: 3,
          idType: 1,
          businessLicense: _.get(businessLicense, 'key'),
          legalIdCardFront: _.get(idCardFront, 'key'),
          legalIdCardBack: _.get(idCardBack, 'key'),
          businessLicenseValidDateStart: moment(creditValidDate[0]).format('YYYY-MM-DD'),
          businessLicenseValidDateEnd: moment(creditValidDate[1]).format('YYYY-MM-DD'),
          legalIdCardValidDateStart: moment(idCardValidDate[0]).format('YYYY-MM-DD'),
          legalIdCardValidDateEnd: moment(idCardValidDate[1]).format('YYYY-MM-DD'),
          legalName: fullName,
          ...other,
        };
      }
      setSubmitLoading(true);
      (currentPage === 'enterprise'
        ? certificationApi.enterpriseCertification
        : certificationApi.personalCertification)(data)
        .then(data => {
          const resultTypes = {
            0: _l('提交失败'),
            2: _l('已存在相同认证信息'),
            3: _l('人员三要素认证失败'),
            4: _l('企业统一信用代码不一致'),
            5: _l('公司名称不一致'),
            6: _l('企业法人姓名不一致'),
            7: _l('参数错误'),
            8: _l('验证码错误或过期'),
            9: _l('认证信息不存在'),
          };
          if (data === 1) {
            alert(_l('认证信息已提交'));
            setCurrentPage('success');
          } else {
            alert(resultTypes[data] || _l('提交失败'), 2);
          }
        })
        .finally(() => setSubmitLoading(false));
    });
  };

  // 验证营业执照
  const onValidateBizLicenseOCR = (_, value) => {
    return new Promise((resolve, reject) => {
      const { key, url } = value || {};
      if (key && key !== bizLicenseOCRInfo.key) {
        marketplacePaymentApi.bizLicenseOCR({ projectId: '', url }).then(data => {
          if (data.resultCode === 1) {
            form.setFieldsValue({
              companyName: data.name,
              creditCode: data.regNum,
              creditValidDate: formatCreditDate(data.period),
            });
            setBizLicenseOCRInfo({ ...data, key });
            checkIsCertByCertNo({ creditCode: data.regNum });
            return resolve();
          } else {
            return reject(data.errorMsg);
          }
        });
      } else {
        return resolve();
      }
    });
  };

  // 验证身份证
  const onValidateIDCardOCR = (_, value, callback, isFront) => {
    return new Promise((resolve, reject) => {
      const { key, url } = value || {};

      if (key && key !== (isFront ? iDCardOCRFrontInfo.key : iDCardOCRBackInfo.key)) {
        marketplacePaymentApi.iDCardOCR({ projectId: '', url }).then(data => {
          if (data.resultCode === 1) {
            if (isFront) {
              if (data.idNum) {
                form.setFieldsValue({ fullName: data.name, idNumber: data.idNum });
                setIDCardOCRFrontInfo({ ...data, key });
                currentPage === 'personal' && checkIsCertByCertNo({ idNumber: data.idNum });
              } else {
                return reject(_l('未检测到身份证人像面信息'));
              }
            } else {
              if (data.validDate) {
                const validDate = (data.validDate.split('-') || []).map(item =>
                  moment(item).isValid() ? moment(item) : '',
                );
                form.setFieldsValue({ idCardValidDate: validDate });
                setIDCardOCRBackInfo({ ...data, key });
              } else {
                return reject(_l('未检测到身份证国徽面信息'));
              }
            }
            return resolve();
          } else {
            return reject(data.errorMsg);
          }
        });
      } else {
        return resolve();
      }
    });
  };

  // 获取手机验证码
  const onSendVerifyCode = () => {
    if (codeSending) {
      return;
    }

    const mobileNumber = form.getFieldValue('mobile');

    if (!mobileNumber) {
      alert(_l('手机号不能为空'), 3);
      return;
    }

    if (!/^1[2-9]\d{9}$/.test(mobileNumber)) {
      alert(_l('请输入有效的手机号'), 3);
      return;
    }

    const callback = function (res) {
      if (res.ret !== 0) {
        return;
      }

      setCodeSending(true);
      setSendCodeText(_l('发送中...'));

      accountApi
        .sendVerifyCode({
          account: mobileNumber,
          ticket: res.ticket,
          randStr: res.randstr,
          captchaType: md.global.getCaptchaType(),
        })
        .then(data => {
          if (data === 1) {
            alert(_l('验证码发送成功'), 1);
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
    if (md.global.getCaptchaType() === 1) {
      new captcha(callback);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), callback, { needFeedBack: false }).show();
    }
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

  const renderEnterpriseForm = () => {
    return (
      <React.Fragment>
        <div className="moduleTitle">{_l('企业信息')}</div>
        <Form.Item
          label={_l('企业类型')}
          name="enterpriseType"
          rules={[{ required: true, message: _l('请选择企业类型') }]}
        >
          <Dropdown
            border
            className="w100"
            data={[
              { text: _l('企业'), value: 1 },
              { text: _l('政府/事业单位'), value: 2 },
              { text: _l('其他组织'), value: 3 },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="businessLicense"
          label={_l('营业执照')}
          rules={[{ required: true, message: _l('请上传营业执照') }, () => ({ validator: onValidateBizLicenseOCR })]}
        >
          <UploadCertificate onChange={businessLicense => form.setFieldsValue({ businessLicense })} />
        </Form.Item>

        {bizLicenseOCRInfo.resultCode === 1 && (
          <React.Fragment>
            <Form.Item
              label={_l('公司名称')}
              name="companyName"
              rules={[{ required: true, message: _l('请输入公司名称') }]}
            >
              <Input placeholder={_l('请输入')} />
            </Form.Item>
            <Form.Item
              label={_l('组织信用代码')}
              name="creditCode"
              rules={[
                { required: true, message: _l('请输入组织信用代码') },
                { pattern: /^[A-Z0-9]{18}$/, message: _l('请输入有效的组织信用代码') },
              ]}
            >
              <Input placeholder={_l('请输入')} />
            </Form.Item>
            <Form.Item
              label={_l('营业执照有效期')}
              name="creditValidDate"
              rules={[{ required: true, message: _l('请输入营业执照有效期') }]}
              className="isLast"
            >
              <CommonRangePicker locale={locale} />
            </Form.Item>
          </React.Fragment>
        )}

        <div className="moduleTitle">{_l('法人信息')}</div>
        <div className="flexRow">
          <Form.Item
            name="idCardFront"
            label={_l('法人身份证人像面')}
            rules={[
              { required: true, message: _l('请上传法人身份证人像面') },
              () => ({
                validator: (rule, value, callback) => onValidateIDCardOCR(rule, value, callback, true),
              }),
            ]}
            className="flex"
          >
            <UploadCertificate onChange={legalIdCardFront => form.setFieldsValue({ legalIdCardFront })} />
          </Form.Item>
          <Form.Item
            name="idCardBack"
            label={_l('法人身份证国徽面')}
            rules={[
              { required: true, message: _l('请上传法人身份证国徽面') },
              () => ({ validator: onValidateIDCardOCR }),
            ]}
            className="flex"
          >
            <UploadCertificate onChange={legalIdCardBack => form.setFieldsValue({ legalIdCardBack })} />
          </Form.Item>
        </div>

        {iDCardOCRFrontInfo.resultCode === 1 && (
          <React.Fragment>
            <Form.Item
              label={_l('法人姓名')}
              name="fullName"
              rules={[{ required: true, message: _l('请输入法人姓名') }]}
            >
              <Input placeholder={_l('请输入')} />
            </Form.Item>
            <Form.Item
              label={_l('法人身份证号码')}
              name="idNumber"
              rules={[
                { required: true, message: _l('请输入身份证号码') },
                { pattern: /(^\d{15}$)|(^\d{17}(\d|X|x)$)/, message: _l('请输入有效的身份证号码') },
              ]}
            >
              <Input placeholder={_l('请输入')} />
            </Form.Item>
          </React.Fragment>
        )}
        {iDCardOCRBackInfo.resultCode === 1 && (
          <Form.Item
            label={_l('法人身份证有效期')}
            name="idCardValidDate"
            rules={[{ required: true, message: _l('请输入法人身份证有效期') }]}
          >
            <CommonRangePicker locale={locale} />
          </Form.Item>
        )}
        <Form.Item
          label={_l('法人手机号')}
          name="mobile"
          rules={[
            { required: true, message: _l('请输入手机号') },
            { pattern: /^1[2-9]\d{9}$/, message: _l('请输入有效的手机号') },
          ]}
          className="isLast"
        >
          <Input placeholder={_l('请输入大陆手机号')} />
        </Form.Item>
      </React.Fragment>
    );
  };

  const renderPersonalForm = () => {
    return (
      <React.Fragment>
        <div className="moduleTitle">{_l('个人信息')}</div>
        <div className="flexRow">
          <Form.Item
            name="idCardFront"
            label={_l('身份证人像面')}
            rules={[
              { required: true, message: _l('请上传身份证人像面') },
              () => ({ validator: (rule, value, callback) => onValidateIDCardOCR(rule, value, callback, true) }),
            ]}
            className="flex"
          >
            <UploadCertificate onChange={idCardFront => form.setFieldsValue({ idCardFront })} />
          </Form.Item>
          <Form.Item
            name="idCardBack"
            label={_l('身份证国徽面')}
            rules={[{ required: true, message: _l('请上传身份证国徽面') }, () => ({ validator: onValidateIDCardOCR })]}
            className="flex"
          >
            <UploadCertificate onChange={idCardBack => form.setFieldsValue({ idCardBack })} />
          </Form.Item>
        </div>

        {iDCardOCRFrontInfo.resultCode === 1 && (
          <React.Fragment>
            <Form.Item label={_l('姓名')} name="fullName" rules={[{ required: true, message: _l('请输入姓名') }]}>
              <Input placeholder={_l('请输入')} />
            </Form.Item>
            <Form.Item
              label={_l('身份证号码')}
              name="idNumber"
              rules={[
                { required: true, message: _l('请输入身份证号码') },
                { pattern: /(^\d{15}$)|(^\d{17}(\d|X|x)$)/, message: _l('请输入有效的身份证号码') },
              ]}
            >
              <Input placeholder={_l('请输入')} />
            </Form.Item>
          </React.Fragment>
        )}
        {iDCardOCRBackInfo.resultCode === 1 && (
          <Form.Item
            label={_l('身份证有效期')}
            name="idCardValidDate"
            rules={[{ required: true, message: _l('请输入身份证有效期') }]}
          >
            <CommonRangePicker locale={locale} />
          </Form.Item>
        )}

        <Form.Item
          label={_l('手机号')}
          name="mobile"
          rules={[
            { required: true, message: _l('请输入手机号') },
            { pattern: /^1[2-9]\d{9}$/, message: _l('请输入有效的手机号') },
          ]}
          className="isLast"
        >
          <Input
            placeholder={_l('请输入大陆手机号')}
            onChange={value => {
              setShowCodeField(value && /^1[2-9]\d{9}$/.test(value));
            }}
          />
        </Form.Item>
        {showCodeField && (
          <Form.Item name="verifyCode" rules={[{ required: true, message: _l('请输入验证码') }]} className="isLast">
            <div className="verifyWrapper">
              <Input className="codeInput" placeholder={_l('请输入验证码')} maxlength={6} />
              <Button
                type="primary"
                disabled={sendCodeText !== _l('获取验证码')}
                onClick={onSendVerifyCode}
                className="pLeft16 pRight16 mLeft8"
              >
                {sendCodeText}
              </Button>
            </div>
          </Form.Item>
        )}
      </React.Fragment>
    );
  };

  return (
    <Wrapper>
      <DocumentTitle
        title={
          !currentPage
            ? _l('认证')
            : currentPage === 'success'
            ? _l('认证成功')
            : certSource === 'personal' || currentPage === 'personal'
            ? _l('个人认证')
            : _l('企业认证')
        }
      />
      <div className="headerBar">
        <div
          className="backBtn flexRow alignItemsCenter pointer h100"
          onClick={() => {
            if (currentPage === 'success' || !currentPage || certSource === 'personal' || type === 'upgrade') {
              returnUrl && (location.href = decodeURIComponent(returnUrl));
            } else {
              setCurrentPage('');
            }
          }}
        >
          <Icon icon="arrow_back" className="Font20" />
          <div className="mLeft16">{!currentPage ? _l('身份认证') : _l('返回')}</div>
        </div>
        <div className="flex" />
        <Trigger
          action={['click']}
          popupVisible={helpVisible}
          onPopupVisibleChange={visible => setHelpVisible(visible)}
          popup={<HelpCollection hapAIPosition="top" updatePopupVisible={visible => setHelpVisible(visible)} />}
          popupAlign={{
            points: ['tr', 'br'],
            offset: [40, 9],
            overflow: { adjustX: true, adjustY: true },
          }}
        >
          <div className="helpWrap" onClick={() => setHelpVisible(true)}>
            <Icon icon="workflow_help" className="Font20 Gray_75 TxtMiddle" />
            <span className="Gray_75 mLeft5 TxtMiddle">{_l('帮助')}</span>
          </div>
        </Trigger>
        <Avatar src={md.global.Account.avatar} size={30} />
      </div>

      <div className="contentWrap">
        {!currentPage ? (
          <div className="h100 flexRow alignItemsCenter justifyContentCenter">
            {types.map(item => (
              <TypeCard
                key={item.key}
                onClick={() => {
                  checkIsCert(item.value, () => setCurrentPage(item.key));
                }}
              >
                <img src={item.key === 'enterprise' ? enterpriseImg : personalImg} />
                <div className="mTop32 Font24 bold nowrap">
                  <span>{item.text}</span>
                  {item.key === 'enterprise' && <span className="ThemeColor">{_l('（推荐）')}</span>}
                </div>
                <div className="Gray_75 Font16 mTop20">{item.description}</div>
                <div className="Gray_75 Font16">
                  {item.key === 'enterprise' ? _l('（仅支持大陆企业认证）') : _l('（仅支持大陆身份证认证）')}
                </div>
              </TypeCard>
            ))}
          </div>
        ) : currentPage === 'success' ? (
          <div className="h100 flexColumn justifyContentCenter alignItemsCenter">
            <Icon icon="gpp_good" className="successIcon" />
            <div className="Font24 bold mTop16">{_l('认证成功')}</div>
            <Popover placement="right" content={<img src={developerGroupImg} width={260} />}>
              <div className="mTop16 ThemeColor pointer">{_l('开发者交流群')}</div>
            </Popover>
          </div>
        ) : (
          <Form className="formContent" layout="vertical" form={form}>
            <div className="explain">
              <div>
                {currentPage === 'enterprise'
                  ? _l(
                      '请上传您有效的营业执照，以及与营业执照一致的法人身份证人像与国徽面，并输入与身份证一致的实名制手机号，系统会自动进行匹配认证并保证您的隐私安全，若信息正确但未能有效通过认证，可联系在线客服或专属顾问',
                    )
                  : _l(
                      '请上传您有效的身份证人像与国徽面，并输入与身份证一致的实名制手机号，系统会自动进行匹配认证并保证您的隐私安全',
                    )}
              </div>
              {currentPage === 'personal' && <div>{_l('若信息正确但未能有效通过认证，可联系在线客服或专属顾问')}</div>}
            </div>
            {currentPage === 'enterprise' && renderEnterpriseForm()}
            {currentPage === 'personal' && renderPersonalForm()}
            <div className="flexRow justifyContentCenter mTop56 mBottom32">
              <Button loading={submitLoading} onClick={onSubmit}>
                {_l('提交')}
              </Button>
            </div>
          </Form>
        )}
      </div>
    </Wrapper>
  );
}
