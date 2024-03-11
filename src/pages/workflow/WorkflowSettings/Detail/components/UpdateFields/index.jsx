import React, { Component, Fragment } from 'react';
import { Dropdown } from 'ming-ui';
import { CONTROLS_NAME } from '../../../enum';
import { SingleControlValue, AddOptions } from '../';
import _ from 'lodash';

export default class UpdateFields extends Component {
  static defaultProps = {
    type: 1, // 1：更新字段 2：更新参数
    isBatch: false,
    isSubProcessNode: false,
    companyId: '',
    processId: '',
    relationId: '',
    selectNodeId: '',
    nodeId: '',
    controls: [],
    fields: [],
    showCurrent: false,
    filterType: 0,
    formulaMap: {},
    updateSource: () => {},
  };

  /**
   * fields dropdown title
   */
  renderFieldsTitle(item) {
    if (!item) return null;

    if (item.type === 29) {
      return (
        <div className="flexRow">
          <div>
            <span className="Gray_9e mRight5">[{CONTROLS_NAME[item.type]}]</span>
            <span>{item.controlName}</span>
          </div>
          <span className="flex ellipsis mLeft10 Gray_9e" style={{ textAlign: 'right' }}>
            {_l('工作表＂%0＂', item.sourceEntityName)}
          </span>
        </div>
      );
    }

    return (
      <Fragment>
        <span className="Gray_9e mRight5">[{CONTROLS_NAME[item.type]}]</span>
        <span>{item.controlName}</span>
      </Fragment>
    );
  }

  /**
   * 切换字段
   */
  switchFields(fieldId, i) {
    const { controls, updateSource } = this.props;
    const singleControl = _.find(controls, item => item.controlId === fieldId);
    const fields = _.cloneDeep(this.props.fields);

    fields[i] = {
      addType: 0,
      fieldId,
      type: singleControl.type,
      enumDefault: singleControl.enumDefault,
      fieldValue: singleControl.type === 26 || singleControl.type === 27 ? '[]' : '',
      fieldValueId: '',
      nodeId: '',
    };
    updateSource({ fields });
  }

  /**
   * 添加字段
   */
  addFields = () => {
    const fields = _.cloneDeep(this.props.fields);

    fields.push({
      fieldId: '',
      type: 0,
      fieldValue: '',
      fieldValueId: '',
      nodeId: '',
    });

    this.props.updateSource({ fields });
  };

  /**
   * 删除字段
   */
  delFields(i) {
    const fields = _.cloneDeep(this.props.fields);

    _.remove(fields, (item, index) => index === i);
    this.props.updateSource({ fields });
  }

  /**
   * 渲染操作类型
   */
  renderOperatorType(item, i) {
    const { type, isBatch } = this.props;
    const TYPES = [
      { text: _l('设为'), value: 0 },
      { text: _l('增加'), value: 1 },
      { text: _l('减少'), value: 2 },
    ];

    // 附件没有减少
    if (item.type === 14) {
      _.remove(TYPES, o => o.value === 2);
    }

    // 数值 || 金额 || 选项 || 附件 || 人员 || 部门 || 组织角色 || 关联他表多条
    if (
      item.fieldId &&
      (_.includes([6, 8, 9, 10, 11, 14, 26, 27, 48], item.type) || (item.type === 29 && item.enumDefault === 2)) &&
      type === 1 &&
      !isBatch
    ) {
      return (
        <Dropdown
          className="flowAddTypeDropdown"
          data={TYPES}
          value={item.addType}
          onChange={addType => this.updateOperatorType(addType, i)}
        />
      );
    }

    return (
      <div className="Gray_9e" style={{ lineHeight: '20px' }}>
        {_l('设为')}
      </div>
    );
  }

  /**
   * 修改操作类型
   */
  updateOperatorType(addType, i) {
    const fields = _.cloneDeep(this.props.fields);

    fields[i].addType = addType;
    this.props.updateSource({ fields });
  }

  render() {
    const {
      controls,
      fields,
      formulaMap,
      updateSource,
      companyId,
      relationId,
      processId,
      selectNodeId,
      type,
      nodeId,
      isSubProcessNode,
      showCurrent,
      isBatch,
      filterType,
    } = this.props;
    const relationList = controls
      .filter(v => v.type === 29)
      .map(item => {
        return {
          text: this.renderFieldsTitle(item),
          searchText: item.controlName,
          value: item.controlId,
          disabled: !!_.find(fields, o => o.fieldId === item.controlId),
        };
      });
    const otherList = controls
      .filter(v => v.type !== 29)
      .map(item => {
        return {
          text: this.renderFieldsTitle(item),
          searchText: item.controlName,
          value: item.controlId,
          disabled: !!_.find(fields, o => o.fieldId === item.controlId),
        };
      });
    const list = [otherList, relationList];

    return (
      <Fragment>
        {fields.map((item, i) => {
          return (
            <Fragment key={item.fieldId || i}>
              <div className="relative actionItem mTop15">
                <div className="Gray_9e">{type === 1 ? _l('将字段') : _l('将参数')}</div>
                <Dropdown
                  className="flowDropdown mTop5 flowDropdownMinWidth"
                  data={list}
                  value={item.fieldId || undefined}
                  border
                  openSearch
                  isAppendToBody
                  noData={isSubProcessNode ? _l('子流程暂无参数') : _l('本流程暂无参数')}
                  placeholder={type === 1 ? _l('请选择字段') : _l('请选择参数')}
                  renderTitle={() =>
                    item.fieldId && this.renderFieldsTitle(_.find(controls, obj => obj.controlId === item.fieldId))
                  }
                  onChange={fields => this.switchFields(fields, i)}
                />

                <div className="mTop10 flexRow alignItemsCenter">
                  <div className="flex">{this.renderOperatorType(item, i)}</div>
                  {type === 1 && _.includes([9, 10, 11], item.type) && item.fieldValueId && (
                    <AddOptions
                      checked={item.allowAddOptions || false}
                      fields={fields}
                      index={i}
                      updateSource={updateSource}
                    />
                  )}
                </div>

                <SingleControlValue
                  showClear
                  showCurrent={showCurrent}
                  isBatch={isBatch}
                  companyId={companyId}
                  processId={processId}
                  relationId={relationId}
                  selectNodeId={selectNodeId}
                  sourceNodeId={nodeId}
                  controls={controls}
                  formulaMap={formulaMap}
                  fields={fields}
                  updateSource={updateSource}
                  filterType={filterType}
                  item={item}
                  i={i}
                />
                <i className="icon-delete2 Font16 ThemeColor3 actionItemDel" onClick={() => this.delFields(i)} />
              </div>
              {i !== fields.length - 1 && <div className="actionFieldsSplit" />}
            </Fragment>
          );
        })}
        <div className="addActionBtn mTop20">
          <span className="ThemeBorderColor3" onClick={this.addFields}>
            <i className="icon-add Font16" />
            {type === 1 ? _l('添加字段') : _l('添加参数')}
          </span>
        </div>
      </Fragment>
    );
  }
}
