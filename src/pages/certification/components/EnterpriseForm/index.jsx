import React, { useEffect } from 'react';
import { DatePicker, Form } from 'antd';
import localeEn from 'antd/es/date-picker/locale/en_US';
import localeJaJp from 'antd/es/date-picker/locale/ja_JP';
import localeZhCn from 'antd/es/date-picker/locale/zh_CN';
import localeZhTw from 'antd/es/date-picker/locale/zh_TW';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dropdown, Input } from 'ming-ui';
import marketplacePaymentApi from 'src/api/marketplacePayment';
import { ENTERPRISE_FIELD_LABEL, ENTERPRISE_TYPE_OPTIONS } from '../../constant';
import UploadCertificate from './UploadCertificate';

const { RangePicker } = DatePicker;

const CommonRangePicker = styled(RangePicker)`
  width: 50%;
  height: 36px;
  border-radius: 4px !important;
  border-color: var(--color-border-tertiary);
  box-shadow: none !important;
  &:hover,
  &.ant-picker-focused {
    border-color: var(--color-primary);
  }
`;

const FormWrapper = styled(Form)`
  width: 960px;
  margin: 0 auto !important;

  .moduleTitle {
    font-size: 15px;
    font-weight: 600;
    padding: 32px 0 10px;
    border-bottom: 1px solid var(--color-border-tertiary);
    margin-bottom: 16px;
  }
  .ant-form-item {
    margin-bottom: 0;
    .ant-form-item-required {
      font-size: 13px !important;
      color: var(--color-text-secondary) !important;
      font-weight: bold;
    }
    .ant-form-item-explain-error {
      margin-top: 4px;
      font-size: 12px;
    }

    &:not(&.isLast) {
      border-bottom: 1px solid --color-background-disabled;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
  }
  input {
    width: 100%;
    border-color: var(--color-border-primary);
    font-size: 13px;
    &:hover {
      border-color: var(--color-border-tertiary);
    }
    &:focus {
      border-color: var(--color-primary) !important;
    }
    &::placeholder {
      color: var(--color-text-disabled);
    }
  }
  .mTop56 {
    margin-top: 56px;
  }
`;

const initialValues = {
  enterpriseType: 1,
  businessLicense: undefined,
  idCardFront: undefined,
  idCardBack: undefined,
  idCardValidDate: undefined,
  verifyCode: '',
  legalName: '',
  companyName: '',
  creditCode: '',
  creditValidDate: undefined,
  mobile: '',
  idNumber: '',
  contactName: '',
  contactIdNumber: '',
  contactMobile: '',
};

export default function EnterpriseForm(props) {
  const { form, formData, setFormData, type = 'cert' } = props;
  const { enterpriseType, businessLicense } = formData;

  const locales = { 'zh-Hans': localeZhCn, 'zh-Hant': localeZhTw, en: localeEn, ja: localeJaJp };
  const locale = locales[md.global.Account.lang];

  const isSign = type === 'sign';

  useEffect(() => {
    setFormData({ ...initialValues, enterpriseType: enterpriseType || 1 });
  }, [enterpriseType]);

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

  // 验证执照或证书
  const onValidateBizLicenseOCR = (first, value) => {
    return new Promise((resolve, reject) => {
      const { key, url } = value || {};

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

  return (
    <FormWrapper
      className={isSign ? 'w100' : ''}
      layout="vertical"
      form={form}
      fields={Object.entries(formData).map(([key, value]) => ({ name: key, value }))}
      onValuesChange={changedValues => setFormData(changedValues)}
    >
      <div className="moduleTitle">{isSign ? _l('组织信息') : _l('企业认证')}</div>
      <Form.Item
        label={_l('企业类型')}
        name="enterpriseType"
        rules={[{ required: true, message: _l('请选择企业类型') }]}
        className="isLast"
      >
        <Dropdown border className="w100" data={ENTERPRISE_TYPE_OPTIONS} />
      </Form.Item>

      {enterpriseType !== 1 && (
        <div className="textSecondary mTop10">
          {enterpriseType === 2
            ? _l('各级、各类政府机构、事业单位')
            : _l('不属于企业、政府/事业单位机构，要求机构已办理组织机构代码证书（如协会、基金会等）')}
        </div>
      )}
      <div className="moduleTitle">{isSign ? _l('基本信息') : _l('企业信息')}</div>
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

      {businessLicense && (
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
          {enterpriseType !== 2 && (
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

      <div className="moduleTitle">{_l('法定代表人信息')}</div>
      <Form.Item label={_l('姓名')} name="legalName" rules={[{ required: true, message: _l('请输入法定代表人姓名') }]}>
        <Input placeholder={_l('请输入')} />
      </Form.Item>
      <Form.Item
        label={_l('身份证号')}
        name="idNumber"
        rules={[
          { required: true, message: _l('请输入法定代表人身份证号码') },
          { pattern: /(^\d{15}$)|(^\d{17}(\d|X|x)$)/, message: _l('请输入有效的身份证号码') },
        ]}
      >
        <Input placeholder={_l('请输入')} />
      </Form.Item>
      <Form.Item
        label={_l('手机号')}
        name="mobile"
        rules={[
          { required: true, message: _l('请输入法定代表人手机号') },
          { pattern: /^1[2-9]\d{9}$/, message: _l('请输入有效的手机号') },
        ]}
        className="isLast"
      >
        <Input placeholder={_l('请输入大陆手机号')} />
      </Form.Item>

      <div className="moduleTitle">{_l('联系人信息')}</div>
      <Form.Item label={_l('姓名')} name="contactName" rules={[{ required: true, message: _l('请输入联系人姓名') }]}>
        <Input placeholder={_l('请输入')} />
      </Form.Item>
      <Form.Item
        label={_l('身份证号')}
        name="contactIdNumber"
        rules={[
          { required: true, message: _l('请输入联系人身份证号码') },
          { pattern: /(^\d{15}$)|(^\d{17}(\d|X|x)$)/, message: _l('请输入有效的身份证号码') },
        ]}
      >
        <Input placeholder={_l('请输入')} />
      </Form.Item>
      <Form.Item
        label={_l('手机号')}
        name="contactMobile"
        rules={[
          { required: true, message: _l('请输入联系人手机号') },
          { pattern: /^1[2-9]\d{9}$/, message: _l('请输入有效的手机号') },
        ]}
        className="isLast"
      >
        <Input placeholder={_l('请输入大陆手机号')} />
      </Form.Item>
    </FormWrapper>
  );
}
