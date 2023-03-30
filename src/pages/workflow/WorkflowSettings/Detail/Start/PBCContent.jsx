import React, { Fragment } from 'react';
import { Dropdown, Checkbox, Textarea, Dialog } from 'ming-ui';
import homeAppAjax from 'src/api/homeApp';
import { FIELD_TYPE_LIST } from '../../enum';
import { v4 as uuidv4, validate } from 'uuid';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import flowNode from '../../../api/flowNode';
import { checkJSON } from '../../utils';

const FIELD_TYPE = FIELD_TYPE_LIST.concat([{ text: _l('对象'), value: 10000006, en: 'object' }]);

const GenerateJSONBox = styled.textarea`
  padding: 12px;
  border-radius: 4px;
  height: 340px;
  overflow: auto;
  width: 100%;
  border: 1px solid #ddd;
  resize: none;
  margin-bottom: -22px;
  &:focus {
    border-color: #2196f3;
  }
`;

const getDefaultParameters = () => {
  return {
    controlId: uuidv4(),
    controlName: '',
    type: 2,
    alias: '',
    required: false,
    desc: '',
    workflowDefaultValue: '',
  };
};

export default ({ data, updateSource, isIntegration }) => {
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
    14: '',
    16: _l('默认值 (2019-10-01 09:00)'),
    26: _l('默认值 (人员ID)'),
    27: _l('默认值 (部门ID)'),
    10000007: _l('默认值 (示例：[] )'),
    10000008: _l('默认值 (示例：[] )'),
  };
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
      controls.push(Object.assign({}, getDefaultParameters(), { controlName: 'string', dataSource: controlId }));
    }

    updateSource({ controls });
  };
  const openPage = ({ processId, type }) => {
    if (type === 1) {
      window.open(`/workflowedit/${processId}`);
    } else {
      homeAppAjax.getAppSimpleInfo({ workSheetId: processId }).then(({ appId, appSectionId }) => {
        window.open(`/app/${appId}/${appSectionId}/${processId}`);
      });
    }
  };
  const addParameters = ({ type, dataSource, controlId }) => {
    const controls = _.cloneDeep(data.controls);
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
      controls.splice(index + 1, 0, Object.assign({}, getDefaultParameters(), { dataSource: dataSource || controlId }));
    } else {
      controls.splice(index + 1, 0, getDefaultParameters());
    }

    updateSource({ controls });
  };
  const renderList = source => {
    return source.map(item => {
      if (item.dataSource && _.find(data.controls, o => o.controlId === item.dataSource).type === 10000007) {
        return null;
      }

      return (
        <Fragment key={item.controlId}>
          <div className={cx('mTop15 flexRow alignItemsCenter relative', { pLeft20: item.dataSource })}>
            <input
              type="text"
              className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10"
              style={{ width: 180 }}
              placeholder={_l('参数名')}
              value={item.controlName}
              maxLength={64}
              onChange={e => updateControls('controlName', e.target.value, item)}
              onBlur={e => updateControls('controlName', e.target.value.trim(), item, true)}
            />

            <Dropdown
              className="flowDropdown mLeft10"
              style={{ width: 160 }}
              data={FIELD_TYPE_LIST.filter(
                o =>
                  o.value !== 10000003 &&
                  (!item.dataSource || (item.dataSource && !_.includes([14, 10000008], o.value))),
              )}
              value={item.type}
              renderTitle={() => <span>{FIELD_TYPE.find(o => o.value === item.type).text}</span>}
              border
              disabled={!validate(item.controlId)}
              onChange={type => {
                updateControls('type', type, item);
              }}
            />

            <input
              type="text"
              className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex mLeft10"
              placeholder={_l('别名')}
              value={item.alias}
              onChange={e => updateControls('alias', e.target.value.replace(/[^a-z\d-_]/gi, ''), item)}
              onBlur={e => {
                let value = e.target.value.trim();

                if (value && !/^[a-zA-Z]{1}/.test(value)) {
                  value = 'pbp' + value;
                }

                updateControls('alias', value, item, true);
              }}
            />

            <Checkbox
              className="InlineBlock Font12 TxtMiddle mLeft10 LineHeight20"
              text={_l('必填')}
              checked={item.required}
              onClick={checked => updateControls('required', !checked, item)}
            />
            <i
              className="icon-delete2 Font16 Gray_9e ThemeHoverColor3 mLeft10 pointer"
              onClick={() => {
                let controls = [].concat(data.controls);

                _.remove(controls, o => o.controlId === item.controlId || o.dataSource === item.controlId);
                updateSource({ controls });
              }}
            />
            <i
              className="icon-add Font20 pointer Gray_9e ThemeHoverColor3 mLeft10 pointer"
              onClick={() => addParameters(item)}
            />
          </div>
          <div className={cx('mTop10 flexRow alignItemsCenter', { pLeft20: item.dataSource })}>
            {isIntegration && item.type !== 10000003 && !item.dataSource && (
              <input
                type="text"
                className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mRight10"
                disabled={item.type === 14}
                style={{ width: 180 }}
                placeholder={PLACEHOLDER[item.type]}
                value={item.workflowDefaultValue}
                onChange={e => updateControls('workflowDefaultValue', e.target.value, item)}
                onBlur={e => updateControls('workflowDefaultValue', e.target.value.trim(), item, true)}
              />
            )}
            <input
              type="text"
              className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
              placeholder={_l('说明')}
              value={item.desc}
              onChange={evt => updateControls('desc', evt.target.value, item)}
              onBlur={evt => updateControls('desc', evt.target.value.trim(), item)}
            />
          </div>
          {item.type === 10000003 && (
            <Textarea
              className="mTop10"
              maxHeight={250}
              minHeight={0}
              disabled={!validate(item.controlId)}
              style={{ paddingTop: 6, paddingBottom: 6 }}
              placeholder={_l('数组结构（请给出一个范例）')}
              value={item.value}
              onChange={value => {
                updateControls('value', value, item);
              }}
            />
          )}
          {renderList(data.controls.filter(o => o.dataSource === item.controlId))}
        </Fragment>
      );
    });
  };
  const generateJSON = () => {
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

  return (
    <Fragment>
      {!isIntegration && (
        <div className="flowDetailStartHeader flexColumn BGBlueAsh">
          <div className="flowDetailStartIcon flexRow">
            <i className="icon-pbc Font40 gray" />
          </div>
          <div className="Font16 mTop10">{_l('封装业务流程')}</div>
        </div>
      )}

      <div className="workflowDetailBox mTop20">
        <div className="Font13 bold">{_l('输入参数')}</div>
        {isIntegration && !data.controls.length && (
          <div className="Font13 Gray_75 mTop20">{_l('没有输入参数的 API 请直接保存完成配置')}</div>
        )}

        {renderList(data.controls.filter(o => !o.dataSource))}

        <div className="addActionBtn mTop25 flexRow alignItemsCenter">
          <span className="ThemeBorderColor3" onClick={addParameters}>
            <i className="icon-add Font16" />
            {_l('添加参数')}
          </span>
          <div className="ThemeHoverColor3 pointer Gray_75" onClick={generateJSON}>
            <i className="Font14 icon-knowledge-upload" />
            {_l('从json示例生成')}
          </div>
        </div>

        {!isIntegration && (
          <Fragment>
            <div className="Font13 bold mTop30">{_l('在本组织下，正在被以下事件调用')}</div>
            {!data.processList.length && (
              <div className="Font12 Gray_9e workflowDetailDesc mTop10 subProcessDesc">
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
                    <span className="Gray_9e">{PROCESS_TYPE[item.type].desc}：</span>
                    <span>{item.flowNodes.map(obj => `${obj.name}`).join('、')}</span>
                  </div>
                </div>
              );
            })}
          </Fragment>
        )}
      </div>
    </Fragment>
  );
};
