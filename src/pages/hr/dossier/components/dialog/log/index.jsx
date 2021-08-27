import PropTypes from 'prop-types';
import React, { Component } from 'react';

import './style.less';

import Dialog from 'ming-ui/components/Dialog';
import LoadDiv from 'ming-ui/components/LoadDiv';
import Icon from 'ming-ui/components/Icon';

import ApiEmployee from '../../../api/employee';

class DialogLog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /**
       * 是否在加载状态
       */
      loading: false,
      /**
       * 日志列表
       */
      list: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible === true) {
      this.setState({
        loading: true,
      });

      this.getLogs();
    }
  }

  onOk = () => {
    if (this.props.onOk) {
      this.props.onOk();
    }
  };

  onCancel = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  };

  /**
   * 获取日志信息
   */
  getLogs = () => {
    ApiEmployee.getEmployeeLogList({
      employeeId: this.props.employeeId,
    }).then((res) => {
      let list = [];
      if (res.status === 1) {
        list = res.data;
      } else {
        alert(_l('数据加载失败'), 2);
      }

      this.setState({
        list,
        loading: false,
      });
    });
  };

  render() {
    let content = <LoadDiv />;
    if (!this.state.loading) {
      if (!this.state.list || !this.state.list.length) {
        content = <div>暂无操作记录</div>;
      } else {
        content = (
          <table>
            <tbody>
              {this.state.list.map((item) => {
                const list = item.content.split(';').map((line, i) => {
                  return <div key={i}>{line}</div>;
                });
                return (
                  <tr key={item.id}>
                    <td>
                      <Icon icon="edit" />
                    </td>
                    <td width="150px">{item.fullName}</td>
                    <td>{list}</td>
                    <td className="TxtRight">{item.createDate.replace(/\s\d\d:\d\d:\d\d$/, '')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      }
    }
    return (
      <Dialog
        visible={this.props.visible}
        title={this.props.title}
        className="dossier-dialog-log-base"
        width="640"
        type="fixed"
        onOk={() => {
          this.onOk();
        }}
        onCancel={() => {
          this.onCancel();
        }}
      >
        <div className="dossier-dialog-log">{content}</div>
      </Dialog>
    );
  }
}

DialogLog.propTypes = {
  /**
   * 是否可见
   */
  visible: PropTypes.bool,
  /**
   * 标题
   */
  title: PropTypes.string,
  /**
   * 员工 ID
   */
  employeeId: PropTypes.string,
  /**
   * 【回调】确定
   */
  onOk: PropTypes.func,
  /**
   * 【回调】取消
   */
  onCancel: PropTypes.func,
};

DialogLog.defaultProps = {
  visible: false,
  title: '',
  employeeId: '',
  onOk: () => {
    //
  },
  onCancel: () => {
    //
  },
};

export default DialogLog;
