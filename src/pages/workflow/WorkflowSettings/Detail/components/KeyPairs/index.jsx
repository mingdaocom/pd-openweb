import React, { Fragment } from 'react';
import { Textarea } from 'ming-ui';
import CustomTextarea from '../CustomTextarea';

export default ({
  processId = '',
  selectNodeId = '',
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
}) => {
  const updateKeyValues = (key, value, i) => {
    let items = _.cloneDeep(source);

    if (!items[i]) items[i] = {};

    items[i][key] = value;
    updateSource({ [sourceKey]: items });
  };

  const deleteKeys = i => {
    const items = _.cloneDeep(source);

    _.remove(items, (obj, index) => index === i);
    updateSource({ [sourceKey]: items });
  };

  return (
    <Fragment>
      {source.map((item, i) => {
        return (
          <div className="flexRow" key={i}>
            <input
              type="text"
              className="mTop10 ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10"
              style={{ width: 140 }}
              placeholder={keyPlaceholder}
              value={item.name}
              onChange={evt => updateKeyValues(keyName, evt.target.value, i)}
            />
            <div className="flex mLeft10" style={{ minWidth: 0 }}>
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
              ) : (
                <CustomTextarea
                  processId={processId}
                  selectNodeId={selectNodeId}
                  sourceAppId={appId}
                  type={2}
                  height={0}
                  content={item.value}
                  formulaMap={formulaMap}
                  onChange={(err, value, obj) => updateKeyValues(pairsName, value, i)}
                  updateSource={updateSource}
                />
              )}
            </div>
            <i
              className="icon-delete2 Font16 mLeft8 mTop20 ThemeHoverColor3 pointer Gray_bd"
              onClick={() => deleteKeys(i)}
            />
          </div>
        );
      })}
      <div className="mTop10">
        <span
          className="ThemeHoverColor3 pointer Gray_9e"
          onClick={() => updateSource({ [sourceKey]: source.concat({ [keyName]: '', [pairsName]: '' }) })}
        >
          {btnText}
        </span>
      </div>
    </Fragment>
  );
};
