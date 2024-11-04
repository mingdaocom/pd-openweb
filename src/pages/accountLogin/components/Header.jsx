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

  const brandLogoRedirectUrl = _.get(md, 'global.Config.IsLocal') ? md.global.SysSettings.brandLogoRedirectUrl : '/';
  const renderLogo = () => {
    return <img src={logo} height={_.get(md, 'global.SysSettings.brandLogoHeight') || 40} />;
  };
  return (
    <React.Fragment>
      {lineLoading && <div className="loadingLine"></div>}
      {!loading && !_.get(md, 'global.SysSettings.hideBrandLogo') && logo && (
        <div className="titleHeader">
          {isMingDaoApp || !brandLogoRedirectUrl ? renderLogo() : <a href={brandLogoRedirectUrl}>{renderLogo()}</a>}
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
