import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ProjectSwitch from './ProjectSwitch';

const Header = styled.header`
  z-index: 10;
  display: flex;
  align-items: center;
  flex: none;
  box-sizing: border-box;
  height: 50px;
  padding: 0 30px;
  background: var(--color-background-card);
  box-shadow: var(--shadow-sm);
`;

export default function AppSandboxHeader({ currentProject, projects, onProjectChange }) {
  return (
    <Header>
      <ProjectSwitch currentProject={currentProject} projects={projects} onChange={onProjectChange} />
    </Header>
  );
}

AppSandboxHeader.propTypes = {
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
  onProjectChange: PropTypes.func.isRequired,
};
