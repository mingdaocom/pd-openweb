import React, { Fragment } from 'react';
import { Checkbox } from 'ming-ui';
import Tooltip from 'ming-ui/antd-components/Tooltip';

export default function EnabledWebProxy(props) {
  const { isProxy, handleChangeProxy = () => {} } = props;

  if (!md.global.Config.IsLocal) {
    return null;
  }

  return (
    <Fragment>
      <div className="flex"></div>
      <div className="flexRow alignItemsCenter">
        <Checkbox checked={isProxy} onClick={checked => handleChangeProxy(checked)} />
        <span className="Font13 Normal">{_l('开启网络代理')}</span>
        <Tooltip title={_l('需在平台管理-安全中配置网络代理信息')}>
          <i className="icon-info_outline Font18 Gray_9e mLeft10 mRight20" />
        </Tooltip>
      </div>
    </Fragment>
  );
}
