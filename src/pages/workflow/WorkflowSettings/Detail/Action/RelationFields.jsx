import React, { Component, Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import { SelectNodeObject, FilterAndSort, FindResult } from '../components';
import flowNode from '../../../api/flowNode';
import _ from 'lodash';

export default class RelationFields extends Component {
  /**
   * 获取工作表的自定义字段
   */
  getWorksheetFields = appId => {
    const { data, updateSource } = this.props;

    flowNode
      .getStartEventDeploy({
        appId,
        appType: data.appType,
      })
      .then(result => {
        updateSource({ relationControls: result.controls });
      });
  };

  /**
   * fields dropdown title
   */
  renderRelationTitle(item) {
    return (
      <Fragment>
        <span>{(item || {}).controlName}</span>
        <span className="Gray_9e mRight5">{_l('（关联表“%0”）', (item || {}).sourceEntityName)}</span>
      </Fragment>
    );
  }

  /**
   * 关联他表字段
   */
  renderRelationContent() {
    const { data, updateSource } = this.props;
    const list = data.controls.map(item => {
      return {
        text: this.renderRelationTitle(item),
        value: item.controlId,
        searchText: item.controlName,
        disabled: !!_.find(data.fields, o => o.fieldId === item.controlId),
      };
    });

    return (
      <Dropdown
        className="flowDropdown mTop10"
        maxHeight={280}
        data={list}
        value={data.fields.length || undefined}
        openSearch
        renderTitle={() =>
          !!data.fields.length &&
          !!data.controls.length &&
          this.renderRelationTitle(_.find(data.controls, item => item.controlId === data.fields[0].fieldId))
        }
        border
        noData={_l('指定的节点对象中，没有关联他表字段')}
        onChange={controlId => {
          this.getWorksheetFields(data.controls.find(item => item.controlId === controlId).dataSource);
          updateSource({ fields: [{ fieldId: controlId }] });
        }}
      />
    );
  }

  render() {
    const { data, SelectNodeObjectChange, updateSource, isApproval } = this.props;

    return (
      <Fragment>
        <div className="Gray_75 workflowDetailDesc pTop15 pBottom15">
          {_l('基于一种获取方式，通过筛选条件和排序规则获得符合条件的唯一数据，供流程中的其他节点使用。')}
        </div>

        <div className="Font13 bold mTop20">{_l('选择获取对象')}</div>
        <div className="Font13 Gray_9e mTop10">{_l('当前流程中的节点对象')}</div>

        <SelectNodeObject
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={SelectNodeObjectChange}
        />

        <div className="Font13 bold mTop20">{_l('选择关联类型字段')}</div>
        <div className="Font13 Gray_9e mTop10">{_l('系统将输出此字段中所关联的第一条记录，供流程中其他节点使用')}</div>

        {data.selectNodeId && this.renderRelationContent()}

        {!!data.fields.length && (
          <Fragment>
            <FilterAndSort
              companyId={this.props.companyId}
              relationId={this.props.relationId}
              processId={this.props.processId}
              selectNodeId={this.props.selectNodeId}
              openNewFilter={!data.conditions.length}
              data={Object.assign({}, data, { controls: data.relationControls })}
              updateSource={updateSource}
              showRandom={true}
              filterText={_l(
                '设置筛选条件，查找满足条件的数据。如果未添加筛选条件则表示只通过排序规则从所有记录中获得唯一数据',
              )}
              sortText={_l(
                '当查找到多个数据时，将按照以下排序规则获得第一条数据。如果未设置规则，按照字段配置的排序规则返回第一条数据',
              )}
              filterEncryptCondition={true}
            />

            {!isApproval && (
              <FindResult
                executeType={data.executeType}
                switchExecuteType={executeType => updateSource({ executeType })}
              />
            )}

            {isApproval && <div className="mTop20 bold">{_l('未获取到数据时：继续执行')}</div>}
          </Fragment>
        )}
      </Fragment>
    );
  }
}
