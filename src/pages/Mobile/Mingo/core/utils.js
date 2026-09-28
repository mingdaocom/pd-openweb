import { get } from 'lodash';
import { getCurrentProject } from 'src/utils/services/project';

export function getDefaultProject() {
  const projects = get(md, 'global.Account.projects', []) || [];
  const projectId = localStorage.getItem('currentProjectId') || get(projects, '[0].projectId', '');

  return getCurrentProject(projectId) || projects[0] || {};
}

export function syncMingoProjectFromUrl({ pathname = window.location.pathname, search = window.location.search } = {}) {
  if (!isMobileMingoRoute(pathname)) return '';

  const projectId = new URLSearchParams(search || '').get('projectId') || '';
  const project = getCurrentProject(projectId);

  if (!project.projectId) return '';

  safeLocalStorageSetItem('currentProjectId', project.projectId);
  return project.projectId;
}

export function isMobileMingoRoute(pathname = window.location.pathname) {
  return /\/mobile\/mingo(?:\/|$)/.test(pathname || '');
}

export function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function isCreateAppRoute(pathname = window.location.pathname) {
  return /\/mobile\/mingo\/create-app(?:\/[^/?#]+)?\/?$/.test(pathname || '');
}

// /embed/mingo/help：智能客服嵌入页（native 客户端内嵌），走本页的帮助异化形态
export function isHelpRoute(pathname = window.location.pathname) {
  return /\/embed\/mingo\/help\/?$/.test(pathname || '');
}

export function isAnonymousCreateAppRoute({
  pathname = window.location.pathname,
  search = window.location.search,
} = {}) {
  return isCreateAppRoute(pathname) && new URLSearchParams(search || '').get('anon') === '1';
}

export function isEntryCreateAppRoute({ pathname = window.location.pathname, search = window.location.search } = {}) {
  return isCreateAppRoute(pathname) && new URLSearchParams(search || '').get('entry') === '1';
}

export function getEntryHandoffKey({ search = window.location.search } = {}) {
  return new URLSearchParams(search || '').get('handoffKey') || '';
}

export function getInitialSessionId({ pathname = window.location.pathname, search = window.location.search } = {}) {
  const pathKey =
    (pathname || '').match(/\/mobile\/mingo\/create-app\/([^/?#]+)/)?.[1] ||
    (pathname || '').match(/\/mobile\/mingo\/(?!create-app(?:\/|$))([^/?#]+)/)?.[1];
  const params = new URLSearchParams(search || '');

  return pathKey ? decodeURIComponent(pathKey) : params.get('key') || '';
}
