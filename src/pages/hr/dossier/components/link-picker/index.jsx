import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';

import Icon from 'ming-ui/components/Icon';
import Dialog from 'ming-ui/components/Dialog';

import DialogRelationControl from 'src/components/relationControl/relationControl';
import { FormError } from '../lib';
import List from './list';

import './style.less';

const LinkTypes = {
  '0': '',
  '1': _l('任务'),
  '2': _l('项目'),
  '3': _l('日程'),
  '4': _l('文件'),
  '5': _l('申请单'),
  '7': _l('日程'),
};

class LinkPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * current value
       */
      value: this.props.value || [],
      /**
       * value error
       */
      error: false,
      // dirty
      dirty: false,
      // show error
      showError: false,
    };
  }

  componentDidMount() {
    // check init value
    this.checkValue(this.state.value, false);
  }

  componentWillReceiveProps(nextProps) {
    // apply value update
    if (nextProps.value !== this.props.value) {
      this.setState({
        value: nextProps.value,
      });
    }
    // showError changed
    if (nextProps.showError !== this.props.showError) {
      this.setState({
        showError: this.state.dirty || nextProps.showError,
      });
    }
  }

  /**
   * check value
   * @param {any} value - current value
   * @param {bool} dirty - value ever changed
   */
  checkValue = (value, dirty) => {
    const error = {
      type: '',
      message: '',
      dirty,
    };

    // required
    if (this.props.required && (!value || !value.length)) {
      error.type = FormError.types.REQUIRED;
    }

    if (error.type) {
      // fire onError callback
      if (this.props.onError) {
        this.props.onError(error);
      }
    } else {
      // fire onValid callback
      if (this.props.onValid) {
        this.props.onValid();
      }
    }

    // update state.error
    this.setState({
      error: !!error.type,
      dirty,
      showError: dirty || this.props.showError,
    });
  };

  /**
   * 选择关联信息
   */
  pickLink = () => {
    this.setState({
      dialogVisible: true,
    });
  };

  /**
   * 删除指定项目
   */
  itemOnDelete = (event, item, i) => {
    if (!item) {
      return;
    }

    const updateSource = () => {
      const list = _.cloneDeep(this.state.value);
      list.splice(i, 1);

      this.checkValue(list, true);
      this.setState({
        value: list,
      });

      if (this.props.onChange) {
        this.props.onChange(null, list, {
          prevValue: this.state.value,
        });
      }
    };

    if (this.props.moduleType === 'task') {
      Dialog.confirm({
        description: `${_l('您确定删除自由连接的%0“%1”吗？', LinkTypes[item.type], item.name)}`,
        onOk: updateSource,
      });
    } else {
      updateSource();
    }
  };

  onDialogCancel = () => {
    this.setState({
      dialogVisible: false,
    });
  };

  onDialogPick = (item) => {
    let list = _.cloneDeep(this.state.value);
    if (!list || !list.push) {
      list = [];
    }

    list.push(item);

    this.checkValue(list, true);

    this.setState({
      value: list,
      dialogVisible: false,
    });

    if (this.props.onChange) {
      this.props.onChange(null, list, {
        prevValue: this.state.value,
      });
    }
  };

  render() {
    let list = [];
    if (this.state.value && this.state.value.length) {
      list = (
        <List
          data={this.state.value}
          disabled={this.props.disabled}
          onDelete={(event, item, i) => {
            this.itemOnDelete(event, item, i);
          }}
        />
      );
    }

    let addButton = null;
    if (!this.props.disabled && this.props.max > 0 && this.state.value.length < this.props.max) {
      addButton = (
        <button
          className="mui-linkpicker-add ThemeHoverColor3"
          onClick={(event) => {
            this.pickLink();
          }}
        >
          <Icon icon="plus" />
          <span>{_l('自由连接...')}</span>
        </button>
      );
    }

    let dialog = null;
    if (this.state.dialogVisible) {
      dialog = (
        <DialogRelationControl
          title={''}
          types={this.props.type}
          onCancel={() => {
            this.onDialogCancel();
          }}
          onSubmit={(item) => {
            this.onDialogPick(item);
          }}
        />
      );
    }

    return (
      <div className="mui-linkpicker">
        {list}
        {addButton}
        {dialog}
      </div>
    );
  }
}

LinkPicker.propTypes = {
  /**
   * 当前选中的值
   */
  value: PropTypes.any,
  /**
   * 数据类型
   * 0 - 全部
   * 1 - 任务
   * 2 - 项目
   * 3 - 日程
   * 4 - 文件
   * 5 - 申请单
   */
  type: PropTypes.array,
  /**
   * 最大数量
   */
  max: PropTypes.number,
  /**
   * 是否必填
   */
  required: PropTypes.bool,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 选项改变回调
   * @param {Event} event - 点击事件
   * @param {any} value - 选中的值
   * @param {object} data - 其他数据
   * data.prevValue - 之前的值
   */
  /**
   * 显示错误（忽略 error.dirty）
   */
  showError: PropTypes.bool,
  onChange: PropTypes.func,
  /**
   * 【回调】发生错误
   * @param {Error} error - 错误
   * error.type - 错误类型
   * error.dirty - 值是否发生过改变
   */
  onError: PropTypes.func,
  /**
   * 【回调】值有效（与 onError 相反）
   */
  onValid: PropTypes.func,
  className: PropTypes.string,
};

LinkPicker.defaultProps = {
  value: null,
  type: [],
  max: 100,
  required: false,
  disabled: false,
  showError: false,
  onChange: (event, value, item) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
};

export default LinkPicker;
