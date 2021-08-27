import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Dialog from 'ming-ui/components/Dialog';
import _ from 'lodash';

import './style.less';

import List from '../list';
import FormContainer from '../../../form-container';
import EditButton from '../edit-button';
import Toolbar from './toolbar';

class Form extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * 表单数据
       */
      data: this.props.data || [],
      /**
       * 编辑模式
       */
      editMode: false,
    };

    /**
     * 表单值
     */
    this.values = null;
    /**
     * 错误信息
     */
    this.errorData = null;
    /**
     * 更新后的表单数据
     */
    this.formData = null;
  }

  // componentWillReceiveProps(nextProps) {
  //   if (!_.isEqual(this.props.data, nextProps.data)) {
  //     this.setState({
  //       data: nextProps.data,
  //     });
  //   }
  // }

  getListData = () => {
    let data = [];

    if (this.state.data && this.state.data.length) {
      data = this.state.data.map((item, i, list) => {
        return {
          id: item.id,
          row: item.row,
          col: item.col,
          size: item.size,
          label: item.label,
          valueText: item.valueText,
        };
      });
    }

    return data;
  };

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
    if (this.props.mode === 'edit') {
      if (this.props.exitEditMode) {
        this.props.exitEditMode();
      }
      this.setState({
        showError: false,
      });
    } else if (this.state.editMode) {
      this.setState({
        editMode: false,
        showError: false,
      });
    }
  };

  /**
   * 检查表单
   */
  valid = () => {
    if (this.errorData) {
      for (const id in this.errorData) {
        if (this.errorData[id]) {
          return false;
        }
      }
    }

    return true;
  };

  /**
   * 更新 valueText
   */
  updateValueText = () => {
    const newData = [];

    this.state.data.map((item, i, list) => {
      const _item = _.cloneDeep(list[i]);

      if (this.formData[_item.id]) {
        const formData = this.formData[_item.id];

        _item.value = formData.value;
        _item.valueText = formData.valueText;
        if (_item.config) {
          _item.config.label = formData.configLabel;
        }
      }

      newData.push(_item);

      return null;
    });

    this.setState({
      data: newData,
    });
  };

  deleteOnClick = (event) => {
    // Dialog.confirm
    Dialog.confirm({
      title: _l('删除该数据？'),
      description: _l('删除后将无法恢复'),
      type: 'danger',
      onCancel: () => {
        //
      },
      onOk: () => {
        if (this.props.deleteForm) {
          this.props.deleteForm().then(() => {
            // exit edit mode
            this.exitEditMode();
          });
        }
      },
    });
  };

  cancelOnClick = (event) => {
    // exit edit mode
    this.exitEditMode();
  };

  okOnClick = (event) => {
    // check valid
    if (!this.valid()) {
      alert(_l('请正确填写表单'), 2);

      this.setState({
        showError: true,
      });

      return;
    } else {
      this.setState({
        showError: false,
      });
    }

    if (!this.values) {
      alert(_l('未修改过该表单'), 2);

      return;
    }

    // POST data
    if (this.props.saveForm) {
      this.props.saveForm(this.values, this.formData).then(() => {
        // update state.data for <List />
        this.updateValueText();
        // exit edit mode
        this.exitEditMode();
      });
    }
  };

  formOnChange = (event, id, values, data) => {
    // update this.values
    this.values = values;

    this.formData = Object.assign({}, this.formData, data);
  };

  formOnError = (error, id, errorData) => {
    // update this.errorData
    this.errorData = errorData;
  };

  formOnValid = (id, errorData) => {
    // update this.errorData
    this.errorData = errorData;
  };

  render() {
    const listData = this.getListData();
    let content = <List data={listData} />;
    if (this.props.mode === 'edit' || this.state.editMode) {
      content = (
        <FormContainer
          data={this.state.data}
          showError={this.state.showError}
          onChange={(event, id, values, data) => {
            this.formOnChange(event, id, values, data);
          }}
          onError={(error, id, errorData) => {
            this.formOnError(error, id, errorData);
          }}
          onValid={(id, errorData) => {
            this.formOnValid(id, errorData);
          }}
        />
      );
    }

    let toolbar = null;
    if (this.props.mode === 'edit' || this.state.editMode) {
      toolbar = (
        <Toolbar
          deletable={this.props.deletable}
          deleteOnClick={(event) => {
            this.deleteOnClick(event);
          }}
          cancelOnClick={(event) => {
            this.cancelOnClick(event);
          }}
          okOnClick={(event) => {
            this.okOnClick(event);
          }}
        />
      );
    }

    let editButton = null;
    if (this.props.editable && !this.state.editMode) {
      editButton = (
        <EditButton
          onClick={(event) => {
            this.enterEditMode(event);
          }}
        />
      );
    }

    return (
      <div className="dossier-user-form">
        {content}
        {toolbar}
        {editButton}
      </div>
    );
  }
}

Form.propTypes = {
  /**
   * 显示模式
   */
  mode: PropTypes.oneOf([
    /**
     * 展示
     */
    'display',
    /**
     * 编辑
     */
    'edit',
  ]),
  /**
   * 表单数据（不接受数据更新）
   */
  data: PropTypes.any,
  /**
   * 是否可编辑（重复表单）
   */
  editable: PropTypes.bool,
  /**
   * 【回调】退出编辑模式
   */
  exitEditMode: PropTypes.func,
  /**
   * 是否支持删除动作
   */
  deletable: PropTypes.bool,
  /**
   * 删除表单
   */
  deleteForm: PropTypes.func,
  /**
   * 保存表单
   */
  saveForm: PropTypes.func,
};

Form.defaultProps = {
  mode: 'display',
  data: [],
  editable: false,
  deletable: false,
  exitEditMode: () => {
    //
  },
  deleteForm: () => {
    //
  },
  saveForm: () => {
    //
  },
};

export default Form;
