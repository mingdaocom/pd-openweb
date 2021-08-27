import React, { Component } from 'react';
import { Icon, Dropdown } from 'ming-ui';
import './index.less';

export default class ProcessVariables extends Component {
  addVariables = () => {
    const { updateSource, processVariables } = this.props;

    updateSource({
      processVariables: processVariables.concat([{ type: 2, controlName: '', enumDefault: 0 }]),
    });
  };

  render() {
    const { updateSource, processVariables, setErrorItems } = this.props;
    let errorItems = [].concat(this.props.errorItems);
    const TYPES = [
      { text: _l('文本'), value: 2 },
      { text: _l('数值'), value: 6 },
      { text: _l('日期时间'), value: 16 },
      { text: _l('人员'), value: 26 },
      { text: _l('部门'), value: 27 },
    ];
    let newValues = [].concat(processVariables);

    return (
      <div className="workflowProcessVariables">
        <div className="flexRow">
          <div style={{ width: 120 }}>{_l('参数类型')}</div>
          <div className="flex mLeft15">{_l('参数名称')}</div>
        </div>

        {processVariables.map((item, index) => (
          <div key={index} className="flexRow mTop12 relative">
            <Dropdown
              style={{ width: 120 }}
              menuStyle={{ width: '100%' }}
              data={TYPES}
              value={item.type}
              disabled={!!item.controlId}
              border
              onChange={type => {
                newValues[index].type = type;
                newValues[index].enumDefault = _.includes([26, 27], type) ? 1 : 0;
                updateSource({ processVariables: newValues });
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
                newValues[index].controlName = value;

                if (value) {
                  if (!/^[a-zA-Z]{1}\w*$/.test(value)) {
                    errorItems[index] = 1;
                  } else if (processVariables.filter(o => value === o.controlName).length > 1) {
                    errorItems[index] = 2;
                  } else {
                    errorItems[index] = '';
                  }
                } else {
                  errorItems[index] = '';
                }

                setErrorItems(errorItems);
                updateSource({ processVariables: newValues });
              }}
            />
            {errorItems[index] && (
              <div className="parameterErrorMessage">
                {errorItems[index] === 1 ? _l('非法字符') : _l('参数名称不允许重复')}
                <i className="parameterErrorArrow" />
              </div>
            )}

            <Icon
              icon="task-new-delete"
              className="Font16 mLeft10 Gray_9e processConfigDel"
              onClick={() => {
                _.remove(newValues, (o, i) => i === index);
                _.remove(errorItems, (o, i) => i === index);

                setErrorItems(errorItems);
                updateSource({ processVariables: newValues });
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
