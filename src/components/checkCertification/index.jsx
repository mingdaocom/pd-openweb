import React from 'react';
import _ from 'lodash';
import certImg from 'staticfiles/images/cert.png';
import { Modal } from 'ming-ui/antd-components';
import certificationApi from 'src/api/certification';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { getAccountPersonalUrl, pathCompletion } from 'src/utils/platform/navigation/path';
import { getCurrentProject } from 'src/utils/services/project';

export const identityInterception = (projectId, isPersonal) => {
  const isMobile = browserIsMobile();

  Modal.confirm({
    title: _l('认证提示'),
    className: 'identityDialogContainer',
    width: isMobile ? 320 : 480,
    styles: {
      header: { padding: '56px 24px 30px' },
      footer: { paddingBottom: 50, textAlign: 'center' },
    },
    content: (
      <div className="flexColumn justifyContentCenter alignItemsCenter">
        <img src={certImg} width={100} />
        <div className={`bold textPrimary TxtCenter LineHeight25 ${isMobile ? 'mTop32 Font16' : 'mTop40 Font20'}`}>
          {!isMobile
            ? isPersonal
              ? _l('无法使用此功能，请先完成个人认证')
              : _l('无法使用此功能，请先完成企业认证')
            : _l('无法使用此功能，请先前往Web端完成认证')}
        </div>
      </div>
    ),
    okText: !isMobile ? _l('立即认证') : _l('确定'),
    okButtonProps: { style: { borderRadius: 18 } },
    onOk: () => {
      if (!isMobile) {
        location.href = isPersonal ? getAccountPersonalUrl() : pathCompletion(`/admin/certinfo/${projectId}`);
      }
    },
    cancelButtonProps: {
      style: {
        display: 'none',
      },
    },
  });
};

export const checkCertification = props => {
  const { projectId, checkSuccess, isPersonal, forceCheck = false, authType = 1 } = props;
  const paidProjects = (_.get(md, 'global.Account.projects') || []).filter(
    project => _.get(project, 'licenseType') === 1,
  );

  if (isPersonal ? !paidProjects.length : [0, 2].includes(getCurrentProject(projectId).licenseType) || forceCheck) {
    const isCert = certificationApi.checkIsCert(
      isPersonal ? { certSource: 0, authType: 1 } : { certSource: 1, projectId, authType },
      { ajaxOptions: { sync: true } },
    );

    !isCert ? identityInterception(projectId, isPersonal) : checkSuccess();
  } else {
    checkSuccess();
  }
};
