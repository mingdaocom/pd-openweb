import PropTypes from 'prop-types';
import React, { Component } from 'react';
import _ from 'lodash';

import SubGroup from './sub-group';
import UID from '../lib/uid';

import './style.less';

class FormGroup extends Component {
  constructor(props) {
    super(props);

    this.defaultValues = {};

    this.errorData = {};

    this.state = {
      /**
       * current value
       */
      value: this.generateValues(props),
      /**
       * group label
       */
      label: this.props.label || null,
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

  componentWillReceiveProps(nextProps) {
    // showError changed
    if (nextProps.showError !== this.props.showError) {
      this.setState({
        showError: this.state.dirty || nextProps.showError,
      });
    }
  }

  generateValues = (props) => {
    const list = [];

    const defaultValues = {};

    props.data.map((item) => {
      defaultValues[item.id] = item.value;

      return null;
    });

    if (props.value && props.value.length) {
      props.value.map((values) => {
        list.push({
          id: UID.generate(),
          values,
        });

        return null;
      });
    } else {
      list.push({
        id: UID.generate(),
        values: defaultValues,
      });
    }

    this.defaultValues = defaultValues;

    return list;
  };

  groupOnChange = (event, groupId, values, data) => {
    const newValues = this.state.value.map((item) => {
      if (item.id === groupId) {
        for (const id in values) {
          if (id) {
            item.values[id] = values[id];
          }
        }
      }

      return item;
    });

    this.postOnChange(event, newValues);

    this.setState({
      value: newValues,
    });
  };

  groupOnError = (errorData, groupId) => {
    this.errorData[groupId] = errorData;

    if (this.props.onError) {
      this.props.onError({
        type: 'group',
        message: '',
      });
    }
  };

  groupOnValid = (groupId) => {
    this.errorData[groupId] = null;

    if (this.props.onValid) {
      let error = false;
      for (const id in this.errorData) {
        if (id && this.errorData[id]) {
          error = true;
        }
      }

      if (!error) {
        this.props.onValid();
      }
    }
  };

  groupOnDelete = (event, groupId) => {
    const list = this.state.value;

    let index = -1;
    list.map((item, i) => {
      if (item.id === groupId) {
        index = i;
      }

      return null;
    });

    if (index >= 0) {
      list.splice(index, 1);
    }

    this.postOnChange(event, list);

    this.setState({
      value: list,
    });
  };

  addGroup = (event) => {
    const list = this.state.value;
    list.push({
      id: UID.generate(),
      values: _.cloneDeep(this.defaultValues),
    });

    this.postOnChange(event, list);

    this.setState({
      value: list,
    });
  };

  postOnChange = (event, values) => {
    if (this.props.onChange) {
      const list = values.map((item) => {
        return item.values;
      });

      this.props.onChange(event, list);
    }
  };

  generateStatistics = () => {
    const list = {};
    const data = [];
    this.props.data.map((item) => {
      if (item.config && item.config.sum) {
        list[item.id] = {
          value: 0,
        };

        data.push({
          id: item.id,
          label: item.label,
          value: 0,
        });
      }

      return null;
    });

    this.state.value.map((item) => {
      for (const id in item.values) {
        if (item.values[id] !== undefined && list[id]) {
          const value = parseFloat(item.values[id]) ? parseFloat(item.values[id]) : 0;
          list[id].value = list[id].value + value;
        }
      }

      return null;
    });

    data.map((item) => {
      item.value = list[item.id].value;

      return null;
    });

    const trs = data.map((item, i) => {
      return (
        <tr key={i}>
          <td>{`${item.label}${_l('统计')}`}</td>
          <td>{item.value}</td>
        </tr>
      );
    });

    return (
      <div className="mui-formgroup-statistics">
        <table>
          <thead>
            <tr>
              <th colSpan="2">{_l('统计')}</th>
            </tr>
          </thead>
          <tbody>{trs}</tbody>
        </table>
      </div>
    );
  };

  render() {
    const list = this.state.value.map((data, i) => {
      const controls = this.props.data.map((item, j) => {
        const _item = _.cloneDeep(item);
        _item.value = data.values[_item.id];

        return _item;
      });

      return (
        <SubGroup
          key={data.id}
          label={`${this.props.label}-${i + 1}`}
          data={controls}
          allowDelete={i !== 0}
          disabled={this.props.disabled}
          showError={this.props.showError}
          onChange={(event, values, _data) => {
            this.groupOnChange(event, data.id, values, _data);
          }}
          onError={(errorData) => {
            this.groupOnError(errorData, data.id);
          }}
          onValid={() => {
            this.groupOnValid(data.id);
          }}
          onDelete={(event) => {
            this.groupOnDelete(event, data.id);
          }}
        />
      );
    });

    let addButton = null;
    if (!this.props.disabled) {
      addButton = (
        <div className="mui-formgroup-add">
          <div
            className="ThemeHoverColor3"
            onClick={(event) => {
              this.addGroup(event);
            }}
          >
            {_l('添加一条明细')}
          </div>
        </div>
      );
    }

    const statistics = this.generateStatistics();

    return (
      <div className="mui-formgroup">
        <h3>{this.props.label}</h3>
        {list}
        {addButton}
        {statistics}
      </div>
    );
  }
}

FormGroup.propTypes = {
  /**
   * 明细标题
   */
  label: PropTypes.string,
  /**
   * 表单数据
   */
  data: PropTypes.any,
  /**
   * 表单控件值
   */
  value: PropTypes.any,
  /**
   * 是否必填
   */
  required: PropTypes.bool,
  /**
   * 是否禁用
   */
  disabled: PropTypes.bool,
  /**
   * 显示错误（忽略 error.dirty）
   */
  showError: PropTypes.bool,
  /**
   * 选项改变回调
   * @param {Event} event - 触发事件
   * @param {any} values - 当前值
   */
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
};

FormGroup.defaultProps = {
  label: '',
  data: [],
  value: null,
  required: false,
  disabled: false,
  showError: false,
  onChange: (event, values) => {
    //
  },
  onError: (error) => {
    //
  },
  onValid: () => {
    //
  },
};

export default FormGroup;
