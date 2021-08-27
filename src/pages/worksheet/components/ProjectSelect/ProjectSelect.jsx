import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'ming-ui';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import Icon from 'ming-ui/components/Icon';
import './ProjectSelect.less';

export default class ProjectSelect extends Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      isSlideDown: false,
    };
  }
  getLabelByValue(value) {
    const project = md.global.Account.projects.filter(project => project.projectId === value)[0];
    return project ? project.companyName : '';
  }
  renderProjects() {
    const { onChange } = this.props;
    return md.global.Account.projects.map((project, index) => (
      <MenuItem
        key={index}
        onClick={() => {
          onChange(project.projectId);
          this.setState({ isSlideDown: false });
        }}
      >
        {project.companyName}
      </MenuItem>
    ));
  }
  render() {
    const { value, onChange } = this.props;
    const { isSlideDown } = this.state;
    return (
      <div className="projectSelect pointer">
        <div
          className="selectedLabel"
          onClick={() => {
            this.setState({ isSlideDown: !isSlideDown });
          }}
        >
          <span className="text ellipsis">{value ? this.getLabelByValue(value) : _l('个人')}</span>
          <i className="icon icon-arrow-down-border" />
        </div>
        {isSlideDown && (
          <Menu
            onClickAway={() => {
              this.setState({ isSlideDown: false });
            }}
          >
            {this.renderProjects()}
            <MenuItem
              onClick={() => {
                this.setState({ isSlideDown: false });
                onChange('');
              }}
            >
              {_l('个人')}
            </MenuItem>
          </Menu>
        )}
      </div>
    );
  }
}
