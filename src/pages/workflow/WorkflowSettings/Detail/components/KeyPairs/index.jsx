import React, { Fragment, useState } from 'react';
import { Textarea, Dropdown } from 'ming-ui';
import CustomTextarea from '../CustomTextarea';
import Tag from '../Tag';
import SelectOtherFields from '../SelectOtherFields';

export default ({
  processId = '',
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
}) => {
  const [fieldsVisible, setFieldsVisible] = useState('');

  const updateKeyValues = (key, value, i) => {
    let items = _.cloneDeep(source);

    if (!items[i]) items[i] = {};

    if (key === 'type') {
      items[i].value = '';
    }

    items[i][key] = value;
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
    const controlObj = formulaMap[ids[1]] || {};

    return (
      <div className="actionControlBox flex ThemeBorderColor3 clearBorderRadius ellipsis actionCustomBox">
        <span className="flexRow pTop3">
          <Tag
            flowNodeType={nodeObj.type}
            appType={nodeObj.appType}
            actionId={nodeObj.actionId}
            nodeName={nodeObj.name || ''}
            controlId={ids[1]}
            controlName={controlObj.name || ''}
          />
        </span>
        <i className="icon-delete actionControlDel ThemeColor3" onClick={() => updateKeyValues('value', '', i)} />
      </div>
    );
  };

  const renderSelectOtherFields = i => {
    return (
      <SelectOtherFields
        item={{ type: 14 }}
        fieldsVisible={fieldsVisible === i}
        processId={processId}
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
          newFormulaMap[obj.fieldValueId] = { type: obj.fieldValueType, name: obj.fieldValueName };

          updateSource({ formulaMap: newFormulaMap }, () => {
            updateKeyValues('value', `$${obj.nodeId}-${obj.fieldValueId}$`, i);
          });
          setFieldsVisible('');
        }}
        openLayer={() => setFieldsVisible(i)}
        closeLayer={() => setFieldsVisible('')}
      />
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
                onChange={evt => updateKeyValues(keyName, evt.target.value, i)}
              />
            )}

            {showType && (
              <Dropdown
                className="flowDropdown mTop10 mRight10"
                style={{ width: 100 }}
                data={[{ text: _l('文本'), value: 2 }, { text: _l('附件'), value: 14 }]}
                value={item.type || 2}
                border
                onChange={type => updateKeyValues('type', type, i)}
              />
            )}

            <div className="flex mRight8" style={{ minWidth: 0 }}>
              {pairsOnlyText ? (
                <Textarea
                  className="mTop10"
                  maxHeight={250}
                  minHeight={0}
                  style={{ paddingTop: 6, paddingBottom: 6 }}
                  placeholder={pairsPlaceholder}
                  value={item.value}
                  onChange={value => {
                    updateKeyValues(pairsName, value, i);
                  }}
                />
              ) : item.type === 14 ? (
                <div className="flexRow mTop10 relative">
                  {item.value ? renderTag(item.value, i) : <div className="actionControlBox flex clearBorderRadius" />}
                  {renderSelectOtherFields(i)}
                </div>
              ) : (
                <CustomTextarea
                  processId={processId}
                  selectNodeId={selectNodeId}
                  sourceAppId={appId}
                  isIntegration={isIntegration}
                  type={2}
                  height={0}
                  content={item.value}
                  formulaMap={formulaMap}
                  onChange={(err, value, obj) => updateKeyValues(pairsName, value, i)}
                  updateSource={updateSource}
                />
              )}
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
