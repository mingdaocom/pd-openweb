import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';

import Icon from 'ming-ui/components/Icon';
import Form from '../form';
import EditButton from '../edit-button';
import { UID } from '../../../lib';

class SubGroup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * 编辑模式
       */
      editMode: false,
    };
  }

  /**
   * 切换到编辑模式
   */
  enterEditMode = (event) => {
    this.setState({
      editMode: true,
    });
  };

  /**
   * 退出编辑模式
   */
  exitEditMode = () => {
    if (this.state.editMode) {
      this.setState({
        editMode: false,
      });
    }
  };

  /**
   * 保存表单
   * id = -1 添加
   * isDelete - 是否为删除模式
   */
  saveForm = (values, id, data, isDelete) => {
    if (this.props.saveForm) {
      return this.props.saveForm(this.props.id, values).then(() => {
        this.exitEditMode();
      });
    }
  };

  render() {
    const classList = ['dossier-user-formgroup-subgroup'];
    const classNames = classList.join(' ');

    let editButton = null;
    if (this.props.data && this.props.data.length && this.props.editable && !this.state.editMode) {
      editButton = (
        <EditButton
          onClick={(event) => {
            this.enterEditMode(event);
          }}
        />
      );
    }

    let formMode = 'display';
    if (this.state.editMode) {
      formMode = 'edit';
    }

    let content = (
      <Form
        data={this.props.data}
        mode={formMode}
        exitEditMode={() => {
          this.exitEditMode();
        }}
        saveForm={(values, data) => {
          return this.saveForm(values, data);
        }}
      />
    );

    if (!this.props.data || !this.props.data.length) {
      content = <div className="dossier-user-formgroup-subgroup-empty">{_l('暂无可查看字段')}</div>;
    }

    return (
      <div className={classNames}>
        <h4 className="dossier-user-formgroup-subgroup-name">
          <span>{_l(this.props.name)}</span>
          {editButton}
        </h4>
        {content}
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
  /**
   * 是否可编辑
   */
  editable: PropTypes.bool,
  /**
   * 保存表单
   */
  saveForm: PropTypes.func,
};

SubGroup.defaultProps = {
  id: '',
  name: '',
  data: [],
  editable: true,
  saveForm: (id, data) => {
    //
  },
};

export default SubGroup;
