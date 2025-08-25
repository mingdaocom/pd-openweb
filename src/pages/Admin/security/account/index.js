import React, { Component } from 'react';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { VersionProductType } from 'src/utils/enum';
import FeatureListWrap from '../../components/FeatureListWrap';
import Config from '../../config';
import DialogSettingInviteRules from '../../user/membersDepartments/structure/components/dialogSettingInviteRules';
import ContactsHiddenWrap from './contactsHidden';
import UseInfoDisplaySettings from './UseInfoDisplaySettings';

export default class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDialogSettingInviteRules: false,
      showUseInfoDisplay: false,
    };
  }

  render() {
    const { showDialogSettingInviteRules, showAddressRange, showUseInfoDisplay } = this.state;
    const projectId = Config.projectId;

    if (showAddressRange) {
      return (
        <ContactsHiddenWrap onClose={() => this.setState({ showAddressRange: false })} projectId={Config.projectId} />
      );
    }

    if (showUseInfoDisplay) {
      return (
        <UseInfoDisplaySettings
          projectId={Config.projectId}
          onClose={() => this.setState({ showUseInfoDisplay: false })}
        />
      );
    }

    return (
      <div className="orgManagementWrap">
        <AdminTitle prefix={_l('安全 - 账号')} />
        <div className="orgManagementHeader Font17">{_l('账号')}</div>
        <FeatureListWrap
          projectId={projectId}
          configs={[
            {
              key: 'customIcon',
              title: _l('用户加入规则'),
              description: _l('设置用户加入组织时的规则和需要填写的信息'),
              showSlideIcon: true,
              onClick: () => this.setState({ showDialogSettingInviteRules: true }),
            },
            {
              key: 'addressVisibleRange',
              title: _l('通讯录可见范围'),
              description: _l('设置成员在可以看到的组织架构范围'),
              showSlideIcon: true,
              featureId: VersionProductType.contactsHide,
              onClick: () => this.setState({ showAddressRange: true }),
            },
            {
              key: 'useInfoDisplay',
              title: _l('成员信息显示'),
              description: _l('设置组织内成员互相可见的信息'),
              showSlideIcon: true,
              onClick: () => this.setState({ showUseInfoDisplay: true }),
            },
          ]}
        />

        {showDialogSettingInviteRules && (
          <DialogSettingInviteRules
            showDialogSettingInviteRules={showDialogSettingInviteRules}
            setValue={({ showDialogSettingInviteRules }) => this.setState({ showDialogSettingInviteRules })}
            projectId={projectId}
          />
        )}
      </div>
    );
  }
}
