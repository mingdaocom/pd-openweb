import React, { Fragment, useState } from 'react';
import styled from 'styled-components';
import { Dialog, Icon } from 'ming-ui';
import certificationApi from '../../../api/certification';
import ListContainer from 'src/pages/Admin/organization/systemSetting/component/CertInfo/components/ListContainer';
import CertificationDetail from './CertificationDetail';
import SelectCertification from './SelectCertification';

const Wrapper = styled.div`
  .certBtn {
    color: var(--color-primary);
    font-weight: bold;
    width: fit-content;
    cursor: pointer;
    &:hover {
      color: var(--color-primary-light);
    }
  }

  .certifiedBtn {
    height: 30px;
    display: flex;
    align-items: center;
    color: var(--color-success);
    background: var(--color-success-bg);
    padding: 0 12px;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    &:hover {
      background: var(--color-success-bg);
    }
  }
`;

const DetailDialog = styled(Dialog)`
  .mui-dialog-header {
    padding-bottom: 0 !important;
  }
  .mui-dialog-body {
    padding: 0 !important;
    position: relative;
    .loadDiv {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%);
    }
  }
  .detailWrapper {
    overflow: hidden;
    height: 500px;
  }
`;

export default function CertificationDisplay(props) {
  const {
    authType = 0,
    projectId,
    onUpdateCertStatus,
    fromType = 1,
    onViewCert = () => {},
    certList,
    onRefreshCertList,
  } = props; // fromType: 1-个人认证 2-企业认证 3-认证信息页面
  const [detail, setDetail] = useState({ visible: false, id: '' });

  const onVerify = ({ isUpgrade }) => {
    const isCert = certificationApi.checkIsCert(
      { certSource: projectId ? 1 : 0, projectId, authType: isUpgrade ? 2 : 1 },
      { ajaxOptions: { sync: true } },
    );

    if (isCert) {
      alert(_l('已认证，请刷新页面'), 3);
      return;
    }

    if (projectId) {
      certificationApi.getCertInfoList({ certSource: 1, isUpgrade }).then(res => {
        if (res && !!res.length) {
          SelectCertification({ certList: res, projectId, onUpdateCertStatus, isUpgrade });
        } else {
          isUpgrade
            ? window.open(
                `/certification/project/${projectId}?type=upgrade&returnUrl=${encodeURIComponent(location.href)}`,
              )
            : window.open(`/certification/project/${projectId}?returnUrl=${encodeURIComponent(location.href)}`);
        }
      });
    } else {
      window.open(`/certification/personal?returnUrl=${encodeURIComponent(location.href)}`);
    }
  };

  return (
    <Wrapper>
      <div className="flexRow alignItemsCenter">
        {!authType ? (
          <div className="certBtn" onClick={onVerify}>
            {_l('立即认证')}
          </div>
        ) : (
          fromType !== 3 && (
            <div
              className="certifiedBtn"
              onClick={() => (fromType === 1 ? setDetail({ visible: true }) : onViewCert())}
            >
              <Icon icon="gpp_good" className="Font16" />
              <span className="mLeft2">{authType === 1 ? _l('个人已认证') : _l('企业已认证')}</span>
            </div>
          )
        )}

        {fromType === 2 && authType === 1 && (
          <div className="certBtn mLeft12" onClick={() => onVerify({ isUpgrade: true })}>
            {_l('升级到企业认证')}
          </div>
        )}
      </div>

      {projectId && !(fromType === 3 && authType) && (
        <div className="textSecondary mTop4">
          {_l('试用、免费版需组织完成身份认证后可充值信用点；对外分享、自定义短信签名等功能需完成企业身份认证')}
        </div>
      )}

      {fromType === 3 && !!authType && (
        <Fragment>
          <ListContainer
            list={certList.filter(item => item.authType === authType)}
            renderItem={item => (
              <Fragment>
                <div className="bold flex">
                  <div className="successColor">{item.authType === 1 ? _l('个人认证') : _l('企业认证')}</div>
                  <div className="mTop10 Font15">
                    {item.authType === 1 ? item.personalInfo?.fullName : item.enterpriseInfo?.companyName}
                  </div>
                </div>
                <div
                  className="ThemeColor3 adminHoverColor pointer bold"
                  onClick={() => setDetail({ visible: true, id: item.id })}
                >
                  {_l('详情')}
                </div>
              </Fragment>
            )}
          />

          {authType == 1 && (
            <div className="flexRow alignItemsCenter mTop16">
              <div className="certBtn" onClick={() => onVerify({ isUpgrade: true })}>
                {_l('升级到企业认证')}
              </div>
              <div className="mLeft8 textSecondary">{_l('对外分享、自定义短信签名等功能需完成企业身份认证')}</div>
            </div>
          )}
        </Fragment>
      )}

      <DetailDialog visible={detail.visible} width={800} footer={null} onCancel={() => setDetail({ visible: false })}>
        <div className="detailWrapper">
          <CertificationDetail
            isHap={true}
            certSource={projectId ? 'project' : 'personal'}
            projectId={projectId}
            relationId={detail.id}
            onRemoveSuccess={() => {
              setDetail({ visible: false });
              authType === 1 || certList.length === 1 ? onUpdateCertStatus(0) : onRefreshCertList();
            }}
          />
        </div>
      </DetailDialog>
    </Wrapper>
  );
}
