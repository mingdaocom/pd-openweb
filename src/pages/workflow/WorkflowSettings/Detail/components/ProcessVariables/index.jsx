import React from 'react';
import { Icon, Dropdown } from 'ming-ui';
import './index.less';
import { v4 as uuidv4, validate } from 'uuid';
import { FIELD_TYPE_LIST } from '../../../enum';
import _ from 'lodash';
import cx from 'classnames';

const getDefaultParameters = () => {
  return {
    controlId: uuidv4(),
    controlName: '',
    type: 2,
    enumDefault: 0,
    desc: '',
    processVariableType: 0,
  };
};

export default props => {
  const { updateSource, processVariables } = props;
  const list = processVariables.filter(item => item.processVariableType === 0);
  const addParameters = ({ type, dataSource, controlId }) => {
    let defaultParameters = getDefaultParameters();
    let index = 0;

    if (!controlId) {
      index = processVariables.length - 1;
    } else {
      processVariables.forEach((item, i) => {
        if (item.controlId === controlId) {
          index = i;
        }
      });
    }

    if (type === 10000008 || dataSource) {
      defaultParameters = Object.assign({}, defaultParameters, { dataSource: dataSource || controlId });
      processVariables.splice(index + 1, 0, defaultParameters);
    } else {
      processVariables.splice(index + 1, 0, defaultParameters);
    }

    updateSource({ processVariables });
  };
  const updateControls = (action, value, { controlId, type, dataSource }, isBlur) => {
    processVariables.forEach(item => {
      if (item.controlId === controlId) {
        item[action] =
          isBlur &&
          action === 'controlName' &&
          !!processVariables
            .filter(o => o.processVariableType === 0)
            .filter(o => o.dataSource === dataSource)
            .find(o => value && o[action] === value && o.controlId !== controlId)
            ? value +
              Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, '0')
            : value;

        if (action === 'type') {
          item.enumDefault = _.includes([26, 27], type) ? 1 : 0;
        }
      }
    });

    // 数组调整类型
    if (action === 'type' && _.includes([10000007, 10000008], type)) {
      _.remove(processVariables, o => o.dataSource === controlId);
    }

    // 普通数组
    if (action === 'type' && value === 10000007) {
      processVariables.push(
        Object.assign({}, getDefaultParameters(), { controlName: 'string', dataSource: controlId }),
      );
    }

    updateSource({ processVariables });
  };

  return (
    <div className="workflowProcessVariables">
      <div className="flexRow">
        <div style={{ width: 120 }}>{_l('参数类型')}</div>
        <div className="flex mLeft15">{_l('参数名称')}</div>
        <div className="flex mLeft15">{_l('说明')}</div>
      </div>

      {list.map((item, index) => {
        if (item.dataSource && _.find(list, o => o.controlId === item.dataSource).type === 10000007) {
          return null;
        }

        return (
          <div key={index} className={cx('flexRow mTop12 relative', { pLeft20: item.dataSource })}>
            <Dropdown
              style={{ width: item.dataSource ? 100 : 120 }}
              menuStyle={{ width: '100%' }}
              data={FIELD_TYPE_LIST.filter(
                o =>
                  _.includes([2, 6, 16, 10000007, 26, 27, 48], o.value) || (!item.dataSource && o.value === 10000008),
              )}
              value={item.type}
              disabled={!validate(item.controlId)}
              border
              onChange={type => updateControls('type', type, item)}
            />

            <input
              type="text"
              className="flex mLeft15 processConfigInput"
              value={item.controlName}
              maxLength={64}
              onChange={e => updateControls('controlName', e.target.value, item)}
              onBlur={e => {
                let value = e.target.value.trim().replace(/[^a-z\d-_]/gi, '');

                if (value && !/^[a-zA-Z]{1}/.test(value)) {
                  value = 'parameter' + value;
                }

                updateControls('controlName', value, item, true);
              }}
            />

            <input
              type="text"
              className="flex mLeft15 processConfigInput"
              value={item.desc}
              onChange={e => updateControls('desc', e.target.value, item)}
              onBlur={evt => updateControls('desc', evt.target.value.trim(), item)}
            />

            <Icon
              icon="task-new-delete"
              className="Font16 mLeft10 Gray_75 processConfigDel"
              onClick={() => {
                let objArrayIds = [];

                _.remove(processVariables, o => {
                  const isDelete = o.controlId === item.controlId || o.dataSource === item.controlId;

                  if (isDelete && o.type === 10000007) {
                    objArrayIds.push(o.controlId);
                  }

                  return isDelete;
                });

                // 移除普通数组的子项
                _.remove(processVariables, o => _.includes(objArrayIds, o.dataSource));

                updateSource({ processVariables });
              }}
            />

            <Icon
              icon="add"
              className="Font20 mLeft10 Gray_75 ThemeHoverColor3 mTop8 pointer"
              onClick={() => addParameters(item)}
            />
          </div>
        );
      })}

      <div className="mTop15">
        <span className="processConfigAdd" onClick={addParameters}>
          + {_l('新参数')}
        </span>
      </div>
    </div>
  );
};
