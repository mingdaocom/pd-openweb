import React, { useState, Fragment } from 'react';
import { Count } from './Count';
import { Collapse, Checkbox, Input, Switch } from 'antd';
import { isNumberControl } from 'statistics/common';

export default function allCountPanelGenerator(props) {
  const { key, title, yaxisList, summary, currentReport, changeCurrentReport, ...collapseProps } = props;
  const { displaySetup } = currentReport;
  const { controlList = [] } = summary;
  const totalSwitch = summary.all && controlList.length === yaxisList.length;
  return (
    <Collapse.Panel
      key={key}
      header={title}
      {...collapseProps}
      extra={
        <Switch
          size="small"
          checked={totalSwitch}
          onClick={(checked, event) => {
            event.stopPropagation();
          }}
          onChange={checked => {
            changeCurrentReport(
              {
                displaySetup: {
                  ...displaySetup,
                  showTotal: checked
                },
                summary: {
                  ...summary,
                  all: checked,
                  controlList: checked ? yaxisList.map(data => {
                    return {
                      controlId: data.controlId,
                      name: '',
                      sum: 0,
                      type: 1
                    }
                  }) : []
                },
              },
              true,
            );
          }}
        />
      }
    >
      <Fragment>
        <div className="mBottom16">
          <Checkbox
            className="mBottom10"
            checked={summary.all}
            onChange={(event) => {
              const data = {
                displaySetup: {
                  ...displaySetup,
                  showTotal: event.target.checked || controlList.length ? true : false
                },
                summary: {
                  ...summary,
                  all: event.target.checked,
                }
              }
              changeCurrentReport(data, true);
            }}
          >
            {_l('全部')}
            {` (${_l('求和')})`}
          </Checkbox>
          <div className="mBottom8">{_l('提示')}</div>
          <Input
            defaultValue={summary.name || _l('总计')}
            className="chartInput w100"
            onChange={event => {
              changeCurrentReport({
                summary: {
                  ...summary,
                  name: event.target.value.slice(0, 20),
                }
              }, false);
            }}
          />
        </div>
        {yaxisList.filter(item => isNumberControl(item.controlType) ? true : item.normType !== 7).map(item => {
          const summaryItem = _.find(controlList, { controlId: item.controlId }) || { type: 1 };
          return (
            <Count
              key={item.controlId}
              yAxis={item}
              isPivotTable={true}
              extra={
                <Checkbox
                  className="mLeft0 mBottom15"
                  checked={!!_.find(controlList, { controlId: item.controlId })}
                  onChange={(event) => {
                    const id = item.controlId;
                    if (event.target.checked) {
                      const data = {
                        controlId: id,
                        name: '',
                        sum: 0,
                        type: 1
                      }
                      const result = {
                        summary: {
                          ...summary,
                          controlList: controlList.concat(data)
                        },
                        displaySetup: {
                          ...displaySetup,
                          showTotal: true
                        }
                      }
                      changeCurrentReport(result, true);
                    } else {
                      const newControlList = controlList.filter(item => item.controlId !== id);
                      changeCurrentReport({
                        displaySetup: {
                          ...displaySetup,
                          showTotal: newControlList.length || summary.all ? true : false
                        },
                        summary: {
                          ...summary,
                          controlList: newControlList
                        }
                      }, true);
                    }
                  }}
                >
                  {item.controlName}
                </Checkbox>
              }
              summary={summaryItem}
              onChangeSummary={(data, isRequest = true) => {
                const id = item.controlId;
                const newControlList = controlList.map(item => {
                  if (id === item.controlId) {
                    return {
                      ...item,
                      ...data
                    }
                  } else {
                    return item;
                  }
                });
                changeCurrentReport({
                  summary: {
                    ...summary,
                    controlList: newControlList
                  }
                }, isRequest);
              }}
            />
          );
        })}
      </Fragment>
    </Collapse.Panel>
  );
}
