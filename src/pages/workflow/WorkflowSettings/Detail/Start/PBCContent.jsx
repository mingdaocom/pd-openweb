import React, { Fragment, useState } from 'react';
import { Dropdown, Checkbox, Textarea, Dialog, Radio } from 'ming-ui';
import homeAppAjax from 'src/api/homeApp';
import { FIELD_TYPE_LIST } from '../../enum';
import { v4 as uuidv4, validate } from 'uuid';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import flowNode from '../../../api/flowNode';
import { checkJSON } from '../../utils';

const GenerateJSONBox = styled.textarea`
  padding: 12px;
  border-radius: 4px;
  height: 340px;
  overflow: auto;
  width: 100%;
  border: 1px solid #ddd;
  resize: none;
  &:focus {
    border-color: #2196f3;
  }
`;

const Header = styled.div`
  .w96 {
    width: 96px;
  }
  .w180 {
    width: 180px;
  }
  .red {
    color: #f44336;
  }
`;

const getDefaultParameters = isPlugin => {
  return {
    controlId: uuidv4(),
    controlName: '',
    type: 2,
    alias: '',
    required: false,
    desc: '',
    workflowDefaultValue: '',
    attribute: 0,
    options: isPlugin ? [{ key: '', value: '' }] : [],
  };
};

const PROCESS_TYPE = {
  1: {
    title: _l('工作流'),
    desc: _l('节点'),
  },
  2: {
    title: _l('自定义页面'),
    desc: _l('按钮'),
  },
};

const PLACEHOLDER = {
  2: _l('默认值'),
  6: _l('默认值'),
  9: _l('默认选项值'),
  14: '',
  16: _l('默认值 (2019-10-01 09:00)'),
  26: _l('默认值 (人员ID)'),
  27: _l('默认值 (部门ID)'),
  48: _l('默认值 (组织角色ID)'),
  10000007: _l('默认值 (示例：[] )'),
  10000008: _l('默认值 (示例：[] )'),
};

// 打开引用的流程
const openPage = ({ processId, type }) => {
  if (type === 1) {
    window.open(`/workflowedit/${processId}`);
  } else {
    homeAppAjax.getAppSimpleInfo({ workSheetId: processId }).then(({ appId, appSectionId }) => {
      window.open(`/app/${appId}/${appSectionId}/${processId}`);
    });
  }
};

// 导入生成参数
const generateJSON = (data, updateSource) => {
  Dialog.confirm({
    width: 640,
    title: _l('从JSON示例生成'),
    description: <GenerateJSONBox id="generateJSON" />,
    okText: _l('导入'),
    onOk: () => {
      return new Promise((resolve, reject) => {
        const json = document.getElementById('generateJSON').value.trim();

        if (checkJSON(json)) {
          flowNode.jsonToControls({ json }).then(controls => {
            const newControls = _.cloneDeep(data.controls);
            const generationOptions = ({ item, dataSource = '' }) => {
              return {
                controlId: uuidv4(),
                dataSource,
                jsonPath: item.jsonPath,
                controlName:
                  !dataSource && _.find(newControls, o => o.controlName === item.controlName)
                    ? item.controlName +
                      Math.floor(Math.random() * 10000)
                        .toString()
                        .padStart(4, '0')
                    : item.controlName,
                type: item.type,
                alias: item.controlName,
                required: item.required,
                desc: '',
                workflowDefaultValue: '',
                attribute: 0,
              };
            };

            controls
              .filter(item => item.type === 10000007)
              .map(item => {
                controls.push({
                  ...item,
                  type: 2,
                  controlName: 'string',
                  value: '',
                  jsonPath: '@',
                  dataSource: item.jsonPath,
                });
              });

            controls
              .filter(item => !item.dataSource)
              .forEach(item => {
                newControls.push(generationOptions({ item }));
              });

            controls
              .filter(item => item.dataSource)
              .forEach(item => {
                newControls.push(
                  generationOptions({
                    item,
                    dataSource: _.find(newControls, o => o.jsonPath === item.dataSource).controlId,
                  }),
                );
              });

            updateSource({ controls: newControls });
            resolve();
          });
        } else {
          alert(_l('JSON格式有错误'), 2);
          reject(true);
        }
      });
    },
  });
};

let cacheItem = {};

export default ({ data, updateSource, isIntegration, isPlugin }) => {
  const [selectControlId, setControlId] = useState('');
  const updateControls = (action, value, { controlId, type, dataSource }, isBlur) => {
    const controls = _.cloneDeep(data.controls);

    controls.forEach(item => {
      if (item.controlId === controlId) {
        item[action] =
          isBlur &&
          _.includes(['controlName', 'alias'], action) &&
          !!controls
            .filter(o => o.dataSource === dataSource)
            .find(o => value && o[action] === value && o.controlId !== controlId)
            ? value +
              Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0')
            : value;

        if (action === 'type' && value === 14) {
          item.value = '';
        }
      }
    });

    // 数组调整类型
    if (action === 'type' && _.includes([10000007, 10000008], type)) {
      _.remove(controls, o => o.dataSource === controlId);
    }

    // 普通数组
    if (action === 'type' && value === 10000007) {
      controls.push(
        Object.assign({}, getDefaultParameters(isPlugin), { controlName: 'string', dataSource: controlId }),
      );
    }

    updateSource({ controls });
  };
  const updateOptions = (action, value, { controlId, options }, index, isBlur) => {
    if (isBlur && !!options.find((o, i) => o[action] === value && i !== index)) {
      value =
        value +
        Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0');
    }

    options.forEach((o, i) => {
      if (i === index) {
        o[action] = value;
      }
    });

    updateControls('options', options, { controlId });
  };
  const addParameters = ({ type, dataSource, controlId }) => {
    const controls = _.cloneDeep(data.controls);
    const defaultParameters = getDefaultParameters(isPlugin);
    let index = 0;

    controls.forEach((item, i) => {
      if (item.controlId === controlId) {
        index = i;
      }
    });

    if (!controlId) {
      index = controls.length - 1;
    }

    if (type === 10000008 || dataSource) {
      controls.splice(index + 1, 0, Object.assign({}, defaultParameters, { dataSource: dataSource || controlId }));
    } else {
      controls.splice(index + 1, 0, defaultParameters);
    }

    updateSource({ controls });
    setControlId(defaultParameters.controlId);
    cacheItem = _.cloneDeep(defaultParameters);
  };
  const renderControlType = item => {
    return (
      <Dropdown
        className="flowDropdown w100"
        menuClass="w100"
        maxHeight={250}
        data={FIELD_TYPE_LIST.filter(
          o =>
            (_.includes([2, 6, 9, 14, 16, 26, 27, 36, 48, 10000007, 10000008], o.value) ||
              (isPlugin && o.value === 22)) &&
            (!item.dataSource || (item.dataSource && _.includes([2, 6, 16, 26, 27, 36, 48, 10000007], o.value))) &&
            !(isPlugin && _.includes([26, 27, 48], o.value)),
        )}
        value={item.type}
        renderTitle={() => <span>{FIELD_TYPE_LIST.find(o => o.value === item.type).text}</span>}
        border
        disabled={!validate(item.controlId)}
        onChange={type => updateControls('type', type, item)}
      />
    );
  };
  const renderControlName = item => {
    return (
      <input
        type="text"
        className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
        placeholder={_l('字段名（必填）')}
        value={item.controlName}
        maxLength={64}
        onChange={e => updateControls('controlName', e.target.value, item)}
        onBlur={e => updateControls('controlName', e.target.value.trim(), item, true)}
      />
    );
  };
  const renderControlAlias = item => {
    return (
      <input
        type="text"
        className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
        placeholder={item.dataSource ? _l('参数名（必填）') : _l('参数名')}
        value={item.alias}
        onChange={e => updateControls('alias', e.target.value.replace(/[^a-z\d-_]/gi, ''), item)}
        onBlur={e => {
          let value = e.target.value.trim();

          if (value && !/^[a-zA-Z]{1}/.test(value)) {
            value = (isPlugin ? 'plugin' : 'pbp') + value;
          }

          updateControls('alias', value, item, true);
        }}
      />
    );
  };
  const renderControlRequired = (item, showText) => {
    return (
      <Checkbox
        className="InlineBlock Font12 TxtMiddle LineHeight20"
        text={showText ? _l('必填') : ''}
        disabled={item.type === 22}
        checked={item.required}
        onClick={checked => updateControls('required', !checked, item)}
      />
    );
  };
  const renderList = source => {
    return source.map(item => {
      if (item.dataSource && _.find(data.controls, o => o.controlId === item.dataSource).type === 10000007) {
        return null;
      }

      return (
        <Fragment key={item.controlId}>
          <div className={cx('mTop10 flexRow alignItemsCenter relative', { pLeft20: item.dataSource })}>
            <div style={{ width: item.dataSource ? 160 : 180 }}>{renderControlType(item)}</div>
            <div className="flex flexRow mLeft10">{renderControlName(item)}</div>
            <div className="flex flexRow mLeft10">{renderControlAlias(item)}</div>
            <div className="mLeft10">{renderControlRequired(item)}</div>
            <span
              className="Font16 Gray_75 ThemeHoverColor3 pointer mLeft2"
              data-tip={_l('编辑')}
              onClick={() => {
                setControlId(item.controlId);
                cacheItem = _.cloneDeep(item);
              }}
            >
              <i className="icon-edit" />
            </span>
            <span
              className="Font16 Gray_75 ThemeHoverColor3 pointer mLeft10"
              data-tip={_l('删除')}
              onClick={() => {
                let controls = [].concat(data.controls);
                let objArrayIds = [];

                _.remove(controls, o => {
                  const isDelete = o.controlId === item.controlId || o.dataSource === item.controlId;

                  if (isDelete && o.type === 10000007) {
                    objArrayIds.push(o.controlId);
                  }

                  return isDelete;
                });

                // 移除普通数组的子项
                _.remove(controls, o => _.includes(objArrayIds, o.dataSource));

                updateSource({ controls });
              }}
            >
              <i className="icon-delete2" />
            </span>
            <span
              className="Font16 Gray_75 ThemeHoverColor3 pointer mLeft10"
              data-tip={_l('添加')}
              onClick={() => addParameters(item)}
            >
              <i className="icon-add" />
            </span>
          </div>
          {renderList(data.controls.filter(o => o.dataSource === item.controlId))}
        </Fragment>
      );
    });
  };
  const selectItem = data.controls.find(o => o.controlId === selectControlId);
  const defaultValue =
    selectItem && ((JSON.parse(_.get(selectItem, 'advancedSetting.defsource') || '[]')[0] || {}).staticValue || '');
  const updateControlAdvancedSetting = value => {
    updateControls('advancedSetting', Object.assign({}, _.get(selectItem, 'advancedSetting'), value), selectItem);
  };
  const updateControlAdvancedSettingDefaultValue = value => {
    updateControlAdvancedSetting(value ? { defsource: JSON.stringify([{ staticValue: value }]) } : { defsource: '[]' });
  };

  return (
    <Fragment>
      {!isIntegration && !isPlugin && (
        <div className="flowDetailStartHeader flexColumn BGBlueAsh">
          <div className="flowDetailStartIcon flexRow">
            <i className="icon-pbc Font40 gray" />
          </div>
          <div className="Font16 mTop10">{_l('封装业务流程')}</div>
        </div>
      )}

      <div className={cx('workflowDetailBox', { mTop20: !isIntegration && !isPlugin })}>
        <div className="Font13 bold">{_l('输入参数')}</div>
        {isIntegration && !data.controls.length && (
          <div className="Font13 Gray_75 mTop20">{_l('没有输入参数的 API 请直接保存完成配置')}</div>
        )}

        <Header className="flexRow mTop15">
          <div className="w180">{_l('类型')}</div>
          <div className="flex mLeft10">
            {_l('字段名')}
            <span className="red">*</span>
          </div>
          <div className="flex mLeft10">{_l('参数名')}</div>
          <div className="w96 mLeft10">{_l('必填')}</div>
        </Header>

        {renderList(data.controls.filter(o => !o.dataSource))}

        <div className="addActionBtn mTop25 flexRow alignItemsCenter">
          <span className="ThemeBorderColor3" onClick={addParameters}>
            <i className="icon-add Font16" />
            {_l('添加参数')}
          </span>
          {!isPlugin && (
            <div className="ThemeHoverColor3 pointer Gray_75" onClick={() => generateJSON(data, updateSource)}>
              <i className="Font14 icon-knowledge-upload" />
              {_l('从JSON示例生成')}
            </div>
          )}
        </div>

        {!isIntegration && !isPlugin && (
          <Fragment>
            <div className="Font13 bold mTop30">{_l('在本组织下，正在被以下事件调用')}</div>
            {!data.processList.length && (
              <div className="Font12 Gray_75 workflowDetailDesc mTop10 subProcessDesc">
                {_l('未被任何流程或按钮调用')}
              </div>
            )}
            {data.processList.map((item, i) => {
              return (
                <div className="workflowDetailDesc mTop10 subProcessDesc" key={i}>
                  <div className="Font13">
                    <span className="ThemeColor3 ThemeHoverColor2 pointer" onClick={() => openPage(item)}>
                      {PROCESS_TYPE[item.type].title}：{item.processName}
                    </span>
                  </div>
                  <div className="Font12">
                    <span className="Gray_75">{PROCESS_TYPE[item.type].desc}：</span>
                    <span>{item.flowNodes.map(obj => `${obj.name}`).join('、')}</span>
                  </div>
                </div>
              );
            })}
          </Fragment>
        )}
      </div>

      {!!selectControlId && (
        <Dialog
          className="workflowDialogBox"
          style={{ overflow: 'initial' }}
          overlayClosable={false}
          type="scroll"
          visible
          title={FIELD_TYPE_LIST.find(o => o.value === selectItem.type).text}
          onCancel={() => {
            updateSource({
              controls: data.controls.map(item => (item.controlId === selectControlId ? cacheItem : item)),
            });
            setControlId('');
          }}
          width={800}
          onOk={() => {
            if (selectItem.type === 9 && selectItem.options.filter(o => !o.key || !o.value).length) {
              alert(_l('选项名和选项值不能为空'), 2);
              return;
            }

            setControlId('');
          }}
        >
          <div className="flexRow">
            <div className="flex">
              <div className="bold">{_l('类型')}</div>
              <div className="mTop10">{renderControlType(selectItem)}</div>
            </div>
            <div className="flex mLeft10"></div>
          </div>

          <div className="flexRow mTop20">
            <div className="flex">
              <div className="bold">
                {_l('字段名')}
                <span style={{ color: '#f44336' }}>*</span>
              </div>
              <div className="mTop10 flexRow">{renderControlName(selectItem)}</div>
              <div className="mTop5 Gray_75">{_l('在用户输入时字段的显示名称。如：请输入手机号')}</div>
            </div>
            <div className="flex mLeft10">
              <div className="bold">{_l('参数名')}</div>
              <div className="mTop10 flexRow">{renderControlAlias(selectItem)}</div>
              <div className="mTop5 Gray_75">
                {_l('在节点、API调用时使用的参数名称，如：phone。未填写时，使用字段名')}
              </div>
            </div>
          </div>

          {selectItem.type === 9 && (
            <Fragment>
              <div className="mTop20 bold">{_l('选项')}</div>
              {selectItem.options.map((o, index) => (
                <div className="mTop10 flexRow alignItemsCenter" key={index}>
                  <input
                    type="text"
                    className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex mRight10"
                    placeholder={_l('选项名')}
                    value={o.value}
                    onChange={e => updateOptions('value', e.target.value, selectItem, index)}
                    onBlur={e => updateOptions('value', e.target.value.trim(), selectItem, index, true)}
                  />
                  <input
                    type="text"
                    className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
                    placeholder={_l('选项值')}
                    value={o.key}
                    onChange={evt => updateOptions('key', evt.target.value, selectItem, index)}
                    onBlur={evt => updateOptions('key', evt.target.value.trim(), selectItem, index, true)}
                  />
                  <i
                    className="icon-delete2 Font16 Gray_75 ThemeHoverColor3 mLeft10 pointer"
                    onClick={() => {
                      let newOptions = selectItem.options.filter((o, i) => i !== index);

                      if (!newOptions.length) {
                        newOptions = newOptions.concat({ key: '', value: '' });
                      }

                      updateControls('options', newOptions, selectItem);
                    }}
                  />
                  <i
                    className="icon-add Font16 Gray_75 ThemeHoverColor3 mLeft10 pointer"
                    onClick={() =>
                      updateControls('options', selectItem.options.concat({ key: '', value: '' }), selectItem)
                    }
                  />
                </div>
              ))}
            </Fragment>
          )}

          {isPlugin && selectItem.type === 36 && (
            <Fragment>
              <div className="mTop20">{_l('检查项')}</div>
              <div className="mTop10 flexRow">
                <input
                  type="text"
                  className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
                  placeholder={_l('内容')}
                  value={selectItem.hint}
                  onChange={evt => updateControls('hint', evt.target.value, selectItem)}
                  onBlur={evt => updateControls('hint', evt.target.value.trim(), selectItem)}
                />
              </div>
            </Fragment>
          )}

          {((isIntegration && !_.includes([14, 10000003], selectItem.type) && !selectItem.dataSource) ||
            (isPlugin && _.includes([2, 6, 9, 16, 36], selectItem.type))) && (
            <Fragment>
              <div className="mTop20 bold">{_l('默认值')}</div>
              <div className="mTop10 flexRow">
                {isIntegration ? (
                  <input
                    type="text"
                    className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
                    placeholder={PLACEHOLDER[selectItem.type]}
                    value={selectItem.workflowDefaultValue}
                    onChange={e => updateControls('workflowDefaultValue', e.target.value, selectItem)}
                    onBlur={e => updateControls('workflowDefaultValue', e.target.value.trim(), selectItem, true)}
                  />
                ) : (
                  <Fragment>
                    {_.includes([2, 6, 16], selectItem.type) && (
                      <input
                        type="text"
                        className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
                        placeholder={PLACEHOLDER['2']}
                        value={defaultValue}
                        onChange={e => updateControlAdvancedSettingDefaultValue(e.target.value)}
                        onBlur={e => updateControlAdvancedSettingDefaultValue(e.target.value.trim())}
                      />
                    )}

                    {selectItem.type === 9 && (
                      <Dropdown
                        className="flowDropdown w100"
                        menuClass="w100"
                        data={(defaultValue ? [{ text: _l('清除'), value: '' }] : []).concat(
                          selectItem.options.map(o => ({ text: o.value, value: o.key })),
                        )}
                        value={defaultValue || undefined}
                        border
                        onChange={value => updateControlAdvancedSettingDefaultValue(value)}
                      />
                    )}

                    {selectItem.type === 36 && (
                      <Dropdown
                        className="flowDropdown w100"
                        menuClass="w100"
                        data={[
                          { text: _l('选中'), value: '1' },
                          { text: _l('不选中'), value: '0' },
                        ]}
                        value={defaultValue || undefined}
                        border
                        onChange={value => updateControlAdvancedSettingDefaultValue(value)}
                      />
                    )}
                  </Fragment>
                )}
              </div>
              <div className="mTop5 Gray_75">{_l('添加默认值，如果用户未输入或映射任何数据，则使用此内容')}</div>
            </Fragment>
          )}

          <div className="mTop20 bold">{_l('填写说明')}</div>
          <div className="mTop10 flexRow">
            <input
              type="text"
              className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
              placeholder={_l('说明')}
              value={selectItem.desc}
              onChange={evt => updateControls('desc', evt.target.value, selectItem)}
              onBlur={evt => updateControls('desc', evt.target.value.trim(), selectItem)}
            />
          </div>
          <div className="mTop5 Gray_75">{_l('为用户输入此参数时提供必要的帮助说明')}</div>

          {isPlugin && _.includes([9, 36], selectItem.type) && (
            <Fragment>
              <div className="mTop20 bold">{_l('显示方式')}</div>
              <div className="mTop10 flexRow">
                {[
                  { text: selectItem.type === 9 ? _l('下拉框') : _l('勾选框'), value: '0' },
                  { text: selectItem.type === 9 ? _l('平铺') : _l('开关'), value: '1' },
                ].map(item => {
                  return (
                    <div className="mRight20" style={{ width: 200 }}>
                      <Radio
                        key={item.value}
                        checked={item.value === (_.get(selectItem, 'advancedSetting.showtype') || '0')}
                        text={item.text}
                        onClick={() => updateControlAdvancedSetting({ showtype: item.value })}
                      />
                    </div>
                  );
                })}
              </div>
            </Fragment>
          )}

          {isPlugin && selectItem.type === 9 && _.get(selectItem, 'advancedSetting.showtype') === '1' && (
            <Fragment>
              <div className="mTop20 bold">{_l('排列方式')}</div>
              <div className="mTop10 flexRow">
                {[
                  { text: _l('横向排列'), value: '2' },
                  { text: _l('纵向排列'), value: '1' },
                ].map(item => {
                  return (
                    <div className="mRight20" style={{ width: 200 }}>
                      <Radio
                        key={item.value}
                        checked={item.value === (_.get(selectItem, 'advancedSetting.direction') || '2')}
                        text={item.text}
                        onClick={() => updateControlAdvancedSetting({ direction: item.value })}
                      />
                    </div>
                  );
                })}
              </div>
            </Fragment>
          )}

          {selectItem.type === 10000003 && (
            <Fragment>
              <div className="mTop20 bold">{_l('数组结构（请给出一个范例）')}</div>
              <div className="mTop10">
                <Textarea
                  className="mTop10 Font13"
                  maxHeight={250}
                  minHeight={100}
                  disabled={!validate(selectItem.controlId)}
                  style={{ paddingTop: 7, paddingBottom: 7 }}
                  value={selectItem.value}
                  onChange={value => updateControls('value', value, selectItem)}
                />
              </div>
            </Fragment>
          )}

          {!_.includes([22, 36], selectItem.type) && (
            <Fragment>
              <div className="mTop20 bold">{_l('其他')}</div>
              <div className="mTop10">{renderControlRequired(selectItem, true)}</div>
              {selectItem.type < 10000000 && !selectItem.dataSource && (
                <Fragment>
                  <div className="mTop10">
                    <Checkbox
                      className="InlineBlock Font12 TxtMiddle LineHeight20"
                      text={_l('作为标题字段')}
                      checked={selectItem.attribute === 1}
                      onClick={() => {
                        let controls = [].concat(data.controls).map(o => {
                          o.attribute = o.controlId === selectItem.controlId ? (selectItem.attribute ? 0 : 1) : 0;

                          return o;
                        });

                        updateSource({ controls });
                      }}
                    />
                  </div>
                  <div className="mTop5 Gray_75 mLeft25">{_l('在查看执行历史时，使用此字段作为数据标题')}</div>
                </Fragment>
              )}
            </Fragment>
          )}
        </Dialog>
      )}
    </Fragment>
  );
};
