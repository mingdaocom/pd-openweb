import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import './taskControl.less';
import { connect } from 'react-redux';
import config from '../../../config/config';
import FormAdapter from 'src/pages/hr/dossier/components/lib/data-adapter/form';
import FormControl from 'src/pages/hr/dossier/components/lib/data-adapter/form-control';
import FormContainer from 'src/pages/hr/dossier/components/form-container';
import { taskFoldStatus, updateControlValue, updateTaskControlFiles } from '../../../redux/actions';

class TaskControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      controlData: [],
      hasError: false,
    };
  }

  componentDidMount() {
    this.formatData(this.props.taskControls[this.props.taskId] || []);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.taskControls[nextProps.taskId], this.props.taskControls[this.props.taskId])) {
      this.formatData(nextProps.taskControls[nextProps.taskId] || []);
    }
  }

  /**
   * 格式化数据
   */
  formatData(data) {
    const { controlData } = this.state;
    const { taskId } = this.props;
    const hasAuth = this.props.taskDetails[taskId].data.auth === config.auth.Charger || this.props.taskDetails[taskId].data.auth === config.auth.Member;

    data = _.cloneDeep(data);
    data.forEach((item) => {
      // 下拉
      if (item.type === 11) {
        // 下拉框允许清空
        if (item.value !== '0') {
          item.options.unshift({
            index: 0,
            isDeleted: false,
            key: '0',
            value: _l('清除选择'),
          });
        }
      }

      // 附件
      if (item.type === 14) {
        item.value = {
          attachmentData: JSON.parse(item.value),
        };

        controlData.forEach((control) => {
          if (control.id === item.controlId && _.isEqual(item.value.attachmentData, control.value.attachmentData)) {
            item.value.attachments = control.value.attachments || [];
            item.value.knowledgeAtts = control.value.knowledgeAtts || [];
          }
        });
      }

      // 关联控件
      if (item.type === 21) {
        item.value = JSON.parse(item.value);
        item.value.forEach((obj, i) => {
          obj.suffix = i;
        });
      }

      item.disabled = !hasAuth;
    });

    this.setState({ controlData: FormAdapter.convert(FormControl.flatten(data, [])) });
  }

  /**
   * 值更新
   */
  onChange = (event, id, values, data) => {
    const controls = this.props.taskControls[this.props.taskId];
    const type = _.find(controls, item => item.controlId === id).type;

    switch (type) {
      case 9:
        this.updateRadioValue(id, values[id]);
        break;
      case 11:
      case 28:
        this.updateControlValue(id, values[id]);
        break;
      case 10:
        this.updateCheckboxValue(id, values);
        break;
      case 15:
      case 16:
        this.updateControlValue(id, values[id] ? moment(values[id]).format('YYYY-MM-DD HH:mm:ss') : '');
        break;
      case 21:
        this.updateRelationValue(id, values[id]);
        break;
      case 2:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 14:
      case 19:
      case 23:
      case 24:
        this.updateControlData(id, data);
        break;
    }
  };

  /**
   * 更新state控件的值
   */
  updateControlData(id, data) {
    const { controlData } = this.state;
    const { taskId } = this.props;
    const controls = this.props.taskControls[taskId];
    const { type, value } = _.find(controls, item => item.controlId === id);

    controlData.forEach((item) => {
      if (item.id === id) {
        item.value = data[id].value;
        item.config = Object.assign({}, item.config, { label: data[id].configLabel });
        item.valueText = data[id].valueText;

        // 删除附件更新数据
        if (type === 14 && !_.isEqual(JSON.parse(value, data[id].value.attachmentData))) {
          this.props.dispatch(updateTaskControlFiles(taskId, id, data[id].value.attachmentData));
        }
      }
    });
  }

  /**
   * 类似文本框 附件这一类的值更新保存
   */
  onSave = (id, data) => {
    const controls = this.props.taskControls[this.props.taskId];
    const { type, value } = _.find(controls, item => item.controlId === id);

    switch (type) {
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        data !== value && this.updateControlValue(id, data);
        break;
      case 14:
        this.updateControlValue(id, JSON.stringify(data.attachments), JSON.stringify(data.knowledgeAtts), true);
        break;
      case 19:
      case 23:
      case 24:
        this.updateAreaValue(id, data);
        break;
    }
  };

  /**
   * 更新地区的值
   */
  updateAreaValue(id, value) {
    if (typeof value === 'string') {
      return;
    }

    const lastAreaId = value[value.length - 1].id;
    const text = value.map(item => item.name).join(' / ');

    this.updateControlValue(id, lastAreaId, text);
  }

  /**
   * 更新单选控件的值
   */
  updateRadioValue(id, value) {
    const controls = this.props.taskControls[this.props.taskId];
    const control = _.find(controls, item => item.controlId === id);

    this.updateControlValue(id, control.value === value ? '' : value);
  }

  /**
   * 更新多选控件的值
   */
  updateCheckboxValue(id, values) {
    let value = '';
    let arrs = [];

    Object.keys(values[id]).forEach((key) => {
      if (values[id][key]) {
        if (!value) {
          value = key;
        } else if (value.length > key.length) {
          arrs = value.split('');
          arrs.splice(value.length - key.length, 1, '1');
          value = arrs.join('');
        } else {
          value = key.substr(0, key.length - value.length) + value;
        }
      }
    });

    this.updateControlValue(id, value);
  }

  /**
   * 更新关联控件的值
   */
  updateRelationValue(id, values) {
    const controls = this.props.taskControls[this.props.taskId];
    const relations = JSON.parse(_.find(controls, item => item.controlId === id).value);
    const diffItem = {};
    let singleItem;
    let index;

    // 新增
    if (values.length > relations.length) {
      singleItem = values[values.length - 1];
      diffItem.isd = false;
    } else {
      relations.forEach((a, i) => {
        if (!_.find(values, item => item.suffix === i)) {
          singleItem = a;
          index = i;
        }
      });
      diffItem.isd = true;
    }

    diffItem.type = singleItem.type;
    diffItem.sid = singleItem.sid;
    diffItem.sidext = singleItem.sidext;

    this.updateControlValue(id, JSON.stringify(diffItem), index);
  }

  /**
   * 更新控件的值
   */
  updateControlValue(id, value, opts = '', isAttachment = false) {
    this.props.dispatch(updateControlValue(this.props.taskId, id, value, opts, isAttachment));
  }

  /**
   * 值错误
   */
  onDataChange(errorData) {
    this.setState({
      hasError: !!Object.values(errorData).filter(item => !!item).length,
    });
  }

  /**
   * 更改任务详情的收起展开
   */
  updateTaskFoldStatus = () => {
    this.props.dispatch(taskFoldStatus(this.props.taskId, 'control'));
  };

  render() {
    const { controlData, hasError } = this.state;
    const isHidden = _.includes((this.props.taskFoldStatus[this.props.taskId] || []), 'control');

    if (!controlData.length) {
      return null;
    }

    return (
      <div className="taskContentBox mTop10">
        <div className={cx('flexRow taskControlHeader', { taskControlHeaderShow: !isHidden })}>
          <i className="icon-task-extension" />
          {_l('自定义内容')}
          <div className="flex" />
          <span className="taskDetailFold" data-tip={isHidden ? _l('展开') : _l('收起')}>
            <i className={cx('pointer ThemeColor3', isHidden ? 'icon-arrow-down-border' : 'icon-arrow-up-border')} onClick={this.updateTaskFoldStatus} />
          </span>
        </div>
        {!isHidden ? (
          <FormContainer
            data={controlData}
            moduleType="task"
            showError={hasError}
            onChange={this.onChange}
            onValid={(id, errorData) => this.onDataChange(errorData)}
            onError={(error, id, errorData) => this.onDataChange(errorData)}
            onSave={this.onSave}
          />
        ) : null}
      </div>
    );
  }
}

export default connect(state => state.task)(TaskControl);
