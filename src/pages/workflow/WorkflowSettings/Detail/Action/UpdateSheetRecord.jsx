import React, { Component, Fragment } from 'react';
import { APP_TYPE } from '../../enum';
import { SelectNodeObject, UpdateFields } from '../components';

export default class UpdateSheetRecord extends Component {
  render() {
    const { data, SelectNodeObjectChange, isApproval } = this.props;

    return (
      <Fragment>
        <div className="Font13 bold">{data.appType === APP_TYPE.PROCESS ? _l('更新参数') : _l('选择更新对象')}</div>

        {data.appType !== APP_TYPE.PROCESS && (
          <Fragment>
            <div className="Font13 Gray_9e mTop10">
              {_l('当前流程中的节点对象')}
              {data.appType === APP_TYPE.EXTERNAL_USER && _l('（获取人员数据节点）')}
            </div>

            <SelectNodeObject
              disabled={isApproval}
              appList={data.flowNodeList}
              selectNodeId={data.selectNodeId}
              selectNodeObj={data.selectNodeObj}
              onChange={selectNodeId => SelectNodeObjectChange(selectNodeId, true)}
            />

            <div className="Font13 bold mTop20">{_l('更新字段')}</div>
          </Fragment>
        )}

        {(data.selectNodeId || data.appType === APP_TYPE.PROCESS) && (
          <UpdateFields
            type={data.appType === APP_TYPE.PROCESS ? 2 : 1}
            companyId={this.props.companyId}
            relationId={this.props.relationId}
            processId={this.props.processId}
            selectNodeId={this.props.selectNodeId}
            nodeId={data.selectNodeId}
            controls={data.controls}
            fields={data.fields}
            formulaMap={data.formulaMap}
            updateSource={this.props.updateSource}
          />
        )}
      </Fragment>
    );
  }
}
