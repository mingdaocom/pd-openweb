import React, { Component } from 'react';
import cx from 'classnames';
import { Icon, UpgradeIcon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getRequest } from 'src/utils/platform/browser/device';
import { getFeatureStatus } from 'src/utils/services/project';
import { getMyPermissions, hasPermission } from 'src/utils/services/security/permission';
import Config from '../../config';
import MerchantCom from './components/MerchantCom';

export default class Merchant extends Component {
  constructor(props) {
    super(props);
    const { iscreate } = getRequest();
    this.state = {
      showHeader: iscreate === 'true' ? false : true,
      myPermissions: [],
    };
  }

  componentDidMount() {
    this.setState({ myPermissions: getMyPermissions(Config.projectId) });
  }

  render() {
    const { showHeader, showCreateMerchant, myPermissions } = this.state;
    const { iscreate } = getRequest();
    const featureType = getFeatureStatus(Config.projectId, VersionProductType.PAY);
    const { params } = this.props.match || {};

    const hasManageMerchantAuth = hasPermission(myPermissions, PERMISSION_ENUM.MANAGE_MERCHANT);

    return (
      <div className="orgManagementWrap">
        <AdminTitle prefix={_l('支付与开票 - 商户')} />
        {showHeader && (
          <div className="orgManagementHeader">
            <div className="tabBox">
              <span className="tabItem">{_l('商户')}</span>
            </div>
            <div className="flexRow alignItemsCenter">
              <Icon
                icon="task-later"
                className="textTertiary hoverText Font17 mRight24"
                onClick={() => this.com && this.com.getDataList()}
              />
              {showCreateMerchant && hasManageMerchantAuth && (
                <Button
                  type="primary"
                  shape={featureType === '2' ? 'round' : undefined}
                  onClick={() => {
                    if (this.com && this.com.changeCreateMerchant) {
                      this.com.changeCreateMerchant('createMerchantVisible', true);
                    }
                  }}
                >
                  <span className="TxtMiddle"> {_l('创建商户')}</span>
                  {featureType === '2' && <UpgradeIcon />}
                </Button>
              )}
            </div>
          </div>
        )}
        <div
          className={cx('flexColumn', {
            orgManagementContent: showHeader,
            orgManagementWrap: !showHeader,
            overflowHidden: this.com && this.com.state?.merchantList?.length > 0,
          })}
        >
          <MerchantCom
            ref={ele => (this.com = ele)}
            {...params}
            featureType={featureType}
            isCreate={iscreate}
            changeShowHeader={visible => this.setState({ showHeader: visible })}
            changeShowCreateMerchant={visible => this.setState({ showCreateMerchant: visible })}
            myPermissions={myPermissions}
          />
        </div>
      </div>
    );
  }
}
