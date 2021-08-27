import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';

import './style.less';

import Icon from 'ming-ui/components/Icon';
import Form from '../form';
import EditButton from '../edit-button';
import { UID } from '../../../lib';

class SubGroupRepeat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dataList: this.getInitDataList(),
      /**
       * 编辑模式
       */
      editMode: false,
      /**
       * 添加模式
       */
      addMode: false,
    };
  }

  /**
   * 获取初始 dataList
   */
  getInitDataList = () => {
    const dataList = this.props.dataList.map((item, i, list) => {
      return {
        id: UID.generate(),
        data: item,
      };
    });

    return dataList;
  };

  /**
   * 获取全部明细的值
   */
  getControlList = () => {
    const details = {};

    if (this.state.dataList && this.state.dataList) {
      this.state.dataList.map((item, i, list) => {
        const data = {};
        item.data.map((_item, j, _list) => {
          data[_item.id] = {
            value: _item.value,
            valueText: _item.valueText,
            configLabel: _item.config && _item.config.label ? _item.config.label : '',
          };
          return null;
        });

        details[item.id] = data;

        return null;
      });
    }

    return details;
  };

  /**
   * 获取明细的默认值
   */
  getDefaultControls = () => {
    const controls = {};

    if (this.props.data && this.props.data) {
      this.props.data.map((item, i, list) => {
        controls[item.id] = item.value;

        return null;
      });
    }

    return controls;
  };

  /**
   * 更新 state.dataList
   */
  updateList = (controlList) => {
    const dataList = [];

    for (const i in controlList) {
      if (controlList[i]) {
        dataList.push({
          id: i,
          data: this.merge(controlList[i]),
        });
      }
    }

    this.setState({
      dataList,
    });
  };

  /**
   * 合并表单数据和值
   */
  merge = (values) => {
    const newData = [];

    this.props.data.map((item, i, list) => {
      const _item = _.cloneDeep(item);
      if (values[_item.id]) {
        const formData = values[_item.id];

        _item.value = formData.value;
        _item.valueText = formData.valueText;
        if (_item.config) {
          _item.config.label = formData.configLabel;
        }
      }

      newData.push(_item);

      return null;
    });

    return newData;
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
    if (this.state.editMode) {
      this.setState({
        editMode: false,
      });
    }
  };

  /**
   * 切换到添加模式
   */
  enterAddMode = (event) => {
    this.setState({
      addMode: true,
    });
  };

  /**
   * 退出添加模式
   */
  exitAddMode = () => {
    if (this.state.addMode) {
      this.setState({
        addMode: false,
      });
    }
  };

  /**
   * 删除表单
   */
  deleteForm = (index) => {
    return this.saveForm({}, index, {}, true);
  };

  /**
   * 保存表单
   * id = -1 添加
   * isDelete - 是否为删除模式
   */
  saveForm = (values, id, data, isDelete) => {
    const controlList = this.getControlList();
    const defaultControls = this.getDefaultControls();
    if (id === -1) {
      // add new data
      const _id = UID.generate();
      controlList[_id] = Object.assign({}, defaultControls, data);
    } else {
      // update data
      // delete
      let _data = null;
      if (!isDelete) {
        _data = Object.assign({}, controlList[id], data);
      }
      controlList[id] = _data;
    }

    const dataList = [];

    for (const i in controlList) {
      if (controlList[i]) {
        const list = [];
        for (const j in controlList[i]) {
          if (controlList[i][j]) {
            const _data = {};
            const value = controlList[i][j].value;
            _data[j] = value;

            // convert Date list
            if (_.isArray(value)) {
              _data[j] = [new Date(value[0]).getTime(), new Date(value[1]).getTime()];
            }

            list.push(_data);
          }
        }
        if (list.length) {
          dataList.push(list);
        }
      }
    }

    const formControls = [];
    const controlData = {};
    if (dataList) {
      controlData[this.props.id] = dataList;
      formControls.push(controlData);
    }

    if (this.props.saveForm) {
      return this.props
        .saveForm(this.props.id, {
          controls: [],
          formControls,
        })
        .then(() => {
          if (id !== -1 && !isDelete) {
            // edit
            this.exitEditMode();
          }

          // update list
          this.updateList(controlList);
        });
    }
  };

  /**
   * 渲染表单和表单列表
   */
  renderContents = () => {
    const contents = [];

    if (this.state.dataList) {
      // repeat
      this.state.dataList.map((item, i, list) => {
        contents.push(
          <Form
            key={`form-${item.id}`}
            data={item.data}
            editable={this.props.editable}
            deletable
            deleteForm={() => {
              return this.deleteForm(item.id);
            }}
            saveForm={(values, data) => {
              return this.saveForm(values, item.id, data);
            }}
          />
        );

        return null;
      });
    }

    // add form
    if (this.state.addMode) {
      contents.push(
        <Form
          key="form-add"
          data={this.props.data}
          mode="edit"
          exitEditMode={() => {
            this.exitAddMode();
          }}
          saveForm={(values, data) => {
            return this.saveForm(values, -1, data);
          }}
        />
      );
    } else {
      if (this.props.editable) {
        contents.push(
          <button
            key="form-btn"
            className="dossier-user-addmore"
            onClick={(event) => {
              this.enterAddMode(event);
            }}
          >
            <Icon icon="plus" />
            <span>{_l('添加')}</span>
          </button>
        );
      }
    }

    if (!this.props.data || !this.props.data.length) {
      contents.push(<div className="dossier-user-formgroup-subgroup-empty">{_l('暂无可查看字段')}</div>);
    }

    return contents;
  };

  render() {
    const contents = this.renderContents();

    const classList = ['dossier-user-formgroup-subgroup'];
    if (this.props.repeat) {
      classList.push('dossier-user-formgroup-subgroup-repeat');
    }
    const classNames = classList.join(' ');

    let editButton = null;
    if (!this.props.repeat && this.props.data && this.props.data.length && this.props.editable && !this.state.editMode) {
      editButton = (
        <EditButton
          onClick={(event) => {
            this.enterEditMode(event);
          }}
        />
      );
    }

    return (
      <div className={classNames}>
        <h4 className="dossier-user-formgroup-subgroup-name">
          <span>{_l(this.props.name)}</span>
          {editButton}
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

SubGroupRepeat.defaultProps = {
  id: '',
  name: '',
  data: [],
  repeat: true,
  dataList: [],
  editable: true,
  deleteForm: () => {
    //
  },
  saveForm: () => {
    //
  },
};

export default SubGroupRepeat;
