const API_SERVER = {
  local: '/wwwapi/',
};

const WEBPACK_PUBLIC_PATH = {
  local: '/dist/pack/',
};

module.exports = {
  apiServer: process.env.API_SERVER || API_SERVER[process.env.PUBLIC] || '/wwwapi/',
  webpackPublicPath: process.env.WEBPACK_PUBLIC_PATH || WEBPACK_PUBLIC_PATH[process.env.NODE_ENV] || '/dist/pack/',
};
