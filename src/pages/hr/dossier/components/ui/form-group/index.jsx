import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import Form from './form';
import SubGroup from './sub-group';
import SubGroupRepeat from './sub-group-repeat';
import EditButton from './edit-button';

class FormGroup extends Component {
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
   */
  saveForm = (id, values) => {
    const controls = [];
    for (const key in values) {
      if (values[key] !== undefined) {
        const data = {};
        data[key] = values[key];
        controls.push(data);
      }
    }
    if (this.props.saveForm) {
      return this.props.saveForm(id, {
        controls,
        formControls: [],
      });
    }
  };

  /**
   * 保存明细
   */
  saveDetail = (groupId, data) => {
    if (this.props.saveForm) {
      return this.props.saveForm(groupId, data);
    }
  };

  /**
   * 渲染 Form 和 SubGroup 列表
   */
  renderContents = () => {
    const contents = [];

    // form data
    if (this.props.data && this.props.data.length) {
      let formMode = 'display';
      if (this.state.editMode) {
        formMode = 'edit';
      }

      contents.push(
        <Form
          key="form-0"
          data={this.props.data}
          mode={formMode}
          exitEditMode={() => {
            this.exitEditMode();
          }}
          saveForm={(values) => {
            return this.saveForm(this.props.id, values);
          }}
        />
      );
    }

    // sub groups
    if (this.props.groups && this.props.groups.length) {
      this.props.groups.map((item, i, list) => {
        if (item.repeat) {
          contents.push(
            <SubGroupRepeat
              key={`subgroup-${i}`}
              {...item}
              editable={this.props.editable && item.editable}
              saveForm={(groupId, data) => {
                return this.saveDetail(groupId, data);
              }}
            />
          );
        } else {
          contents.push(
            <SubGroup
              key={`subgroup-${i}`}
              {...item}
              editable={this.props.editable && !item.disabled}
              saveForm={(groupId, data) => {
                return this.saveForm(groupId, data);
              }}
            />
          );
        }

        return null;
      });
    }

    if ((!this.props.data || !this.props.data.length) && (!this.props.groups || !this.props.groups.length)) {
      contents.push(<div className="dossier-user-formgroup-empty">{_l('暂无可查看字段')}</div>);
    }

    return contents;
  };

  render() {
    let contents = [];
    if ((this.props.data && this.props.data.length) || (this.props.groups && this.props.groups.length)) {
      contents = this.renderContents();
    }

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

    return (
      <div className="dossier-user-formgroup">
        <h3 className="dossier-user-formgroup-name ThemeAfterBGColor3">
          <span>{_l(this.props.name)}</span>
          {editButton}
        </h3>
        {contents}
      </div>
    );
  }
}

FormGroup.propTypes = {
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
  /**
   * 是否可编辑
   */
  editable: PropTypes.bool,
  /**
   * 删除表单
   */
  deleteForm: PropTypes.func,
  /**
   * 保存表单
   */
  saveForm: PropTypes.func,
};

FormGroup.defaultProps = {
  id: '',
  name: '',
  data: [],
  groups: [],
  editable: true,
  deleteForm: () => {
    //
  },
  saveForm: () => {
    //
  },
};

export default FormGroup;
