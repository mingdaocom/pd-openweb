import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Switch } from 'ming-ui';
import PublishErrorDialog from '../../../components/PublishErrorDialog';
import process from '../../../api/process';
import { navigateTo } from 'router/navigateTo';
import _ from 'lodash';
import moment from 'moment';

const publishStatus2Text = {
  0: _l('创建'),
  1: _l('更新未发布'),
  2: _l('发布'),
  3: _l('关闭%03055'),
};

export default class PublishBtn extends Component {
  state = {
    publishing: false,
    publishData: {},
    dialogVisible: false,
  };

  /**
   * format 日期
   */
  formatDate(date) {
    // 今天
    if (moment(date).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
      return `${_l('今天')} ${moment(date).format('HH:mm')}`;
    }

    // 昨天
    if (new Date(moment().format('YYYY-MM-DD')) - new Date(moment(date).format('YYYY-MM-DD')) === 24 * 60 * 60 * 1000) {
      return `${_l('昨天')} ${moment(date).format('HH:mm')}`;
    }

    // 今年
    if (moment(date).format('YYYY') === moment().format('YYYY')) {
      return moment(date).format('MMMDo HH:mm');
    }

    return moment(date).format('YYYY-MM-DD HH:mm');
  }

  /**
   * 编辑工作流
   */
  editFlow = () => {
    navigateTo(`/workflowedit/${this.props.item.id}`);
  };

  /**
   * 切换流程的启用状态
   */
  switchEnabled = () => {
    const { item } = this.props;
    if (item.isLock) {
      return alert(_l('应用锁定，权限不足', 3));
    }
    const list = _.cloneDeep(this.props.list);

    if (this.state.publishing) {
      return;
    }
    if (item.isLock) {
      return alert(_l('应用锁定，权限不足', 3));
    }

    this.setState({ publishing: true });

    process.publish({ isPublish: !item.enabled, processId: item.id }).then(publishData => {
      const { isPublish } = publishData;
      if (isPublish) {
        list.map(list => {
          if (list.processList && _.isArray(list.processList)) {
            list.processList = list.processList.map(obj => {
              if (obj.id === item.id) {
                obj.enabled = !item.enabled;
                obj.publishStatus = !item.enabled ? 2 : item.publishStatus;
                obj.lastModifiedDate = !item.enabled ? moment().format('YYYY-MM-DD HH:mm:ss') : item.lastModifiedDate;
              }

              return obj;
            });
          } else if (list.id === item.id) {
            list.enabled = !item.enabled;
            list.publishStatus = !item.enabled ? 2 : item.publishStatus;
            list.lastModifiedDate = !item.enabled ? moment().format('YYYY-MM-DD HH:mm:ss') : item.lastModifiedDate;
          }

          return list;
        });
        this.props.updateSource(list);
      } else {
        this.setState({
          publishData,
          dialogVisible: true,
        });
      }

      this.setState({ publishing: false });
    });
  };

  render() {
    const { disabled = false, item, showTime, showCreateTime } = this.props;
    const { publishData, dialogVisible } = this.state;

    return (
      <div className="flexRow">
        <Switch
          disabled={disabled}
          checked={item.enabled}
          text={item.enabled ? _l('开启') : _l('关闭%03055')}
          onClick={this.switchEnabled}
        />
        {!!showTime && (
          <Fragment>
            {showCreateTime ? (
              <span className="mLeft10 Font12 Gray_75">{this.formatDate(item.createdDate)}</span>
            ) : (
              <span
                className={cx('mLeft10 Font12', item.publishStatus === 1 ? 'ThemeColor3' : 'Gray_75')}
              >{`${this.formatDate(item.lastModifiedDate)} ${publishStatus2Text[item.publishStatus]}`}</span>
            )}
          </Fragment>
        )}
        {dialogVisible && (
          <PublishErrorDialog
            visible
            onCancel={() => this.setState({ dialogVisible: false })}
            onOk={this.editFlow}
            info={publishData}
          />
        )}
      </div>
    );
  }
}
