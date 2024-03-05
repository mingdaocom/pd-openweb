import React, { Fragment, useState, useRef } from 'react';
import { Textarea, Dropdown, Menu, MenuItem } from 'ming-ui';
import CustomTextarea from '../CustomTextarea';
import Tag from '../Tag';
import SelectOtherFields from '../SelectOtherFields';
import _ from 'lodash';
import styled from 'styled-components';
import cx from 'classnames';
import { getIcons, handleGlobalVariableName } from '../../../utils';

const NodeListIcon = styled.div`
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 36px;
  top: 11px;
`;

const SelectNodeBox = styled.div`
  height: 34px;
  display: flex;
  align-items: center;
  position: absolute;
  left: 12px;
  right: 70px;
  top: 11px;
`;

const TextareaBox = styled(Textarea)`
  padding-top: 9px !important;
  padding-bottom: 9px !important;
  &:not(:hover):not(:focus) {
    border-color: #ddd !important;
  }
`;

export default ({
  projectId = '',
  processId = '',
  relationId = '',
  selectNodeId = '',
  isIntegration = false,
  appId = '',
  source = [],
  sourceKey = '',
  keyName = 'name',
  keyPlaceholder = 'key',
  pairsName = 'value',
  pairsPlaceholder = _l('参考value'),
  btnText = '+ key-value pairs',
  formulaMap = {},
  pairsOnlyText = false,
  updateSource = () => {},
  showType = false,
  onlyFile = false,
  flowNodeList = [],
}) => {
  const [fieldsVisible, setFieldsVisible] = useState('');
  const [selectIndex, setIndex] = useState(-1);
  const menuBtn = useRef(null);

  const updateKeyValues = ({ key, value, i, nodeId = '' }) => {
    let items = _.cloneDeep(source);

    if (!items[i]) items[i] = {};

    if (key === 'type') {
      items[i].value = '';
    }

    items[i][key] = value;
    items[i].nodeId = nodeId;
    updateSource({ [sourceKey]: items });
  };

  const deleteKeys = i => {
    const items = _.cloneDeep(source);

    _.remove(items, (obj, index) => index === i);
    updateSource({ [sourceKey]: items });
  };

  const renderTag = (tag, i) => {
    const ids = tag
      .replace(/\$/g, '')
      .split(/([a-zA-Z0-9#]{24,32})-/)
      .filter(item => item);
    const nodeObj = formulaMap[ids[0]] || {};
    const controlObj = formulaMap[ids.join('-')] || {};

    return (
      <div className="actionControlBox flex ThemeBorderColor3 clearBorderRadius ellipsis actionCustomBox">
        <span className="flexRow pTop3">
          <Tag
            flowNodeType={nodeObj.type}
            appType={nodeObj.appType}
            actionId={nodeObj.actionId}
            nodeName={handleGlobalVariableName(ids[0], controlObj.sourceType, nodeObj.name)}
            controlId={ids[1]}
            controlName={controlObj.name || ''}
          />
        </span>
        <i
          className="icon-delete actionControlDel ThemeColor3"
          onClick={() => updateKeyValues({ key: 'value', value: '', i })}
        />
      </div>
    );
  };

  const renderSelectOtherFields = i => {
    return (
      <SelectOtherFields
        item={{ type: 14 }}
        fieldsVisible={fieldsVisible === i}
        projectId={projectId}
        processId={processId}
        relationId={relationId}
        selectNodeId={selectNodeId}
        sourceAppId={appId}
        isIntegration={isIntegration}
        handleFieldClick={obj => {
          const newFormulaMap = _.cloneDeep(formulaMap);
          newFormulaMap[obj.nodeId] = {
            type: obj.nodeTypeId,
            appType: obj.appType,
            actionId: obj.actionId,
            name: obj.nodeName,
          };
          newFormulaMap[`${obj.nodeId}-${obj.fieldValueId}`] = {
            type: obj.fieldValueType,
            name: obj.fieldValueName,
            sourceType: obj.sourceType,
          };

          updateSource({ formulaMap: newFormulaMap }, () => {
            updateKeyValues({ key: 'value', value: `$${obj.nodeId}-${obj.fieldValueId}$`, i });
          });
          setFieldsVisible('');
        }}
        openLayer={() => setFieldsVisible(i)}
        closeLayer={() => setFieldsVisible('')}
      />
    );
  };

  const renderNodeList = (selected, i) => {
    const onHideMenu = () => {
      setIndex(-1);
    };

    if (i !== selectIndex) return null;

    return (
      <Menu className="nodeListMenu" onClickAwayExceptions={[menuBtn.current]} onClickAway={onHideMenu}>
        {selected && (
          <MenuItem
            onClick={() => {
              updateKeyValues({ key: 'value', value: '', i });
              onHideMenu();
            }}
          >
            {_l('清除选择')}
          </MenuItem>
        )}
        {flowNodeList.map(item => (
          <MenuItem
            key={item.nodeId}
            onClick={() => {
              updateKeyValues({ key: 'value', value: '', i, nodeId: item.nodeId });
              onHideMenu();
            }}
          >
            <div className="flexRow" style={{ alignItems: 'center' }}>
              <span className={cx('Font16 Gray_9e', getIcons(item.nodeTypeId, item.appType, item.actionId))} />
              <span className={cx('Font14 mLeft5 ellipsis flex', { Gray_9e: !item.appId })}>{item.nodeName}</span>
              {item.appId && item.appName ? (
                <Fragment>
                  <span className="Font14 mLeft5 bold flowDropdownGray">{item.appTypeName}</span>
                  <span
                    className="Font14 mLeft5 bold flowDropdownGray ellipsis"
                    style={{ maxWidth: 150 }}
                  >{`“${item.appName}”`}</span>
                </Fragment>
              ) : (
                <span className="Font14 mLeft5 Gray_75">
                  <i className="icon-workflow_error Font14 mRight5" />
                  {_l('设置此节点后才能选择')}
                </span>
              )}
            </div>
          </MenuItem>
        ))}
      </Menu>
    );
  };

  const renderNodeListTag = item => {
    if (!item.nodeId) return null;

    const current = _.find(flowNodeList, o => o.nodeId === item.nodeId) || {};

    return (
      <SelectNodeBox>
        <Tag
          flowNodeType={current.nodeTypeId}
          appType={current.appType}
          actionId={current.appId}
          nodeName={handleGlobalVariableName(current.nodeId, current.sourceType, current.appName)}
          controlId={current.nodeId}
          controlName={current.nodeName}
        />
      </SelectNodeBox>
    );
  };

  return (
    <Fragment>
      {source.map((item, i) => {
        return (
          <div className="flexRow" key={i}>
            {!onlyFile && (
              <input
                type="text"
                className="mTop10 ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mRight10"
                style={{ width: 140 }}
                placeholder={keyPlaceholder}
                value={item.name}
                onChange={evt => updateKeyValues({ key: keyName, value: evt.target.value, i, nodeId: item.nodeId })}
              />
            )}

            {showType && (
              <Dropdown
                className="flowDropdown mTop10 mRight10"
                style={{ width: 100 }}
                data={[
                  { text: _l('文本'), value: 2 },
                  { text: _l('附件'), value: 14 },
                ]}
                value={item.type || 2}
                border
                onChange={type => updateKeyValues({ key: 'type', value: type, i })}
              />
            )}

            <div className={cx('flex mRight8 relative', { hasNodeList: flowNodeList.length })} style={{ minWidth: 0 }}>
              {pairsOnlyText ? (
                <TextareaBox
                  className="mTop10 ThemeBorderColor3"
                  maxHeight={250}
                  minHeight={0}
                  placeholder={pairsPlaceholder}
                  value={item.value}
                  onChange={value => {
                    updateKeyValues({ key: pairsName, value, i });
                  }}
                />
              ) : item.type === 14 ? (
                <div className="flexRow mTop10 relative">
                  {item.value ? renderTag(item.value, i) : <div className="actionControlBox flex clearBorderRadius" />}
                  {renderSelectOtherFields(i)}
                </div>
              ) : (
                <CustomTextarea
                  projectId={projectId}
                  processId={processId}
                  relationId={relationId}
                  selectNodeId={selectNodeId}
                  sourceAppId={appId}
                  isIntegration={isIntegration}
                  type={2}
                  height={0}
                  content={item.value}
                  formulaMap={formulaMap}
                  onChange={(err, value, obj) => updateKeyValues({ key: pairsName, value, i })}
                  updateSource={updateSource}
                />
              )}

              {!!flowNodeList.length && (
                <NodeListIcon ref={menuBtn} onClick={() => setIndex(i)}>
                  <i className="icon-arrow-down-border Font16 ThemeHoverColor3 pointer Gray_bd" />
                </NodeListIcon>
              )}

              {renderNodeList(!!item.nodeId, i)}
              {renderNodeListTag(item)}
            </div>
            {!onlyFile && (
              <i
                className="icon-delete2 Font16 mTop20 ThemeHoverColor3 pointer Gray_bd"
                onClick={() => deleteKeys(i)}
              />
            )}
          </div>
        );
      })}

      {btnText && (
        <div className="mTop10">
          <span
            className="ThemeHoverColor3 pointer Gray_9e"
            onClick={() =>
              updateSource({
                [sourceKey]: source.concat(
                  Object.assign({ [keyName]: '', [pairsName]: '' }, showType ? { type: 2 } : {}),
                ),
              })
            }
          >
            {btnText}
          </span>
        </div>
      )}
    </Fragment>
  );
};
