import React, { useCallback, useState } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, ScrollView } from 'ming-ui';
import { Popover } from 'ming-ui/antd-components';
import { emitter } from 'src/utils/platform/browser/dom';

const PROJECT_POPOVER_ALIGN = { offset: [0, 4] };

const ProjectTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  max-width: 500px;
  height: 30px;
  padding: 3px 5px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 17px;
  font-weight: 600;
  line-height: 24px;
  cursor: pointer;

  .companyName {
    min-width: 0;
  }

  .Icon {
    flex: none;
    margin-left: 4px;
    color: var(--color-text-tertiary);
    font-size: 18px;
  }

  &:hover {
    background: var(--color-background-hover);
  }
`;

const ProjectsMenuCon = styled.div`
  width: 400px;
  padding: 5px 0;
`;

const ProjectOption = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  height: 40px;
  padding: 0 20px;
  border: 0;
  background: transparent;
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 500;
  line-height: 40px;
  text-align: left;
  cursor: pointer;

  &[aria-current='true'] {
    background: var(--color-primary-transparent);
    color: var(--color-primary);
  }

  &:not([aria-current='true']):hover {
    background: var(--color-background-hover);
  }
`;

const ProjectName = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProjectVersion = styled.span`
  flex: none;
  margin-left: 10px;
  color: var(--color-text-tertiary);
  font-size: 12px;
  font-weight: 400;
`;

const ScrollCon = styled(ScrollView)`
  height: ${({ $height }) => $height}px !important;
`;

export default function ProjectSwitch({ currentProject, projects, onChange }) {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const handleSwitchProject = useCallback(
    project => {
      setProjectMenuOpen(false);
      onChange(project);
      safeLocalStorageSetItem('currentProjectId', project.projectId);
      emitter.emit('CHANGE_CURRENT_PROJECT', project);
    },
    [onChange],
  );

  if (!currentProject) return null;

  const maxRows = Math.ceil((window.innerHeight - 110) / 40);
  let menuContent = projects.map(project => (
    <ProjectOption
      key={project.projectId}
      type="button"
      aria-current={project.projectId === currentProject.projectId ? 'true' : undefined}
      onClick={() => handleSwitchProject(project)}
    >
      <ProjectName>{project.companyName}</ProjectName>
      {_.get(project, 'version.name') && <ProjectVersion>{_.get(project, 'version.name')}</ProjectVersion>}
    </ProjectOption>
  ));

  if (projects.length > maxRows) {
    menuContent = <ScrollCon $height={maxRows * 40}>{menuContent}</ScrollCon>;
  }

  return (
    <Popover
      open={projectMenuOpen}
      content={<ProjectsMenuCon>{menuContent}</ProjectsMenuCon>}
      trigger="click"
      placement="bottomLeft"
      align={PROJECT_POPOVER_ALIGN}
      noPadding
      onOpenChange={setProjectMenuOpen}
    >
      <ProjectTrigger type="button" aria-expanded={projectMenuOpen}>
        <span className="companyName overflow_ellipsis">{currentProject.companyName}</span>
        <Icon icon="arrow-down-border" />
      </ProjectTrigger>
    </Popover>
  );
}

ProjectSwitch.propTypes = {
  currentProject: PropTypes.shape({
    companyName: PropTypes.string,
    projectId: PropTypes.string.isRequired,
  }),
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      companyName: PropTypes.string,
      projectId: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
};
