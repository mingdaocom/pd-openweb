import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, PopupWrapper } from 'ming-ui';
import { getCurrentProject } from 'src/utils/project';
import './index.less';

export default function SelectProject(props) {
  const { changeProject = () => {}, noCache = false, filterExternal = false, projectId, className } = props;
  const projects = (md.global.Account.projects || []).concat(
    filterExternal ? [] : [{ companyName: _l('外部协作'), projectId: 'external' }],
  );
  const projectObj = getCurrentProject(
    projectId || localStorage.getItem('currentProjectId') || ((md.global.Account.projects || [])[0] || {}).projectId,
  );

  const [currentProject, setCurrentProject] = useState(
    !_.isEmpty(projectObj) ? projectObj : { projectId: 'external', companyName: _l('外部协作') },
  );
  const [visible, setVisible] = useState(false);

  const handleSelectProject = () => setVisible(true);

  const handleProjectClick = project => {
    // 人员选择层不需要真实修改组织
    if (!noCache) {
      safeLocalStorageSetItem('currentProjectId', project.projectId);
    }

    setCurrentProject(project);
    changeProject(noCache && { project });
    setVisible(false);
  };

  return (
    <React.Fragment>
      <div
        className={cx('flexRow valignWrapper pLeft16 pRight16 pTop10 pBottom10', className)}
        onClick={handleSelectProject}
      >
        <div className="Font17 bold ellipsis">{currentProject.companyName}</div>
        <div className="flexColumn valignWrapper mLeft10">
          <Icon className="textTertiary Font14" icon="expand_less" style={{ lineHeight: '10px' }} />
          <Icon className="textTertiary Font14" icon="expand_more" style={{ lineHeight: '10px' }} />
        </div>
      </div>
      <PopupWrapper
        className="selectProjectWrap"
        bodyClassName="autoHeightPopupBody selectProjectBody"
        visible={visible}
        title={_l('切换组织')}
        headerType="withIcon"
        headerTitleAlign="left"
        onClose={() => setVisible(false)}
      >
        <div className="selectProjectList">
          {projects.map(item => {
            const isFree = item.licenseType === 0; // 免费版
            const isTrial = item.licenseType === 2; // 试用版
            return (
              <div
                className="selectProjectItem flexRow alignItemsCenter"
                key={item.projectId}
                onClick={() => handleProjectClick(item)}
              >
                <span className="flex Bold ellipsis Font15">{item.companyName}</span>
                <div className={cx('Font12 mLeft10 textTertiary Normal', { trial: isTrial, free: isFree })}>
                  {isFree ? _l('免费版') : isTrial ? _l('试用') : _.get(item, 'version.name')}
                </div>
              </div>
            );
          })}
        </div>
      </PopupWrapper>
    </React.Fragment>
  );
}
