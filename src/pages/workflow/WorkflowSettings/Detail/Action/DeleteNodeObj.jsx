import React, { Component, Fragment } from 'react';
import { SelectNodeObject } from '../components';
import { Dialog, Checkbox } from 'ming-ui';
import _ from 'lodash';

/**
 * 删除记录
 */
export default class DeleteNodeObj extends Component {
  onChange = selectNodeId => {
    const { data, SelectNodeObjectChange } = this.props;
    const selectNodeObj = _.find(data.flowNodeList, item => item.nodeId === selectNodeId);

    if (data.selectNodeObj.appId && data.selectNodeObj.appId !== selectNodeObj.appId) {
      Dialog.confirm({
        title: <span style={{ color: '#f44336' }}>{_l('注意！你将要更改节点对象的表和原来不一致')}</span>,
        description: _l(
          '更改新的节点对象的工作表后，所有使用原表格数据的节点配置都将重置，且无法恢复。请确认你要执行此操作',
        ),
        okText: _l('确认更改'),
        onOk: () => {
          SelectNodeObjectChange(selectNodeId);
        },
      });
    } else {
      SelectNodeObjectChange(selectNodeId);
    }
  };

  render() {
    const { data, updateSource } = this.props;

    return (
      <Fragment>
        <div className="Font13 bold">{_l('选择删除对象')}</div>
        <div className="Font13 Gray_9e mTop10">{_l('当前流程中的节点对象')}</div>
        <SelectNodeObject
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={this.onChange}
        />

        <div className="mTop20 flexRow">
          <Checkbox
            className="InlineFlex"
            text={_l('彻底删除记录，不放入回收站')}
            checked={data.destroy}
            onClick={checked => updateSource({ destroy: !checked })}
          />
        </div>
        <div className="Gray_9e mTop5" style={{ marginLeft: 26 }}>
          {_l('彻底删除后数据不可恢复，请谨慎操作')}
        </div>
      </Fragment>
    );
  }
}
