import React, { Fragment } from 'react';
import { Dropdown, Checkbox, Textarea } from 'ming-ui';
import styled from 'styled-components';
import homeAppAjax from 'src/api/homeApp';
import { FIELD_TYPE_LIST } from '../../enum';

const ErrorTips = styled.div`
  position: absolute;
  bottom: 25px;
  transform: translateY(-7px);
  z-index: 1;
  left: 130px;
  border-radius: 3px;
  color: #fff;
  padding: 5px 12px;
  white-space: nowrap;
  background: #f44336;
  font-size: 12px;
  .errorArrow {
    position: absolute;
    transform: translateY(-5px);
    z-index: 1;
    left: 12px;
    background: transparent;
    border: 6px solid transparent;
    border-top-color: #f44336;
    bottom: -17px;
  }
`;

export default ({ data, updateSource, errorItems, setErrorItems }) => {
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
  const updateControls = (key, value, index) => {
    let controls = [].concat(data.controls);

    controls[index][key] = value;

    if (key === 'type') {
      controls[index].value = '';
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

  return (
    <Fragment>
      <div className="flowDetailStartHeader flexColumn BGBlueAsh">
        <div className="flowDetailStartIcon flexRow">
          <i className="icon-pbc Font40 gray" />
        </div>
        <div className="Font16 mTop10">{_l('封装业务流程')}</div>
      </div>
      <div className="workflowDetailBox mTop20">
        <div className="Font13 bold">{_l('输入参数')}</div>

        {data.controls.map((item, index) => {
          return (
            <Fragment key={index}>
              <div className="mTop15 flexRow alignItemsCenter relative">
                <Dropdown
                  className="flowDropdown mRight10"
                  style={{ width: 120 }}
                  data={FIELD_TYPE_LIST}
                  value={item.type}
                  border
                  disabled={!!item.controlId}
                  onChange={type => {
                    updateControls('type', type, index);
                  }}
                />
                <input
                  type="text"
                  className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
                  placeholder={_l('名称')}
                  value={item.controlName}
                  maxLength={64}
                  onChange={e => {
                    const value = e.target.value;

                    if (value) {
                      if (data.controls.filter((o, i) => value.trim() === o.controlName && i !== index).length === 1) {
                        errorItems[index] = 1;
                      } else {
                        errorItems[index] = '';
                      }
                    } else {
                      errorItems[index] = '';
                    }

                    updateControls('controlName', value, index);

                    data.controls.forEach((element, i) => {
                      if (
                        i !== index &&
                        !_.find(data.controls, (o, j) => o.controlName === element.controlName && i !== j)
                      ) {
                        errorItems[i] = '';
                      }
                    });

                    setErrorItems(errorItems);
                  }}
                  onBlur={e => updateControls('controlName', e.target.value.trim(), index)}
                />
                <Checkbox
                  className="InlineBlock Font12 TxtMiddle mLeft10 LineHeight20"
                  text={_l('必填')}
                  checked={item.required}
                  onClick={checked => updateControls('required', !checked, index)}
                />
                <i
                  className="icon-delete2 Font16 Gray_9e ThemeHoverColor3 mLeft10 pointer"
                  onClick={() => {
                    let controls = [].concat(data.controls);

                    _.remove(controls, (o, i) => i === index);
                    _.remove(errorItems, (o, i) => i === index);

                    controls.forEach((element, i) => {
                      if (!_.find(controls, (o, j) => o.controlName === element.controlName && i !== j)) {
                        errorItems[i] = '';
                      }
                    });

                    setErrorItems(errorItems);
                    updateSource({ controls });
                  }}
                />
                {errorItems[index] && (
                  <ErrorTips>
                    {_l('名称不允许重复')}
                    <i className="errorArrow" />
                  </ErrorTips>
                )}
              </div>
              <div className="mTop10 flexRow alignItemsCenter">
                <input
                  type="text"
                  className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
                  placeholder={_l('说明')}
                  value={item.desc}
                  onChange={evt => updateControls('desc', evt.target.value, index)}
                  onBlur={evt => updateControls('desc', evt.target.value.trim(), index)}
                />
              </div>
              {item.type === 10000003 && (
                <Textarea
                  className="mTop10"
                  maxHeight={250}
                  minHeight={0}
                  disabled={!!item.controlId}
                  style={{ paddingTop: 6, paddingBottom: 6 }}
                  placeholder={_l('数组结构（请给出一个范例）')}
                  value={item.value}
                  onChange={value => {
                    updateControls('value', value, index);
                  }}
                />
              )}
            </Fragment>
          );
        })}

        <div className="addActionBtn mTop25">
          <span
            className="ThemeBorderColor3"
            onClick={() => {
              const controls = [].concat(data.controls);

              controls.push({ type: 2, controlName: '', required: false, desc: '' });
              updateSource({ controls });
            }}
          >
            <i className="icon-add Font16" />
            {_l('添加参数')}
          </span>
        </div>

        <div className="Font13 bold mTop30">{_l('在本组织下，正在被以下事件调用')}</div>
        {!data.processList.length && (
          <div className="Font12 Gray_9e workflowDetailDesc mTop10 subProcessDesc">{_l('未被任何流程或按钮调用')}</div>
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
      </div>
    </Fragment>
  );
};
