import React, { Fragment, useEffect, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv, VerifyPasswordConfirm } from 'ming-ui';
import certificationApi from '../../api/certification';
import { ENTERPRISE_FIELD_LABEL, SOURCE_TYPE } from './constant';
import EditContactInfo from './EditContactInfo';

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
      i {
        color: #757575;
        &:hover {
          color: #1677ff;
        }
      }
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

  .footerBtn {
    padding: 10px 12px;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    color: #1677ff;
    background: rgba(22, 119, 255, 0.1);
    &:hover {
      background: rgba(22, 119, 255, 0.2);
    }

    &.delCert {
      color: #f44336;
      background: rgba(244, 67, 54, 0.1);
      &:hover {
        background: rgba(244, 67, 54, 0.2);
      }
    }
  }
`;

export default function CertificationDetail(props) {
  const { isHap, onRemoveSuccess } = props;
  const { certSource, projectId } = _.get(props, 'match.params') || props;
  const [loading, setLoading] = useState(true);
  const [certInfo, setCertInfo] = useState({});
  const { authType, personalInfo = {}, enterpriseInfo = {}, updateTime, operatorAccount } = certInfo || {};

  useEffect(() => {
    getCertInfo();
  }, []);

  const getCertInfo = () => {
    setLoading(true);
    certificationApi
      .getCertInfo({ projectId, certSource: SOURCE_TYPE[certSource] })
      .then(res => {
        if (_.isEmpty(res)) {
          alert(_l('认证信息不存在或已移除，请刷新页面'), 3);
        } else {
          setCertInfo(res);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
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

  const onRemoveCert = () => {
    Dialog.confirm({
      title: <div className="Red">{_l('您确定移除?')}</div>,
      description: _l('移除后，组织绑定此认证的关系将被解绑，同时需要认证的功能之后将不能使用'),
      okText: _l('移除'),
      buttonType: 'danger',
      onOk: () => {
        VerifyPasswordConfirm.confirm({
          onOk: () => {
            certificationApi.removeCertification({ projectId }).then(res => {
              if (res) {
                alert(_l('移除成功'));
                onRemoveSuccess();
              } else {
                alert(_l('移除失败'), 2);
              }
            });
          },
        });
      },
    });
  };

  if (loading) {
    return <LoadDiv className="mTop50" />;
  }

  return (
    <Wrapper>
      <div className="Font20 bold mBottom25 pLeft24 pRight24">{authType === 2 ? _l('组织认证') : _l('个人认证')}</div>

      <div className="detailContent">
        {authType === 2 ? (
          <Fragment>
            <div className="sectioninfo">
              <div className="title">{_l('组织类型')}</div>
              <div className="rowItem">
                <span className="label">{_l('类型:')}</span>
                <span>
                  {enterpriseInfo.enterpriseType === 1
                    ? _l('企业')
                    : enterpriseInfo.enterpriseType === 2
                      ? _l('政府/事业单位')
                      : _l('社会组织')}
                </span>
              </div>
            </div>

            <div className="sectioninfo">
              <div className="title">{_l('组织信息')}</div>
              <div className="rowItem">
                <span className="label">
                  {_.get(ENTERPRISE_FIELD_LABEL, [enterpriseInfo.enterpriseType, 'companyName', 'label']) + ':'}
                </span>
                <span>{enterpriseInfo.companyName}</span>
              </div>
              <div className="rowItem">
                <span className="label">
                  {_.get(ENTERPRISE_FIELD_LABEL, [enterpriseInfo.enterpriseType, 'creditCode', 'label']) + ':'}
                </span>
                <span>{maskCode(enterpriseInfo.creditCode)}</span>
              </div>
              <div className="rowItem">
                <span className="label">
                  {_.get(ENTERPRISE_FIELD_LABEL, [enterpriseInfo.enterpriseType, 'creditValidDate', 'label']) + ':'}
                </span>
                <span>
                  {formatValidDate(
                    enterpriseInfo.businessLicenseValidDateStart,
                    enterpriseInfo.businessLicenseValidDateEnd,
                  )}
                </span>
              </div>
              <div className="rowItem flexRow">
                <span className="label">
                  {_.get(ENTERPRISE_FIELD_LABEL, [enterpriseInfo.enterpriseType, 'businessLicense', 'label']) + ':'}
                </span>
                <img src={enterpriseInfo.businessLicenseUrl} />
              </div>
            </div>

            <div className="sectioninfo">
              <div className="title">{_l('法人信息')}</div>
              <div className="rowItem">
                <span className="label">{_l('姓名:')}</span>
                <span>{enterpriseInfo.legalName}</span>
              </div>
              <div className="rowItem">
                <span className="label">{_l('身份证类型:')}</span>
                <span>{_l('大陆身份证')}</span>
              </div>
              <div className="rowItem">
                <span className="label">{_l('身份证号:')}</span>
                <span>{maskCode(enterpriseInfo.idNumber)}</span>
              </div>
              <div className="rowItem">
                <span className="label">{_l('手机号:')}</span>
                <span>{enterpriseInfo.mobile}</span>
              </div>
            </div>

            <div className="sectioninfo">
              <div className="title flexRow alignItemsCenter">
                <span>{_l('联系人信息')}</span>
                {isHap && (
                  <Icon
                    icon="edit"
                    className="Font16 pointer mLeft16"
                    onClick={() => {
                      EditContactInfo({
                        projectId,
                        contactInfo: _.pick(enterpriseInfo, ['contactName', 'contactIdNumber', 'contactMobile']),
                        onUpdateSuccess: getCertInfo,
                      });
                    }}
                  />
                )}
              </div>
              {enterpriseInfo.contactName && (
                <Fragment>
                  <div className="rowItem">
                    <span className="label">{_l('姓名:')}</span>
                    <span>{enterpriseInfo.contactName}</span>
                  </div>
                  <div className="rowItem">
                    <span className="label">{_l('身份证类型:')}</span>
                    <span>{_l('大陆身份证')}</span>
                  </div>
                  <div className="rowItem">
                    <span className="label">{_l('身份证号:')}</span>
                    <span>{maskCode(enterpriseInfo.contactIdNumber)}</span>
                  </div>
                  <div className="rowItem">
                    <span className="label">{_l('手机号:')}</span>
                    <span>{enterpriseInfo.contactMobile}</span>
                  </div>
                </Fragment>
              )}
            </div>

            <div className="sectioninfo">
              <div className="title">{_l('备注')}</div>
              <div className="rowItem">
                <span className="label">{_l('认证时间:')}</span>
                <span>{moment(updateTime).format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <div className="sectioninfo">
              <div className="title">{_l('个人信息')}</div>
              <div className="rowItem">
                <span className="label">{_l('身份证类型:')}</span>
                <span>{_l('大陆身份证')}</span>
              </div>
              <div className="rowItem">
                <span className="label">{_l('身份证号:')}</span>
                <span>{maskCode(personalInfo.idNumber)}</span>
              </div>
            </div>

            <div className="sectioninfo">
              <div className="title">{_l('操作账号')}</div>
              <div className="rowItem">
                <span className="label">{_l('手机号/邮箱:')}</span>
                <span>{operatorAccount}</span>
              </div>
            </div>

            <div className="sectioninfo">
              <div className="title">{_l('备注')}</div>
              <div className="rowItem">
                <span className="label">{_l('认证时间:')}</span>
                <span>{moment(updateTime).format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
            </div>
          </Fragment>
        )}

        {isHap && projectId && (
          <div className="flexRow alignItemsCenter mBottom32 pTop8">
            {authType === 2 && (
              <div
                className="footerBtn mRight12"
                onClick={() => {
                  location.href = `/certification/project/${projectId}?type=update&returnUrl=${encodeURIComponent(location.href)}`;
                }}
              >
                {_l('重新认证')}
              </div>
            )}
            <div className="footerBtn delCert" onClick={onRemoveCert}>
              {_l('移除当前认证')}
            </div>
          </div>
        )}
      </div>
    </Wrapper>
  );
}
