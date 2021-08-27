import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import Table from '../table';

class SubGroup extends Component {
  render() {
    return (
      <div className="dossier-print-subgroup">
        <h4 className="dossier-print-subgroup-name">
          <span>{this.props.name}</span>
        </h4>
        <Table data={this.props.data} />
      </div>
    );
  }
}

SubGroup.propTypes = {
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
};

SubGroup.defaultProps = {
  id: '',
  name: '',
  data: [],
};

export default SubGroup;
