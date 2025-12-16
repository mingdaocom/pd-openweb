import React, { Component } from 'react';
import cx from 'classnames';
import Config from '../../config';
import Resigned from './resignation';
import Members from './structure';

export default class MembersDepartments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTab: 'member',
      showHeader: true,
    };
  }

  render() {
    const { currentTab, showHeader } = this.state;
    const projectId = Config.projectId;

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
          </div>
        )}
        <div className={cx('orgManagementContent', { pAll0: currentTab === 'member' })}>
          {currentTab === 'member' ? (
            <Members
              projectId={projectId}
              handleShowHeader={visible => this.setState({ showHeader: visible })}
              authority={this.props.authority}
            />
          ) : (
            <Resigned projectId={projectId} authority={this.props.authority} />
          )}
        </div>
      </div>
    );
  }
}
