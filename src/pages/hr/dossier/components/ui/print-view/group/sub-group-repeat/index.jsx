import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Table from '../table';

class SubGroupRepeat extends Component {
  /**
   * 渲染表单和表单列表
   */
  renderContents = () => {
    const contents = [];

    if (this.props.dataList) {
      // repeat
      this.props.dataList.map((item, i, list) => {
        contents.push(<Table key={`form-${i}`} data={item} />);

        return null;
      });
    }

    return contents;
  };

  render() {
    const contents = this.renderContents();

    const classList = ['dossier-print-subgroup'];
    if (this.props.repeat) {
      classList.push('dossier-print-subgroup-repeat');
    }
    const classNames = classList.join(' ');

    return (
      <div className={classNames}>
        <h4 className="dossier-print-subgroup-name">
          <span>{this.props.name}</span>
        </h4>
        {contents}
      </div>
    );
  }
}

SubGroupRepeat.propTypes = {
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
   * 是否重复
   */
  repeat: PropTypes.bool,
  /**
   * 表单数据列表（仅重复模式）
   */
  dataList: PropTypes.any,
};

SubGroupRepeat.defaultProps = {
  id: '',
  name: '',
  data: [],
  repeat: true,
  dataList: [],
};

export default SubGroupRepeat;
