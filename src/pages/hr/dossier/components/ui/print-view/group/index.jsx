import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import Table from './table';
import SubGroup from './sub-group';
import SubGroupRepeat from './sub-group-repeat';

class PrintGroup extends Component {
  /**
   * 渲染 Table 和 SubGroup 列表
   */
  renderContents = () => {
    const contents = [];

    // form data
    if (this.props.data && this.props.data.length) {
      contents.push(<Table key="table-0" data={this.props.data} />);
    }

    // sub groups
    if (this.props.groups && this.props.groups.length) {
      this.props.groups.map((item, i, list) => {
        if (item.repeat) {
          contents.push(<SubGroupRepeat key={`subgroup-${i}`} {...item} />);
        } else {
          contents.push(<SubGroup key={`subgroup-${i}`} {...item} />);
        }

        return null;
      });
    }

    return contents;
  };

  render() {
    let contents = [];
    if ((this.props.data && this.props.data.length) || (this.props.groups && this.props.groups.length)) {
      contents = this.renderContents();
    }

    return (
      <div className="dossier-print-group">
        <h3 className="dossier-print-group-name">
          <span>{this.props.name}</span>
        </h3>
        {contents}
      </div>
    );
  }
}

PrintGroup.propTypes = {
  /**
   * 分组 ID
   */
  id: PropTypes.string,
  /**
   * 分组名称
   */
  name: PropTypes.string,
  /**
   * 表单数据
   */
  data: PropTypes.any,
  /**
   * 子分组
   */
  groups: PropTypes.any,
};

PrintGroup.defaultProps = {
  id: '',
  name: '',
  data: [],
  groups: [],
};

export default PrintGroup;
