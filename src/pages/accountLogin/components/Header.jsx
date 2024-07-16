import React from 'react';
import { connect } from 'react-redux';

function Header(props) {
  const { lineLoading, info = {}, loading } = props;

  let logo = '';
  if (!_.get(md, 'global.Config.IsLocal')) {
    if (info.hasGetLogo) {
      logo = info.isDefaultLogo ? '' : info.logo;
    } else {
      logo = info.logo || `${_.get(md, 'global.FileStoreConfig.pictureHost')}ProjectLogo/default.png`;
    }
  } else {
    logo = info.logo || _.get(md, 'global.SysSettings.brandLogoUrl');
  }

  return (
    <React.Fragment>
      {lineLoading && <div className="loadingLine"></div>}
      {!loading && !_.get(md, 'global.SysSettings.hideBrandLogo') && logo && (
        <div className="titleHeader">
          <a href={isMingDaoApp || _.get(md, 'global.Config.IsLocal') ? 'javascript:;' : '/'}>
            <img src={logo} height={_.get(md, 'global.SysSettings.brandLogoHeight') || 40} />
          </a>
        </div>
      )}
    </React.Fragment>
  );
}

const WrappedComp = connect(({ accountInfo, stateList }) => ({
  info: accountInfo,
  lineLoading: stateList.lineLoading,
  loading: stateList.loading,
}))(Header);

export default WrappedComp;
