import _ from 'lodash';
import moment from 'moment';

export const getEnterpriseParams = formData => {
  const { enterpriseType, businessLicense, creditValidDate } = formData || {};

  return {
    enterpriseInfo: {
      ..._.pick(formData, [
        'legalName',
        'mobile',
        'idNumber',
        'enterpriseType',
        'companyName',
        'creditCode',
        'contactName',
        'contactIdNumber',
        'contactMobile',
      ]),
      bucket: 3,
      idType: 1,
      contactIdType: 1,
      businessLicense: businessLicense?.key,
      businessLicenseValidDateStart: enterpriseType !== 2 ? moment(creditValidDate[0]).format('YYYY-MM-DD') : undefined,
      businessLicenseValidDateEnd: enterpriseType !== 2 ? moment(creditValidDate[1]).format('YYYY-MM-DD') : undefined,
    },
  };
};

export const getEnterpriseDefaultFormData = enterpriseInfo => {
  const {
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

  return {
    ..._.pick(enterpriseInfo, [
      'enterpriseType',
      'companyName',
      'creditCode',
      'idNumber',
      'mobile',
      'legalName',
      'contactName',
      'contactIdNumber',
      'contactMobile',
    ]),
    person: enterpriseInfo.legalName,
    idCardFront: { key: legalIdCardFront, url: legalIdCardFrontUrl },
    idCardBack: { key: legalIdCardBack, url: legalIdCardBackUrl },
    idCardValidDate: [moment(legalIdCardValidDateStart), moment(legalIdCardValidDateEnd)],
    businessLicense: { key: businessLicense, url: businessLicenseUrl },
    creditValidDate: [moment(businessLicenseValidDateStart), moment(businessLicenseValidDateEnd)],
  };
};
