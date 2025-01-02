import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import certificationApi from '../../api/certification';
import _ from 'lodash';
import { SOURCE_TYPE } from './index';
import moment from 'moment';

const Wrapper = styled.div`
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;

  .detailContent {
    flex: 1;
    padding: 0 24px;
    overflow: auto;
    .sectioninfo {
      font-size: 15px;
      margin-bottom: 32px;
      .rowItem {
        margin-top: 20px;
      }
    }
    .title {
      font-weight: 600;
      font-size: 17px;
    }
    .label {
      color: #757575;
      margin-right: 12px;
    }
    img {
      width: 140px;
      height: 90px;
      border-radius: 3px;
      border: 1px solid #e0e0e0;
      filter: blur(1px);
      display: block;
      object-fit: cover;
    }
  }
`;

export default function CertificationDetail(props) {
  const { certSource, projectId } = _.get(props, 'match.params');
  const [certInfo, setCertInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const { authType, personalInfo = {}, enterpriseInfo = {}, createTime } = certInfo;

  useEffect(() => {
    getCertInfo();
  }, []);

  const getCertInfo = () => {
    certificationApi.getCertInfo({ projectId, certSource: SOURCE_TYPE[certSource] }).then(res => {
      setCertInfo(res);
      setLoading(false);
    });
  };

  const maskCode = (data, startCount = 5, endCount = 5) => {
    return data
      ? data.slice(0, startCount) + '*'.repeat(data.length - startCount - endCount) + data.slice(-endCount)
      : '';
  };

  const formatValidDate = (start = '', end = '') => {
    const startDate = moment(start).format('YYYY-MM-DD');
    const endDate = moment(end).format('YYYY-MM-DD');
    return [startDate, endDate].join(' - ');
  };

  return (
    <Wrapper>
      <div className="Font20 bold mBottom25 pLeft24 pRight24">{authType === 2 ? _l('企业认证') : _l('个人认证')}</div>

      {authType === 2 ? (
        <div className="detailContent">
          <div className="sectioninfo">
            <div className="title">{_l('企业类型')}</div>
            <div className="rowItem">
              <span className="label">{_l('类型:')}</span>
              <span>
                {enterpriseInfo.enterpriseType === 1
                  ? _l('企业')
                  : enterpriseInfo.enterpriseType === 2
                  ? _l('政府/事业单位')
                  : _l('其他组织')}
              </span>
            </div>
          </div>

          <div className="sectioninfo">
            <div className="title">{_l('企业信息')}</div>
            <div className="rowItem">
              <span className="label">{_l('公司全称:')}</span>
              <span>{enterpriseInfo.companyName}</span>
            </div>
            <div className="rowItem">
              <span className="label">{_l('社会信用代码:')}</span>
              <span>{maskCode(enterpriseInfo.creditCode)}</span>
            </div>
            <div className="rowItem">
              <span className="label">{_l('营业执照有效期:')}</span>
              <span>
                {formatValidDate(
                  enterpriseInfo.businessLicenseValidDateStart,
                  enterpriseInfo.businessLicenseValidDateEnd,
                )}
              </span>
            </div>
            <div className="rowItem flexRow">
              <span className="label">{_l('营业执照:')}</span>
              <img src={enterpriseInfo.businessLicenseUrl} />
            </div>
          </div>

          <div className="sectioninfo">
            <div className="title">{_l('法人信息')}</div>
            <div className="rowItem">
              <span className="label">{_l('身份证类型:')}</span>
              <span>{_l('大陆身份证')}</span>
            </div>
            <div className="rowItem">
              <span className="label">{_l('身份证号:')}</span>
              <span>{maskCode(enterpriseInfo.idNumber)}</span>
            </div>
            <div className="rowItem">
              <span className="label">{_l('身份证有效期:')}</span>
              <span>
                {formatValidDate(enterpriseInfo.legalIdCardValidDateStart, enterpriseInfo.legalIdCardValidDateEnd)}
              </span>
            </div>
            <div className="rowItem flexRow">
              <span className="label">{_l('身份证:')}</span>
              <div className="flexRow">
                <img src={enterpriseInfo.legalIdCardFrontUrl} />
                <img className="mLeft8" src={enterpriseInfo.legalIdCardBackUrl} />
              </div>
            </div>
          </div>

          <div className="sectioninfo">
            <div className="title">{_l('备注')}</div>
            <div className="rowItem">
              <span className="label">{_l('认证时间:')}</span>
              <span>{moment(createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="detailContent">
          <div className="sectioninfo">
            <div className="title">{_l('个人信息')}</div>
            <div className="rowItem">
              <span className="label">{_l('手机号:')}</span>
              <span>{maskCode(personalInfo.mobile, 3, 4)}</span>
            </div>
            <div className="rowItem">
              <span className="label">{_l('身份证类型:')}</span>
              <span>{_l('大陆身份证')}</span>
            </div>
            <div className="rowItem">
              <span className="label">{_l('身份证号:')}</span>
              <span>{maskCode(personalInfo.idNumber)}</span>
            </div>
            <div className="rowItem">
              <span className="label">{_l('身份证有效期:')}</span>
              <span>{formatValidDate(personalInfo.idCardValidDateStart, personalInfo.idCardValidDateEnd)}</span>
            </div>
            <div className="rowItem flexRow">
              <span className="label">{_l('身份证:')}</span>
              <div className="flexRow">
                <img src={personalInfo.idCardFrontUrl} />
                <img className="mLeft8" src={personalInfo.idCardBackUrl} />
              </div>
            </div>
          </div>

          <div className="sectioninfo">
            <div className="title">{_l('备注')}</div>
            <div className="rowItem">
              <span className="label">{_l('认证时间:')}</span>
              <span>{moment(createTime).format('YYYY-MM-DD HH:mm:ss')}</span>
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
}
