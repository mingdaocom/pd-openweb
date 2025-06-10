import React, { useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv } from 'ming-ui';
import certificationApi from '../../api/certification';
import SelectCertification from './SelectCertification';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  .certBtn {
    color: #2196f3;
    font-weight: bold;
    width: fit-content;
    cursor: pointer;
    &:hover {
      color: #49adfc;
    }

    &.certified {
      height: 30px;
      display: flex;
      align-items: center;
      color: #4caf50;
      background: #ecf6ec;
      padding: 0 12px;
      border-radius: 4px;
      &:hover {
        background: #d3f4d3;
      }
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

export default function CertificationButton(props) {
  const { authType = 0, projectId, onUpdateCertStatus } = props;
  const [detailVisible, setDetailVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const onVerify = isUpgrade => {
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
          SelectCertification({ certList: res, projectId, onUpdateCertStatus });
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
      <div
        className={cx('certBtn', { certified: authType !== 0 })}
        onClick={() => {
          authType === 0 ? onVerify() : setDetailVisible(true);
        }}
      >
        {!authType ? (
          _l('立即认证')
        ) : (
          <React.Fragment>
            <Icon icon="gpp_good" className="Font16" />
            <span className="mLeft2">{authType === 1 ? _l('个人已认证') : _l('企业已认证')}</span>
          </React.Fragment>
        )}
      </div>
      {projectId && authType === 1 && (
        <div className="certBtn mLeft12" onClick={() => onVerify(true)}>
          {_l('升级到组织认证')}
        </div>
      )}

      <DetailDialog
        visible={detailVisible}
        width={800}
        footer={null}
        onCancel={() => {
          setDetailVisible(false);
          setLoading(true);
        }}
      >
        <div className="detailWrapper flexColumn justifyContentCenter alignItemsCenter">
          {loading && <LoadDiv className="loadDiv" />}
          <iframe
            className="w100 h100 Border0"
            style={{ display: loading ? 'none' : 'block' }}
            src={`${md.global.Config.WebUrl}certificationDetail/${projectId ? `project/${projectId}` : 'personal'}`}
            onLoad={() => setLoading(false)}
          />
        </div>
      </DetailDialog>
    </Wrapper>
  );
}
