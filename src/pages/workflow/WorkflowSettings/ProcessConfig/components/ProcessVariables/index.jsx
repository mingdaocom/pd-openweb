import React, { Component } from 'react';
import { Icon, Dropdown } from 'ming-ui';
import './index.less';
import { v4 as uuidv4, validate } from 'uuid';
import { FIELD_TYPE_LIST } from '../../../enum';
import _ from 'lodash';

export default class ProcessVariables extends Component {
  addVariables = () => {
    const { updateSource, processVariables } = this.props;

    updateSource({
      processVariables: processVariables.concat([
        { type: 2, controlName: '', enumDefault: 0, controlId: uuidv4(), processVariableType: 0 },
      ]),
    });
  };

  render() {
    const { updateSource, processVariables, setErrorItems, errorItems } = this.props;
    const list = processVariables.filter(item => item.processVariableType === 0);

    return (
      <div className="workflowProcessVariables">
        <div className="flexRow">
          <div style={{ width: 120 }}>{_l('参数类型')}</div>
          <div className="flex mLeft15">{_l('参数名称')}</div>
        </div>

        {list.map((item, index) => (
          <div key={index} className="flexRow mTop12 relative">
            <Dropdown
              style={{ width: 120 }}
              menuStyle={{ width: '100%' }}
              data={FIELD_TYPE_LIST.filter(o => _.includes([2, 6, 16, 26, 27, 48], o.value))}
              value={item.type}
              disabled={!validate(item.controlId)}
              border
              onChange={type => {
                updateSource({
                  processVariables: processVariables.map(o => {
                    if (o.controlId === item.controlId) {
                      o.type = type;
                      o.enumDefault = _.includes([26, 27], type) ? 1 : 0;
                    }
                    return o;
                  }),
                });
              }}
            />
            <input
              type="text"
              className="mLeft15 processConfigInput"
              placeholder={_l('参数名称')}
              value={item.controlName}
              maxLength={64}
              onChange={e => {
                const value = e.target.value.trim();
                let error = '';

                if (value) {
                  if (!/^[a-zA-Z]{1}\w*$/.test(value)) {
                    error = 1;
                  } else if (list.filter(o => value === o.controlName).length > 0) {
                    error = 2;
                  } else {
                    error = '';
                  }
                } else {
                  error = '';
                }

                const others = list.filter(o => o.controlId !== item.controlId);
                let repeatControl = {};
                others.forEach(element => {
                  if (
                    !_.find(others, o => o.controlName === element.controlName && o.controlId !== element.controlId)
                  ) {
                    repeatControl[element.controlId] = errorItems[element.controlId] === 1 ? 1 : '';
                  }
                });

                setErrorItems(Object.assign({}, errorItems, { [item.controlId]: error }, repeatControl));
                updateSource({
                  processVariables: processVariables.map(o => {
                    if (o.controlId === item.controlId) {
                      o.controlName = value;
                    }
                    return o;
                  }),
                });
              }}
            />
            {errorItems[item.controlId] && (
              <div className="parameterErrorMessage">
                {errorItems[item.controlId] === 1 ? _l('非法字符') : _l('参数名称不允许重复')}
                <i className="parameterErrorArrow" />
              </div>
            )}

            <Icon
              icon="task-new-delete"
              className="Font16 mLeft10 Gray_9e processConfigDel"
              onClick={() => {
                _.remove(processVariables, o => o.controlId === item.controlId);
                errorItems[item.controlId] = '';

                list.forEach((element, i) => {
                  if (!_.find(list, (o, j) => o.controlName === element.controlName && i !== j)) {
                    errorItems[element.controlId] = '';
                  }
                });

                setErrorItems(errorItems);
                updateSource({ processVariables });
              }}
            />
          </div>
        ))}

        <div className="mTop15">
          <span className="processConfigAdd" onClick={this.addVariables}>
            + {_l('新参数')}
          </span>
        </div>
      </div>
    );
  }
}
