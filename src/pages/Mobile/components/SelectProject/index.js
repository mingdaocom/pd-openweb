import React, { Fragment, useEffect, useState } from 'react';
import { ActionSheet } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { getCurrentProject } from 'src/utils/project';
import './index.less';

export default function SelectProject(props) {
  const { changeProject = () => {}, noCache = false, filterExternal = false, projectId } = props;
  let actionSheetHandler = null;
  const projects = md.global.Account.projects.concat(
    filterExternal ? [] : [{ companyName: _l('外部协作'), projectId: 'external' }],
  );
  const projectObj = getCurrentProject(
    projectId || localStorage.getItem('currentProjectId') || (md.global.Account.projects[0] || {}).projectId,
  );

  const [currentProject, setCurrentProject] = useState(
    !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') },
  );

  useEffect(() => {
    return () => {
      actionSheetHandler && actionSheetHandler.close();
    };
  }, []);

  const handleSelectProject = () => {
    actionSheetHandler = ActionSheet.show({
      popupClassName: 'selectProjectWrap',
      actions: projects.map(item => {
        const isFree = item.licenseType === 0; // 免费版
        const isTrial = item.licenseType === 2; // 试用版
        return {
          project: item,
          key: item.projectId,
          text: (
            <Fragment key={item.projectId}>
              <span className="flex Bold ellipsis">{item.companyName}</span>
              <div className={cx('Font12 mLeft10 Gray_9e Normal', { trial: isTrial, free: isFree })}>
                {isFree ? _l('免费版') : isTrial ? _l('试用') : _.get(item, 'version.name')}
              </div>
            </Fragment>
          ),
        };
      }),
      extra: (
        <div className="flexRow header">
          <span className="Font13">{_l('切换组织')}</span>
          <div className="closeIcon" onClick={() => actionSheetHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: action => {
        const { project } = action;
        // 人员选择层不需要真实修改组织
        if (!noCache) {
          safeLocalStorageSetItem('currentProjectId', project.projectId);
        }
        setCurrentProject(project);
        changeProject(noCache && { project });
        actionSheetHandler.close();
      },
    });
  };

  return (
    <div className="flexRow valignWrapper pLeft16 pRight16 pTop10 pBottom10" onClick={handleSelectProject}>
      <div className="Font17 bold ellipsis">{currentProject.companyName}</div>
      <div className="flexColumn valignWrapper mLeft10">
        <Icon className="Gray_9e Font14" icon="expand_less" style={{ lineHeight: '10px' }} />
        <Icon className="Gray_9e Font14" icon="expand_more" style={{ lineHeight: '10px' }} />
      </div>
    </div>
  );
}
