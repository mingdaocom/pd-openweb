import React from 'react';
import _ from 'lodash';
import certImg from 'staticfiles/images/cert.png';
import { Dialog } from 'ming-ui';
import certificationApi from 'src/api/certification';
import { browserIsMobile } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import './index.less';

export const identityInterception = (projectId, isPersonal) => {
  const isMobile = browserIsMobile();

  Dialog.confirm({
    title: '',
    className: 'identityDialogContainer',
    width: isMobile ? 320 : 480,
    description: (
      <div className="flexColumn justifyContentCenter alignItemsCenter">
        <img src={certImg} width={100} />
        <div className={`bold Gray TxtCenter LineHeight25 ${isMobile ? 'mTop32 Font16' : 'mTop40 Font20'}`}>
          {!isMobile
            ? isPersonal
              ? _l('无法使用此功能，请先完成个人认证')
              : _l('无法使用此功能，请先完成组织认证')
            : _l('无法使用此功能，请先前往Web端完成认证')}
        </div>
      </div>
    ),
    okText: !isMobile ? _l('立即认证') : _l('确定'),
    onOk: () => {
      !isMobile && (location.href = isPersonal ? '/personal?type=information' : `/admin/sysinfo/${projectId}`);
    },
    removeCancelBtn: true,
  });
};

export const checkCertification = props => {
  const { projectId, checkSuccess, isPersonal, forceCheck = false } = props;
  const paidProjects = (_.get(md, 'global.Account.projects') || []).filter(
    project => _.get(project, 'licenseType') === 1,
  );

  if (isPersonal ? !paidProjects.length : [0, 2].includes(getCurrentProject(projectId).licenseType) || forceCheck) {
    const isCert = certificationApi.checkIsCert(
      isPersonal ? { certSource: 0, authType: 1 } : { certSource: 1, projectId, authType: 1 },
      { ajaxOptions: { sync: true } },
    );

    !isCert ? identityInterception(projectId, isPersonal) : checkSuccess();
  } else {
    checkSuccess();
  }
};
