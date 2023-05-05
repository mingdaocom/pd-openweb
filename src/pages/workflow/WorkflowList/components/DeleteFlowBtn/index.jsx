import React, { Component } from 'react';
import { DeleteReconfirm } from 'ming-ui';
import process from '../../../api/process';

export default class DeleteFlowBtn extends Component {
  /**
   * 删除工作流
   */
  delFlow = () => {
    const { item, callback } = this.props;

    DeleteReconfirm({
      title: _l('删除工作流“%0”', item.name),
      description: _l('工作流将被彻底删除，且无法恢复。请确认您要执行此操作'),
      data: [{ text: _l('我确定执行此操作'), value: true }],
      onOk: () => {
        process.deleteProcess({ processId: item.id }).then(res => {
          if (res) {
            callback(item.id);
          }
        });
      },
    });
  };

  render() {
    return (
      <div onClick={this.delFlow} style={{ color: '#f44336' }}>
        <span className="icon-delete2 Font16 pLeft12 mRight10" />
        {_l('删除')}
      </div>
    );
  }
}
