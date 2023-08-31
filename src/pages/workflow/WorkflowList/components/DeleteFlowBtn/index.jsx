import React, { Component } from 'react';
import Confirm from 'ming-ui/components/Dialog/Confirm';
import process from '../../../api/process';

export default class DeleteFlowBtn extends Component {
  /**
   * 删除工作流
   */
  delFlow = () => {
    const { item, callback } = this.props;

    Confirm({
      title: _l('删除工作流“%0”', item.name),
      description: _l('工作流将被删除，请确认执行此操作'),
      okText:_l('删除'),
      buttonType: 'danger',
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
