import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Select } from 'ming-ui/antd-components';
import flowNode from '../../../api/flowNode';
import { FilterAndSort, FindResult, SelectNodeObject } from '../components';

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
        <span className="textSecondary mRight5">{_l('（关联表“%0”）', (item || {}).sourceEntityName)}</span>
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
        label: this.renderRelationTitle(item),
        value: item.controlId,
        searchText: item.controlName,
      };
    });

    return (
      <Select
        className="flowDropdown mTop10"
        listHeight={280}
        options={list}
        value={data.fields[0]?.fieldId || undefined}
        showSearch
        optionFilterProp="searchText"
        labelRender={() =>
          !!data.fields.length &&
          !!data.controls.length &&
          this.renderRelationTitle(_.find(data.controls, item => item.controlId === data.fields[0].fieldId))
        }
        notFoundContent={_l('指定的节点对象中，没有关联他表字段')}
        onChange={controlId => {
          this.getWorksheetFields(data.controls.find(item => item.controlId === controlId).dataSource);
          updateSource({ fields: [{ fieldId: controlId }] });
        }}
      />
    );
  }

  render() {
    const { data, SelectNodeObjectChange, updateSource } = this.props;

    return (
      <Fragment>
        <div className="textSecondary workflowDetailDesc pTop15 pBottom15">
          {_l('基于一种获取方式，通过筛选条件和排序规则获得符合条件的唯一数据，供流程中的其他节点使用。')}
        </div>

        <div className="Font13 bold mTop20">{_l('选择获取对象')}</div>
        <div className="Font13 textSecondary mTop10">{_l('当前流程中的节点对象')}</div>

        <SelectNodeObject
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={SelectNodeObjectChange}
        />

        <div className="Font13 bold mTop20">{_l('选择关联类型字段')}</div>
        <div className="Font13 textSecondary mTop10">
          {_l('系统将输出此字段中所关联的第一条记录，供流程中其他节点使用')}
        </div>

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

            <FindResult
              nodeType={this.props.selectNodeType}
              appType={data.appType}
              executeType={data.executeType}
              updateSource={updateSource}
            />
          </Fragment>
        )}
      </Fragment>
    );
  }
}
