import React, { Fragment } from 'react';
import { Checkbox, Tooltip } from 'ming-ui/antd-components';

const CHECKBOX_STYLES = { label: { paddingInlineEnd: 0 } };

export default function EnabledWebProxy(props) {
  const { isProxy, handleChangeProxy = () => {} } = props;

  if (window.platformENV.isHap) {
    return null;
  }

  return (
    <Fragment>
      <div className="flex"></div>
      <div className="flexRow alignItemsCenter">
        <Checkbox
          checked={isProxy}
          styles={CHECKBOX_STYLES}
          onChange={event => handleChangeProxy(!event.target.checked)}
        >
          <span className="Font13 Normal">{_l('开启网络代理')}</span>
        </Checkbox>
        <Tooltip title={_l('需在平台管理-安全中配置网络代理信息')}>
          <i className="icon-info_outline Font18 textTertiary mLeft10 mRight20" />
        </Tooltip>
      </div>
    </Fragment>
  );
}
