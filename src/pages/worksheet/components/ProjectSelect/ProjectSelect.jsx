import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'ming-ui/antd-components';
import './ProjectSelect.less';

export default class ProjectSelect extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
  };
  getLabelByValue(value) {
    const project = md.global.Account.projects.filter(project => project.projectId === value)[0];
    return project ? project.companyName : '';
  }
  getMenuItems() {
    const { onChange } = this.props;
    return md.global.Account.projects
      .map(project => ({
        key: project.projectId,
        label: project.companyName,
        onClick: () => onChange(project.projectId),
      }))
      .concat({
        key: 'personal',
        label: _l('个人'),
        onClick: () => onChange(''),
      });
  }
  render() {
    const { value } = this.props;
    return (
      <Dropdown trigger={['click']} menu={{ items: this.getMenuItems() }}>
        <div className="projectSelect pointer">
          <div className="selectedLabel">
            <span className="text ellipsis">{value ? this.getLabelByValue(value) : _l('个人')}</span>
            <i className="icon icon-arrow-down-border" />
          </div>
        </div>
      </Dropdown>
    );
  }
}
