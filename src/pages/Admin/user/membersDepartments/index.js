import React, { Component } from 'react';
import Members from './structure';
import Resigned from './resignation';
import DialogSettingInviteRules from './structure/components/dialogSettingInviteRules';
import Config from '../../config'
import cx from 'classnames';

export default class MembersDepartments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'member',
      showDialogSettingInviteRules: false,
      showHeader: true,
    };
  }
  changeInviteRulesDialog = () => {
    this.setState({
      showDialogSettingInviteRules: !this.state.showDialogSettingInviteRules,
    });
  };
  setValue = ({ showDialogSettingInviteRules }) => {
    this.setState({
      showDialogSettingInviteRules: showDialogSettingInviteRules,
    });
  };

  render() {
    const { currentTab, showDialogSettingInviteRules, showHeader } = this.state;
    const projectId = Config.projectId

    return (
      <div className="orgManagementWrap">
        {showHeader && (
          <div className="orgManagementHeader">
            <div className="tabBox">
              {[
                { key: 'member', label: _l('成员与部门') },
                { key: 'resigned', label: _l('已离职') },
              ].map(({ key, label }) => {
                return (
                  <div
                    key={key}
                    className={cx('tabItem', { active: currentTab === key })}
                    onClick={() => this.setState({ currentTab: key })}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
            {/* {currentTab === 'member' && (
              <div className="Gray_9e Hand" onClick={this.changeInviteRulesDialog}>
                <i className="icon-settings Font16 mRight6 TxtMiddle" />
                <span className="Font12">{_l('人员加入规则')}</span>
              </div>
            )} */}
          </div>
        )}
        <div className={cx('orgManagementContent', { pAll0: currentTab === 'member' })}>
          {currentTab === 'member' ? (
            <Members projectId={projectId} handleShowHeader={visible => this.setState({ showHeader: visible })} />
          ) : (
            <Resigned projectId={projectId} />
          )}
        </div>

        {showDialogSettingInviteRules && (
          <DialogSettingInviteRules
            showDialogSettingInviteRules={showDialogSettingInviteRules}
            setValue={this.setValue}
            projectId={projectId}
          />
        )}
      </div>
    );
  }
}
