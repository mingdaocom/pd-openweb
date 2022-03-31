const API_SERVER = {
  local: '/wwwapi/',
};

const WEBPACK_PUBLIC_PATH = {
  local: '/dist/pack/',
};

module.exports = {
  apiServer: process.env.API_SERVER || API_SERVER[process.env.PUBLIC] || '/wwwapi/',
  workflowApiServer: process.env.WORKFLOW_API_SERVER,
  reportApiServer: process.env.REPORT_API_SERVER,
  webpackPublicPath: process.env.WEBPACK_PUBLIC_PATH || WEBPACK_PUBLIC_PATH[process.env.PUBLIC] || '/dist/pack/',
  API_SERVER,
};
