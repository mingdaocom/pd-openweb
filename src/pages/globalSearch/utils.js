import _ from 'lodash';

export const getAppResultCodeText = (code, name) => {
  if (code === 2) {
    return _l('数据正在初始化，请耐心等待');
  }
  if (code === 3) {
    return `”${name}“ ${_l('当前版本没有此功能，请升级版本')}`;
  }
  return null;
};

export const getCurrentProjectId = () => {
  if (!_.get(md, 'global.Account.projects') || _.get(md, 'global.Account.projects').length === 0) return '';

  let id = localStorage.getItem('currentProjectId');
  if (!id || !md.global.Account.projects.find(l => l.projectId === id)) {
    return md.global.Account.projects[0].projectId;
  }
  return localStorage.getItem('currentProjectId');
};

export const getImgUrl = url => {
  return url ? url.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/100/h/100/q/90') : '';
};
