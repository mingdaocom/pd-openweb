import PropTypes from 'prop-types';
import React, { Component } from 'react';
import cx from 'classnames';

import './style.less';

import Dialog from 'ming-ui/components/Dialog';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ScrollView from 'ming-ui/components/ScrollView';
import Radio from 'ming-ui/components/Radio';
import jobLevelApi from '../../api/jobLevelManage';
import jobApi from '../../api/jobManage';
import companyApi from '../../api/companyManage';
import dossierApi from '../../api/dossierManage';

import Icon from 'ming-ui/components/Icon';
import { FormError } from '../lib';

class CompanyPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * current value
       */
      value: this.props.value || null,
      /**
       * button label
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
      /**
       * dialog data
       */
      data: null,
      /**
       * 添加
       */
      addStatus: false,
      addName: '',
      selectedItem: this.props.value,
      visible: false,
      loading: false,
      loadingMore: false,
      haveMore: true,
    };

    // current page
    this.pageIndex = 1;
    // page size
    this.pageSize = 20;

    switch (this.props.type) {
      case 'jobGrade':
        this.request = () => {
          return jobLevelApi.getJobLevelList({
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
          });
        };
        break;
      case 'company':
        this.request = () => {
          return companyApi.getCompanyList({
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
          });
        };
        break;
      case 'workSpace':
        this.request = () => {
          return dossierApi.getWorkSiteList({
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
          });
        };
        break;
      default:
        this.request = () => {
          return jobApi.getJobList({
            pageIndex: this.pageIndex,
            pageSize: this.pageSize,
          });
        };
    }
  }

  componentDidMount() {
    // check init value
    this.checkValue(this.state.value, false);
  }

  componentWillReceiveProps(nextProps) {
    // apply label update
    if (nextProps.label !== this.props.label) {
      const label = nextProps.label && nextProps.label.length ? nextProps.label.toString() : '';

      this.setState({
        label,
      });
    }
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

  add() {
    let promise = null;
    switch (this.props.type) {
      case 'jobGrade':
        promise = jobLevelApi.addJobLevel({
          name: this.state.addName,
        });
        break;
      case 'company':
        promise = companyApi.addCompany({
          name: this.state.addName,
        });
        break;
      case 'job':
        promise = jobApi.addJob({
          name: this.state.addName,
        });
        break;
    }
    this.pageIndex = 1;
    if (promise) {
      promise.then(() => {
        this.setState({
          loading: true,
          addName: '',
        });
        this.request().then((data) => {
          this.setState({
            loading: false,
            data: data.data,
          });
        });
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
    if (this.props.required && !value) {
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
   * 打开数据选择 Dialog
   */
  openDialog = () => {
    if (this.props.disabled) {
      return;
    }

    // open pick modal
    this.setState({
      visible: true,
      loading: true,
      loadingMore: false,
      haveMore: true,
      addStatus: false,
    });
    this.pageIndex = 1;
    this.request().then((data) => {
      this.setState({
        data: data.data,
        loading: false,
      });
    });
  };

  loadMore = () => {
    if (this.state.loadingMore || !this.state.haveMore) {
      return false;
    }
    this.setState({
      loadingMore: true,
    });
    this.pageIndex++;
    this.request().then((data) => {
      if (data.data.length) {
        this.setState({
          data: this.state.data.concat(data.data),
          loadingMore: false,
        });
      } else {
        this.setState({
          haveMore: false,
          loadingMore: false,
        });
      }
    });
  };

  submit = () => {
    this.checkValue(this.state.selectedItem, true);

    this.setState({
      visible: false,
      value: this.state.selectedItem,
    });

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(null, this.state.selectedItem, {
        prevValue: this.state.value,
      });
    }
  };

  handleChoose = (item) => {
    this.setState({
      selectedItem: {
        id: item.id,
        name: item.name,
      },
    });
  };

  renderDialog = () => {
    const { data, loading, loadingMore, visible, selectedItem } = this.state;
    let name = '';
    let addView = null;
    switch (this.props.type) {
      case 'job':
        name = _l('职位');
        break;
      case 'jobGrade':
        name = _l('职级');
        break;
      case 'company':
        name = _l('组织');
        break;
      case 'workSpace':
        name = _l('工作地点');
        break;
    }
    if (this.props.type === 'jobGrade' || this.props.type === 'company' || this.props.type === 'job') {
      if (this.state.addStatus) {
        addView = (
          <div className="flexRow companyAddBox Relative">
            {!!this.state.addName.length && (
              <div className="companyAddBtn">
                <span
                  className="mRight10 Gray_9e"
                  onClick={() => {
                    this.setState({
                      addStatus: false,
                    });
                  }}
                >
                  {_l('取消')}
                </span>
                <span
                  className="ThemeColor3"
                  onClick={() => {
                    this.add();
                  }}
                >
                  {_l('添加')}
                </span>
              </div>
            )}
            <input
              type="text"
              className="companyAddInput"
              autoFocus
              placeholder={_l('输入') + name}
              value={this.state.addName}
              onChange={(e) => {
                this.setState({
                  addName: e.target.value,
                });
              }}
            />
          </div>
        );
      } else {
        addView = (
          <div
            className="flexRow companyAddBox pointer"
            onClick={() => {
              this.setState({ addStatus: true });
            }}
          >
            <Icon icon="plus" className="plusIcon flexMiddle" />
            <span className="Gray_9e Font13 flexMiddle">{_l('添加') + name}</span>
          </div>
        );
      }
    }
    const getItem = job => (
      <Radio
        key={job.id}
        text={job.name}
        className="radioList Font13 overflow_ellipsis"
        checked={!!selectedItem && selectedItem.id === job.id}
        onClick={() => this.handleChoose(job)}
      />
    );
    return (
      <Dialog
        visible={visible}
        title={_l('选择') + name}
        onOk={this.submit}
        className="dossierSelectDialog"
        onCancel={() => this.setState({ visible: false })}
        onScroll={(e) => {
          if (e.target.scrollHeight - e.target.scrollTop - e.target.offsetHeight <= 5) {
            this.loadMore();
          }
        }}
      >
        {loading || !data ? (
          <LoadDiv className="mTop20" />
        ) : (
          <div className="dossierDialogScroll">
            <div className="flexColumn">
              {addView}
              {!this.state.data.length && this.props.type === 'workSpace' ? (
                <div>
                  <div>{_l('暂未创建工作地点，拥有权限的管理角色可在后台创建')}</div>
                </div>
              ) : (
                this.state.data.filter(item => item.id !== this.props.filterId).map(item => getItem(item))
              )}
            </div>
            {this.state.loadingMore && <LoadDiv className="mTop20 mBottom20" />}
          </div>
        )}
      </Dialog>
    );
  };

  render() {
    const buttonClassList = ['mui-forminput', 'ThemeFocusBorderColor3'];
    if (this.state.error && this.state.showError) {
      buttonClassList.push('mui-forminput-error');
    }
    const buttonClassNames = buttonClassList.join(' ');

    const dialog = this.renderDialog();

    if (this.props.accessor) {
      return (
        <div className={this.props.className} onClick={this.openDialog}>
          {this.props.accessor(this.state.label)}
          {dialog}
        </div>
      );
    }

    return (
      <div className={cx('mui-companypicker', this.props.className)}>
        <button type="button" className={buttonClassNames} disabled={this.props.disabled} onClick={this.openDialog}>
          {this.props.label ? (
            <span className="mui-forminput-label">{this.state.label}</span>
          ) : (
            <span className="mui-forminput-label placeholder">{this.props.placeholder}</span>
          )}
          <Icon icon="arrow-down-border" />
        </button>
        {dialog}
      </div>
    );
  }
}

CompanyPicker.propTypes = {
  /**
   * 数据类型
   */
  type: PropTypes.oneOf([
    /**
     * 职位【默认】
     */
    'job',
    /**
     * 职级
     */
    'jobGrade',
    /**
     * 合同公司
     */
    'company',
    /**
     * 工作地点
     */
    'workSpace',
  ]),
  /**
   * 当前选中的值
   */
  value: PropTypes.any,
  /**
   * Button 显示内容
   */
  label: PropTypes.string,
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
  /**
   * 过滤的id
   */
  filterId: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  accessor: PropTypes.any,
};

CompanyPicker.defaultProps = {
  type: 'job',
  value: null,
  label: '',
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

export default CompanyPicker;
