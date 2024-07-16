import React, { Fragment } from 'react';
import { APP_TYPE, NODE_TYPE, GLOBAL_VARIABLE } from '../../enum';
import { Tag, SingleControlValue } from '../components';
import SelectGlobalVar from 'src/pages/Admin/app/globalVariable/components/SelectGlobalVarDialog';
import { Dropdown } from 'ming-ui';
import _ from 'lodash';
import { handleGlobalVariableName } from '../../utils';

export default props => {
  const { relationId, data, updateSource } = props;
  // 渲染操作类型
  const renderOperatorType = (item, i) => {
    const TYPES = [
      { text: _l('设为'), value: 0 },
      { text: _l('增加'), value: 1 },
      { text: _l('减少'), value: 2 },
    ];

    // 数值
    if (item.fieldId && item.type === 6) {
      return (
        <Dropdown
          className="flowAddTypeDropdown"
          data={TYPES}
          value={item.addType}
          onChange={addType => updateOperatorType(addType, i)}
        />
      );
    }

    return (
      <div className="Gray_75" style={{ lineHeight: '20px' }}>
        {_l('设为')}
      </div>
    );
  };
  // 修改操作类型
  const updateOperatorType = (addType, i) => {
    const fields = _.cloneDeep(data.fields);

    fields[i].addType = addType;
    updateSource({ fields });
  };

  return (
    <Fragment>
      <div className="Font13 bold">{_l('更新变量')}</div>
      <div className="mTop20 Gray_75">{_l('将变量')}</div>

      {!data.fields.length && (
        <div
          className="inlineFlexRow mTop12 ThemeColor3 workflowDetailAddBtn"
          onClick={() =>
            SelectGlobalVar({
              projectId: props.companyId,
              appId: relationId,
              filterNoEdit: true,
              onOk: ({ id, controlType, name, sourceType }) => {
                updateSource({
                  fields: [
                    {
                      addType: 0,
                      fieldId: id,
                      fieldName: name,
                      type: controlType,
                      enumDefault: 0,
                      fieldValue: _.includes([26, 27], controlType) ? '[]' : '',
                      fieldValueId: '',
                      nodeId: '',
                      sourceControlType: sourceType,
                    },
                  ],
                });
              },
            })
          }
        >
          <i className="Font28 icon-task-add-member-circle mRight10" />
          {_l('选择全局变量')}
        </div>
      )}

      {data.fields.map((item, i) => {
        return (
          <Fragment>
            <ul className="flowDetailMembers">
              <li className="flexRow">
                <Tag
                  flowNodeType={NODE_TYPE.ACTION}
                  appType={APP_TYPE.GLOBAL_VARIABLE}
                  nodeName={handleGlobalVariableName(GLOBAL_VARIABLE, item.sourceControlType)}
                  controlId={item.fieldId}
                  controlName={item.fieldName}
                />
                <span
                  className="mLeft5 flowDetailMemberDel"
                  data-tip={_l('刪除')}
                  onClick={() => updateSource({ fields: [] })}
                >
                  <i className="icon-delete Font18" />
                </span>
              </li>
            </ul>

            <div className="mTop10 flexRow alignItemsCenter">
              <div className="flex">{renderOperatorType(item, i)}</div>
            </div>

            <SingleControlValue
              showClear
              companyId={props.companyId}
              relationId={props.relationId}
              processId={props.processId}
              selectNodeId={props.selectNodeId}
              controls={[]}
              formulaMap={data.formulaMap}
              fields={data.fields}
              updateSource={updateSource}
              item={item}
              i={i}
            />
          </Fragment>
        );
      })}
    </Fragment>
  );
};
