import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import certificationApi from 'src/api/certification';
import Config from 'src/pages/Admin/config';
import CertificationDisplay from 'src/pages/certification/components/CertificationDisplay';
import SmsSignature from './SmsSignature';

const Wrapper = styled.div`
  max-width: 800px;
  margin-bottom: 50px;
  .addBtn {
    width: fit-content;
    display: flex;
    align-items: center;
    padding: 4px 0;
    cursor: pointer;
    color: var(--color-primary);
    i {
      font-size: 18px;
      margin-right: 4px;
    }
    &:hover {
      color: var(--color-primary-light);
    }
  }
`;

export default function CertInfo() {
  const [authType, setAuthType] = useState(window.platformENV.isOverseas || window.platformENV.isLocal ? 2 : null);
  const [certList, setCertList] = useState([]);

  useEffect(() => {
    !window.platformENV.isOverseas && !window.platformENV.isLocal && getCertList();
  }, []);

  const getCertList = () => {
    certificationApi.getListCertInfo({ projectId: Config.projectId }).then(res => {
      const authType = res?.length ? (res.filter(item => item.authType === 2).length ? 2 : 1) : 0;
      setAuthType(authType);
      setCertList(res || []);
    });
  };

  if (authType === null) {
    return <LoadDiv />;
  }

  return (
    <Wrapper>
      {!window.platformENV.isOverseas && !window.platformENV.isLocal && (
        <Fragment>
          <div className="flexRow alignItemsCenter mBottom16">
            <div className="bold flex">{_l('身份认证')}</div>
            {authType === 2 && (
              <div
                className="addBtn"
                onClick={() => {
                  window.open(
                    `/certification/project/${Config.projectId}?type=add&returnUrl=${encodeURIComponent(location.href)}`,
                  );
                }}
              >
                <Icon icon="add" className="Font18 mRight4" />
                <span className="bold">{_l('添加')}</span>
              </div>
            )}
          </div>
          <CertificationDisplay
            fromType={3}
            projectId={Config.projectId}
            authType={authType}
            onUpdateCertStatus={value => setAuthType(value)}
            certList={certList}
            onRefreshCertList={getCertList}
          />
          <div className="split-line mTop32 mBottom32" />
        </Fragment>
      )}

      <SmsSignature authType={authType} projectId={Config.projectId} />
    </Wrapper>
  );
}
