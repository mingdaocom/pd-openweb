import React, { useEffect, useState } from 'react';
import DocumentTitle from 'react-document-title';
import { useSetState } from 'react-use';
import { DatePicker, Form, Popover } from 'antd';
import localeEn from 'antd/es/date-picker/locale/en_US';
import localeJaJp from 'antd/es/date-picker/locale/ja_JP';
import localeZhCn from 'antd/es/date-picker/locale/zh_CN';
import localeZhTw from 'antd/es/date-picker/locale/zh_TW';
import { createParser } from 'eventsource-parser';
import _ from 'lodash';
import moment from 'moment';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Avatar, Button, Dropdown, Icon, Input, LoadDiv, Qr } from 'ming-ui';
import certificationApi from 'src/api/certification';
import marketplacePaymentApi from 'src/api/marketplacePayment';
import Empty from 'src/pages/Admin/common/TableEmpty';
import HelpCollection from 'src/pages/PageHeader/components/CommonUserHandle/HelpCollection';
import { getRequest } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import {
  CERT_PAGE_TITLE,
  CERT_STATUS,
  ENTERPRISE_FIELD_LABEL,
  ENTERPRISE_TYPE,
  ENTERPRISE_TYPE_OPTIONS,
  RESULT_TYPES,
  SOURCE_TYPE,
  TYPES,
} from './constant';
import developerGroupImg from './images/developer-group.png';
import enterpriseImg from './images/enterprise.png';
import personalImg from './images/personal.png';
import UploadCertificate from './UploadCertificate';

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
    .certifiedInfo {
      width: 250px;
      background: #f8f8f8;
      border-radius: 5px;
      padding: 24px 0;
      text-align: center;
      margin-top: 30px;
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

  .personalContent {
    height: 100%;
    justify-content: center;
    align-items: center;
    .qrWrapper {
      padding: 24px;
      box-shadow: 0px 5px 30px 1px rgba(0, 0, 0, 0.16);
      border-radius: 26px;
      position: relative;
      cursor: pointer;
      &:hover {
        .icon-refresh1 {
          color: #2196f3 !important;
        }
      }

      .loadingWrap {
        width: 170px;
        height: 170px;
      }
      .green {
        color: #4caf50;
      }
      .qrMask {
        position: absolute;
        top: 24px;
        left: 24px;
        width: 170px;
        height: 170px;
        backdrop-filter: blur(3px);
        background-color: rgba(255, 255, 255, 0.8);
        .icon-check_circle1 {
          color: #4caf50;
        }
        .icon-refresh1 {
          color: #757575;
        }
      }
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

const initialValues = {
  enterpriseType: 1,
  businessLicense: undefined,
  idCardFront: undefined,
  idCardBack: undefined,
  idCardValidDate: undefined,
  verifyCode: '',
  fullName: '',
  companyName: '',
  creditCode: '',
  creditValidDate: undefined,
  mobile: '',
  idNumber: '',
};

export default function Certification(props) {
  const { certSource, projectId } = _.get(props, 'match.params');
  const { type, returnUrl } = getRequest();
  const [currentPage, setCurrentPage] = useState(
    certSource === 'personal' ? 'personal' : type === 'upgrade' ? 'enterprise' : '',
  );
  const [formData, setFormData] = useSetState(initialValues);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  const [certStatus, setCertStatus] = useState('');
  const [personalLoading, setPersonalLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(true);
  const [certState, setCertState] = useState('');
  const [token, setToken] = useState('');
  const [certInfo, setCertInfo] = useState({});
  const [controller, setController] = useState(null);

  const [form] = Form.useForm();

  const locales = { 'zh-Hans': localeZhCn, 'zh-Hant': localeZhTw, en: localeEn, ja: localeJaJp };
  const locale = locales[md.global.Account.lang];
  const currentProject = projectId ? getCurrentProject(projectId) || {} : {};

  useEffect(() => {
    switch (currentPage) {
      case 'enterprise':
        !!currentProject.projectId && checkEnterpriseIsCert();
        break;
      case 'personal':
        setPersonalLoading(true);
        certificationApi.checkIsCert({ projectId, authType: 1, certSource: SOURCE_TYPE[certSource] }).then(res => {
          res ? setCurrentPage('certified') : getAndCheckCertState();
        });
        break;
      case 'certified':
        certificationApi.getCertInfo({ projectId, certSource: SOURCE_TYPE[certSource], authType: 2 }).then(res => {
          res && setCertInfo(res);
        });
        break;
      default:
        break;
    }

    if (currentPage !== 'personal') {
      controller && controller.abort();
      setController(null);
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'personal') {
      const interval = setInterval(() => {
        if (certStatus === CERT_STATUS.USED && token) {
          certificationApi.getFaceCertResult({ token }).then(res => {
            res === 0 && setCertStatus(CERT_STATUS.EXPIRED);
            res === 1 && setCurrentPage('certified');
          });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentPage, certStatus, token]);

  useEffect(() => {
    checkFaceCert();
  }, [controller, certState]);

  useEffect(() => {
    setFormData({ ...initialValues, enterpriseType: formData.enterpriseType });
  }, [formData.enterpriseType]);

  const checkEnterpriseIsCert = () => {
    certificationApi.checkIsCert({ projectId, authType: 2, certSource: SOURCE_TYPE[certSource] }).then(res => {
      if (res) {
        alert(_l('已认证，不支持重复认证'), 3);
        setTimeout(() => {
          type === 'upgrade' && returnUrl && (location.href = decodeURIComponent(returnUrl));
        }, 1000);
      } else {
        getCertFailedInfo();
      }
    });
  };

  const getAndCheckCertState = () => {
    setQrLoading(true);
    setCertStatus(CERT_STATUS.NORMAL);

    certificationApi.getFaceCertUrl({ state: certState, projectId, certSource: SOURCE_TYPE[certSource] }).then(res => {
      if (res) {
        setCertState(res);
        setPersonalLoading(false);
        setQrLoading(false);
        setController(new AbortController());
      }
    });
  };

  const checkFaceCert = async () => {
    if (!controller || !certState) return;

    const parser = createParser(event => {
      if (event.type === 'event') {
        const data = safeParse(event.data) || {};
        data.state !== certStatus && setCertStatus(data.state);
        if (data.state === CERT_STATUS.USED) {
          setToken(data.token);
        }
      }
    });

    const resp = await certificationApi.checkFaceCertSSE(
      { state: certState },
      { abortController: controller, isReadableStream: true },
    );

    const reader = resp.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const result = new TextDecoder().decode(value);
        parser.feed(result);
      }
    } finally {
      setController(null);
      reader.releaseLock();
    }
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

          if (authType === 1) {
            defaultValues = {
              ..._.pick(personalInfo, ['idNumber', 'fullName', 'mobile']),
              idCardFront: { key: idCardFront, url: idCardFrontUrl },
              idCardBack: { key: idCardBack, url: idCardBackUrl },
              idCardValidDate: [moment(idCardValidDateStart), moment(idCardValidDateEnd)],
            };
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
          }
          setFormData(defaultValues);
        }
      });
  };

  const maskIdNumber = data => {
    return data ? data.slice(0, 2) + '*'.repeat(data.length - 4) + data.slice(-2) : '';
  };

  const formatValidDate = (period = '', splitKey = '-', format = 'YYYY-MM-DD') => {
    const dateArr = period.split(splitKey);
    const startDate = moment(dateArr[0], format).isValid() ? moment(dateArr[0], format) : '';
    const endDate =
      dateArr[1] === '长期'
        ? moment('2099-12-31')
        : moment(dateArr[1], format).isValid()
          ? moment(dateArr[1], format)
          : '';
    return [startDate, endDate];
  };

  const onSubmit = () => {
    form.validateFields().then(() => {
      const {
        enterpriseType,
        businessLicense,
        idCardFront,
        idCardBack,
        idCardValidDate,
        verifyCode,
        fullName,
        creditValidDate,
        companyName,
        creditCode,
        mobile,
        idNumber,
        person,
      } = formData;

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
          mobile,
          idNumber,
        };
      }
      // 企业
      if (currentPage === 'enterprise') {
        if (person !== fullName) {
          alert(_l('法人姓名不一致'), 3);
          return;
        }
        data.certSource = SOURCE_TYPE[certSource];
        data.entityId = projectId;
        data.isUpgrade = type === 'upgrade';
        data.enterpriseInfo = {
          bucket: 3,
          idType: 1,
          businessLicense: _.get(businessLicense, 'key'),
          legalIdCardFront: _.get(idCardFront, 'key'),
          legalIdCardBack: _.get(idCardBack, 'key'),
          businessLicenseValidDateStart:
            enterpriseType !== 2 ? moment(creditValidDate[0]).format('YYYY-MM-DD') : undefined,
          businessLicenseValidDateEnd:
            enterpriseType !== 2 ? moment(creditValidDate[1]).format('YYYY-MM-DD') : undefined,
          legalIdCardValidDateStart: moment(idCardValidDate[0]).format('YYYY-MM-DD'),
          legalIdCardValidDateEnd: moment(idCardValidDate[1]).format('YYYY-MM-DD'),
          legalName: fullName,
          mobile,
          idNumber,
          enterpriseType,
          companyName,
          creditCode,
        };
      }

      setSubmitLoading(true);
      (currentPage === 'enterprise'
        ? certificationApi.enterpriseCertification
        : certificationApi.personalCertification)(data)
        .then(data => {
          const errorMsg = {
            [ENTERPRISE_TYPE.ENTERPRISE]: {
              4: _l('企业统一信用代码不一致'),
              5: _l('公司名称不一致'),
              15: _l('营业执照超过有效期'),
            },
            [ENTERPRISE_TYPE.GOVERNMENT]: {
              4: _l('社会信用代码不一致'),
              5: _l('单位名称不一致'),
              15: _l('证书超过有效期'),
            },
            [ENTERPRISE_TYPE.SOCIAL_ORGANIZATION]: {
              4: _l('组织信用代码不一致'),
              5: _l('组织名称不一致'),
              15: _l('证书超过有效期'),
            },
          };
          switch (data) {
            case 1:
              alert(_l('认证信息已提交'));
              setCurrentPage('success');
              break;
            case 4:
            case 5:
            case 15:
              alert(errorMsg[enterpriseType][data] + _l(',错误码:%0', data), 2);
              break;
            default:
              alert((RESULT_TYPES[data] || _l('提交失败')) + _l(',错误码:%0', data), 2);
          }
        })
        .finally(() => setSubmitLoading(false));
    });
  };

  // 验证执照或证书
  const onValidateBizLicenseOCR = (first, value) => {
    return new Promise((resolve, reject) => {
      const { key, url } = value || {};
      const { enterpriseType, businessLicense } = formData;

      if (key && key !== _.get(businessLicense, 'key')) {
        (enterpriseType === 1 ? marketplacePaymentApi.bizLicenseOCR : marketplacePaymentApi.smartStructuralOCR)({
          projectId: '',
          url,
        }).then(data => {
          if (data.resultCode === 1) {
            setFormData({
              companyName: data.name,
              creditCode: data.regNum,
              creditValidDate: formatValidDate(data.period, '至', 'YYYY年MM月DD日'),
              person: data.person,
            });
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
  const onValidateIDCardOCR = (first, value, callback, isFront) => {
    return new Promise((resolve, reject) => {
      const { key, url } = value || {};
      const { idCardFront, idCardBack } = formData;

      if (key && key !== (isFront ? _.get(idCardFront, 'key') : _.get(idCardBack, 'key'))) {
        marketplacePaymentApi.iDCardOCR({ projectId: '', url }).then(data => {
          if (data.resultCode === 1) {
            if (isFront) {
              if (data.idNum) {
                setFormData({ fullName: data.name, idNumber: data.idNum });
              } else {
                return reject(_l('未检测到身份证人像面信息'));
              }
            } else {
              if (data.validDate) {
                setFormData({ idCardValidDate: formatValidDate(data.validDate) });
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

  const renderEnterpriseForm = () => {
    const { enterpriseType } = formData || {};

    return (
      <Form
        className="formContent"
        layout="vertical"
        form={form}
        fields={Object.entries(formData).map(([key, value]) => ({ name: key, value }))}
        onValuesChange={changedValues => setFormData(changedValues)}
      >
        <div className="explain">
          {_l(
            '请上传您有效的组织相关证书，以及与证书一致的法人身份证人像面与国徽面，并输入与身份证一致的实名制手机号，系统会自动进行匹配认证并保证您的隐私安全，若信息正确但未能有效通过认证，可联系在线客服或专属顾问',
          )}
        </div>

        <div className="moduleTitle">{_l('组织认证')}</div>
        <Form.Item
          label={_l('组织类型')}
          name="enterpriseType"
          rules={[{ required: true, message: _l('请选择组织类型') }]}
          className="isLast"
        >
          <Dropdown border className="w100" data={ENTERPRISE_TYPE_OPTIONS} />
        </Form.Item>

        {enterpriseType !== 1 && (
          <div className="Gray_75 mTop10">
            {enterpriseType === 2
              ? _l('各级、各类政府机构、事业单位')
              : _l('不属于企业、政府/事业单位机构，要求机构已办理组织机构代码证书（如协会、基金会等）')}
          </div>
        )}
        <div className="moduleTitle">{_l('组织信息')}</div>
        <Form.Item
          name="businessLicense"
          label={_.get(ENTERPRISE_FIELD_LABEL, [enterpriseType, 'businessLicense', 'label'])}
          rules={[
            {
              required: true,
              message: _.get(ENTERPRISE_FIELD_LABEL, [enterpriseType, 'businessLicense', 'requiredMsg']),
            },
            () => ({ validator: onValidateBizLicenseOCR }),
          ]}
        >
          <UploadCertificate />
        </Form.Item>

        {formData.businessLicense && (
          <React.Fragment>
            <Form.Item
              label={_.get(ENTERPRISE_FIELD_LABEL, [enterpriseType, 'companyName', 'label'])}
              name="companyName"
              rules={[
                {
                  required: true,
                  message: _.get(ENTERPRISE_FIELD_LABEL, [enterpriseType, 'companyName', 'requiredMsg']),
                },
              ]}
            >
              <Input placeholder={_l('请输入')} />
            </Form.Item>
            <Form.Item
              label={_.get(ENTERPRISE_FIELD_LABEL, [enterpriseType, 'creditCode', 'label'])}
              name="creditCode"
              rules={[
                {
                  required: true,
                  message: _.get(ENTERPRISE_FIELD_LABEL, [enterpriseType, 'creditCode', 'requiredMsg']),
                },
                {
                  pattern: /^[A-Z0-9]{18}$/,
                  message: _.get(ENTERPRISE_FIELD_LABEL, [enterpriseType, 'creditCode', 'validMsg']),
                },
              ]}
            >
              <Input placeholder={_l('请输入')} />
            </Form.Item>
            {formData.enterpriseType !== 2 && (
              <Form.Item
                label={_.get(ENTERPRISE_FIELD_LABEL, [enterpriseType, 'creditValidDate', 'label'])}
                name="creditValidDate"
                rules={[
                  {
                    required: true,
                    message: _.get(ENTERPRISE_FIELD_LABEL, [enterpriseType, 'creditValidDate', 'requiredMsg']),
                  },
                ]}
                className="isLast"
              >
                <CommonRangePicker locale={locale} />
              </Form.Item>
            )}
          </React.Fragment>
        )}

        <div className="moduleTitle">{_l('法人信息')}</div>
        <div className="flexRow">
          <Form.Item
            name="idCardFront"
            label={_l('法人身份证人像面')}
            rules={[
              { required: true, message: _l('请上传身份证人像面') },
              () => ({
                validator: (rule, value, callback) => onValidateIDCardOCR(rule, value, callback, true),
              }),
            ]}
            className="flex"
          >
            <UploadCertificate />
          </Form.Item>
          <Form.Item
            name="idCardBack"
            label={_l('法人身份证国徽面')}
            rules={[{ required: true, message: _l('请上传身份证国徽面') }, () => ({ validator: onValidateIDCardOCR })]}
            className="flex"
          >
            <UploadCertificate />
          </Form.Item>
        </div>

        {formData.idCardFront && (
          <React.Fragment>
            <Form.Item label={_l('法人姓名')} name="fullName" rules={[{ required: true, message: _l('请输入姓名') }]}>
              <Input placeholder={_l('请输入')} />
            </Form.Item>
            <Form.Item
              label={_l('法人身份证号')}
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
        {formData.idCardBack && (
          <Form.Item
            label={_l('法人身份证有效期')}
            name="idCardValidDate"
            rules={[{ required: true, message: _l('请输入身份证有效期') }]}
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

        <div className="flexRow justifyContentCenter mTop56 mBottom32">
          <Button loading={submitLoading} onClick={onSubmit}>
            {_l('提交')}
          </Button>
        </div>
      </Form>
    );
  };

  return (
    <Wrapper>
      <DocumentTitle title={CERT_PAGE_TITLE[currentPage] || _l('认证')} />
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
        {certSource === 'project' && !currentProject.projectId ? (
          <Empty
            className="pTop0 h100"
            detail={{
              icon: 'icon-task_custom_ic_task_internet',
              desc: _l('您的账号不是该组织成员'),
            }}
          />
        ) : (
          <React.Fragment>
            {!currentPage && (
              <div className="h100 flexRow alignItemsCenter justifyContentCenter">
                {TYPES.map(item => (
                  <TypeCard key={item.key} onClick={() => setCurrentPage(item.key)}>
                    <img src={item.key === 'enterprise' ? enterpriseImg : personalImg} />
                    <div className="mTop32 Font24 bold nowrap">{item.text}</div>
                    <div className="Gray_75 Font16 mTop20">{item.description}</div>
                    <div className="Gray_75 Font16">
                      {item.key === 'enterprise'
                        ? _l('使用短信自定义签名等功能时需要完成组织认证')
                        : _l('（仅支持大陆身份证认证）')}
                    </div>
                  </TypeCard>
                ))}
              </div>
            )}

            {currentPage === 'enterprise' && renderEnterpriseForm()}

            {currentPage === 'personal' && (
              <div className="personalContent flexColumn">
                {personalLoading ? (
                  <LoadDiv />
                ) : (
                  <React.Fragment>
                    <div className="Font28 bold mBottom24">{_l('个人认证')}</div>
                    <div className="Font17 Gray_75 mBottom40">{_l('使用微信扫一扫，快速完成人脸识别')}</div>
                    <div
                      className="qrWrapper"
                      onClick={() => {
                        controller && controller.abort();
                        setController(null);
                        getAndCheckCertState();
                      }}
                    >
                      {qrLoading ? (
                        <div className="loadingWrap flexRow alignItemsCenter justifyContentCenter">
                          <LoadDiv />
                        </div>
                      ) : (
                        <Qr
                          content={`${md.global.Config.WebUrl}identityAuth?certState=${certState}`}
                          width={170}
                          height={170}
                        />
                      )}

                      {certStatus !== CERT_STATUS.NORMAL && (
                        <div className="qrMask flexColumn alignItemsCenter justifyContentCenter">
                          <Icon
                            icon={certStatus !== CERT_STATUS.EXPIRED ? 'check_circle1' : 'refresh1'}
                            className="Font40"
                          />
                          <div className="Font12 mTop4">
                            {certStatus === CERT_STATUS.EXPIRED ? _l('二维码失效') : _l('扫码成功')}
                          </div>
                        </div>
                      )}

                      <div className="flexRow justifyContentCenter alignItemsCenter mTop20">
                        <Icon icon="wechat" className="Font20 green" />
                        <span className="mLeft8">{_l('微信扫码')}</span>
                      </div>
                    </div>
                  </React.Fragment>
                )}
              </div>
            )}

            {['certified', 'success'].includes(currentPage) && (
              <div className="h100 flexColumn justifyContentCenter alignItemsCenter">
                <Icon icon="gpp_good" className="successIcon" />
                <div className="Font24 bold mTop16">
                  {currentPage === 'success' ? _l('认证成功') : _l('个人认证已通过')}
                </div>

                {currentPage === 'certified' && (
                  <div className="certifiedInfo">
                    <div className="bold">{_l('您的认证信息:')}</div>
                    <div className="mTop20">{_l('大陆身份证')}</div>
                    <div className="mTop20">{maskIdNumber(_.get(certInfo, 'personalInfo.idNumber'))}</div>
                  </div>
                )}

                {certSource === 'market' && (
                  <Popover placement="right" content={<img src={developerGroupImg} width={260} />}>
                    <div className="mTop16 ThemeColor pointer">{_l('开发者交流群')}</div>
                  </Popover>
                )}
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </Wrapper>
  );
}
