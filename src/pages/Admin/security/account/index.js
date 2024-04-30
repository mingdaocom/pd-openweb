import React, { Component, Fragment } from 'react';
import FeatureListWrap from '../../components/FeatureListWrap';
import Config from '../../config';
import { VersionProductType } from 'src/util/enum';
import ContactsHiddenWrap from './contactsHidden';
import DialogSettingInviteRules from '../../user/membersDepartments/structure/components/dialogSettingInviteRules';

export default class Account extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDialogSettingInviteRules: false,
    };
  }

  render() {
    const { showDialogSettingInviteRules, showAddressRange } = this.state;
    const projectId = Config.projectId;

    if (showAddressRange) {
      return (
        <ContactsHiddenWrap onClose={() => this.setState({ showAddressRange: false })} projectId={Config.projectId} />
      );
    }

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader Font17">{_l('帐号')}</div>
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
