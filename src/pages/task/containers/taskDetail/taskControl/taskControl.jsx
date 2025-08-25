import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import CustomFields from 'src/components/newCustomFields';
import { deleteAttachment } from 'src/pages/kc/common/AttachmentsPreview/ajax';
import config from '../../../config/config';
import { taskFoldStatus, updateControlValue, updateTaskControlFiles } from '../../../redux/actions';
import './taskControl.less';

class TaskControl extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flag: +new Date(),
      controlData: [],
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
    const { taskId } = this.props;
    const hasAuth =
      this.props.taskDetails[taskId].data.auth === config.auth.Charger ||
      this.props.taskDetails[taskId].data.auth === config.auth.Member;

    data = _.cloneDeep(data);
    data.forEach(item => {
      // 单选
      if (_.includes([9, 11], item.type)) {
        item.value = JSON.stringify([item.value]);
      }

      // 多选
      if (item.type === 10) {
        const key = [];
        for (let i = 0; i < item.value.length; i++) {
          if (item.value.substr(i, 1) !== '0') {
            key.push('1' + item.value.slice(i + 1).replace(/1/g, 0));
          }
        }

        item.value = JSON.stringify(key);
      }

      // 附件
      if (item.type === 14) {
        item.value = {
          attachmentData: JSON.parse(item.value),
          attachments: [],
          knowledgeAtts: [],
        };

        item.value = JSON.stringify(item.value);
      }

      // 地区
      if (_.includes([19, 23, 24], item.type)) {
        item.value = JSON.stringify({ code: '', name: item.value });
      }

      // 关联控件
      if (item.type === 21) {
        item.value = JSON.parse(item.value);
        item.value.forEach((obj, i) => {
          obj.suffix = i;
        });

        item.value = JSON.stringify(item.value);
      }

      item.advancedSetting = {};
      item.disabled = !hasAuth;
    });

    this.setState({ flag: +new Date(), controlData: data });
  }

  /**
   * 更新字段数据
   */
  updateFieldsData = ({ controlId, isBlur }) => {
    const errorItems = this.fields.state.errorItems;
    const { data } = this.fields.getSubmitData({ silent: true });
    const currentData = data.find(item => item.controlId === controlId);
    const controls = this.props.taskControls[this.props.taskId];
    const oldCurrentData = _.find(controls, item => item.controlId === controlId);

    if (!controlId) return;

    if (isBlur) {
      if (!errorItems.find(item => item.controlId === controlId) && currentData.value !== oldCurrentData.value) {
        this.updateControlValue(controlId, currentData.value);
      }
    } else {
      if (_.includes([9, 11], currentData.type)) {
        const value = JSON.parse(currentData.value)[0] || '';

        this.updateControlValue(controlId, currentData.type === 9 && value === oldCurrentData.value ? '' : value);
      }

      if (currentData.type === 10) {
        let newValue = '';
        let list = [];

        JSON.parse(currentData.value).forEach(key => {
          if (!newValue) {
            newValue = key;
          } else if (newValue.length > key.length) {
            list = newValue.split('');
            list.splice(newValue.length - key.length, 1, '1');
            newValue = list.join('');
          } else {
            newValue = key.substr(0, key.length - newValue.length) + newValue;
          }
        });

        this.updateControlValue(controlId, newValue);
      }

      if (currentData.type === 14) {
        const { attachments = [], knowledgeAtts = [], attachmentData = [] } = JSON.parse(currentData.value || '{}');
        const oldValue = JSON.parse(oldCurrentData.value);

        if (attachmentData.length !== oldValue.length) {
          let deleteFile;
          oldValue.forEach(o => {
            if (!attachmentData.length || attachmentData.find(att => att.fileID !== o.fileID)) {
              deleteFile = o;
            }
          });

          this.deleteFile(controlId, deleteFile, attachmentData);
        } else if (attachments.length + knowledgeAtts.length) {
          this.updateControlValue(controlId, JSON.stringify(attachments), JSON.stringify(knowledgeAtts), true);
        }
      }

      if (_.includes([15, 16, 28], currentData.type)) {
        this.updateControlValue(controlId, currentData.value);
      }

      if (_.includes([19, 23, 24], currentData.type)) {
        const { code, name } = JSON.parse(currentData.value);

        if (name !== oldCurrentData.value) {
          this.updateControlValue(controlId, code, name);
        }
      }

      if (currentData.type === 21) {
        this.updateRelationValue(controlId, JSON.parse(currentData.value));
      }
    }
  };

  /**
   * 删除附件
   */
  deleteFile(controlId, delFile, newFiles) {
    const { taskId } = this.props;

    deleteAttachment(
      delFile.docVersionID,
      delFile.fileID,
      delFile.sourceID,
      '',
      3,
      undefined,
      delFile.originalFilename + delFile.ext,
    )
      .then(() => {
        alert(_l('删除成功'));
        this.props.dispatch(updateTaskControlFiles(taskId, controlId, newFiles));
      })
      .catch(() => {
        alert(_l('删除文件失败'), 3);
      });
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
   * 更改任务详情的收起展开
   */
  updateTaskFoldStatus = () => {
    this.props.dispatch(taskFoldStatus(this.props.taskId, 'control'));
  };

  render() {
    const { flag, controlData } = this.state;
    const isHidden = _.includes(this.props.taskFoldStatus[this.props.taskId] || [], 'control');

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
            <i
              className={cx('pointer ThemeColor3', isHidden ? 'icon-arrow-down-border' : 'icon-arrow-up-border')}
              onClick={this.updateTaskFoldStatus}
            />
          </span>
        </div>
        {!isHidden && (
          <div className="pLeft12 pRight12 taskCustomFields">
            <CustomFields
              flag={flag}
              ref={fields => (this.fields = fields)}
              sheetSwitchPermit={[{ type: 14, state: true }]}
              isWorksheetQuery={false}
              disableRules={true}
              data={controlData}
              widgetStyle={{ align_pc: '1', titlelayout_pc: '2', titlewidth_pc: '84' }}
              onChange={(values, ids, { controlId }) => this.updateFieldsData({ controlId })}
              onBlur={controlId => this.updateFieldsData({ isBlur: true, controlId })}
            />
          </div>
        )}
      </div>
    );
  }
}

export default connect(state => state.task)(TaskControl);
