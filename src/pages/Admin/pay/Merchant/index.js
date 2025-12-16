import React, { Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Button, Icon, UpgradeIcon } from 'ming-ui';
import { getMyPermissions, hasPermission } from 'src/components/checkPermission';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { getRequest } from 'src/utils/common';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import Config from '../../config';
import MerchantCom from './components/MerchantCom';

const CreateButton = styled(Button)`
  &.createDisabled {
    background: #eee !important;
  }
`;

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
                className="Gray_9 hoverText Font17 mRight24"
                onClick={() => this.com && this.com.getDataList()}
              />
              {showCreateMerchant && hasManageMerchantAuth && (
                <CreateButton
                  className={cx('pLeft15 pRight15', { 'Gray createDisabled': featureType === '2' })}
                  type="primary"
                  radius={featureType === '2'}
                  onClick={() => {
                    if (this.com && this.com.changeCreateMerchant) {
                      this.com.changeCreateMerchant('createMerchantVisible', true);
                    }
                  }}
                >
                  {featureType === '2' && <i className="icon icon-add Font17 TxtMiddle mRight4" />}
                  <span className="TxtMiddle"> {_l('创建商户')}</span>
                  {featureType === '2' && <UpgradeIcon />}
                </CreateButton>
              )}
            </div>
          </div>
        )}
        <div
          className={cx('flexColumn', {
            orgManagementContent: showHeader,
            orgManagementWrap: !showHeader,
            overflowHidden: this.com,
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
