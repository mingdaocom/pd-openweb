export const getIsSuperAdmin = projectId => {
  safeLocalStorageSetItem('currentProjectId', projectId);
  const projectInfo = md.global.Account.projects.find(o => o.projectId === projectId) || {};
  return projectInfo.isSuperAdmin || projectInfo.isProjectAppManager;
};
