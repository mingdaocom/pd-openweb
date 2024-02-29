import React, { useState, Fragment } from 'react';
import cx from 'classnames';
import { Count, Location } from './Count';
import PreinstallStyle from './PreinstallStyle';
import TitleStyle from './TitleStyle';
import SubLineCount from './SubLineCount';
import { Collapse, Checkbox, Input, Switch } from 'antd';
import { isNumberControl } from 'statistics/common';

export default function pivotTableCountPanelGenerator(props) {
  const { currentReport, onChangeStyle, changeCurrentReport, themeColor, customPageConfig, ...collapseProps } = props;
  const { style, pivotTable = {} } = currentReport;

  const handleChangeLineSummary = (data, isRequest = true) => {
    changeCurrentReport(
      {
        pivotTable: {
          ...pivotTable,
          lineSummary: {
            ...pivotTable.lineSummary,
            ...data,
          },
        },
      },
      isRequest
    );
  }

  const handleChangeColumnSummary = (data, isRequest = true) => {
    changeCurrentReport(
      {
        pivotTable: {
          ...pivotTable,
          columnSummary: {
            ...pivotTable.columnSummary,
            ...data,
          },
        },
      },
      isRequest
    );
  }

  const renderPreinstallStyle = () => {
    return (
      <Collapse.Panel
        key="preinstallStyle"
        header={_l('表')}
        {...collapseProps}
      >
        <PreinstallStyle
          style={style}
          customPageConfig={customPageConfig}
          onChangeStyle={onChangeStyle}
        />
      </Collapse.Panel>
    );
  }

  const renderCell = () => {
    return (
      <Collapse.Panel
        key="cell"
        header={_l('单元格')}
        {...collapseProps}
      >
        <TitleStyle
          type="cell"
          style={style}
          themeColor={themeColor}
          customPageConfig={customPageConfig}
          onChangeStyle={onChangeStyle}
        />
      </Collapse.Panel>
    );
  }

  const renderLineTitleStyle = () => {
    return (
      <Collapse.Panel
        key="lineTitleStyle"
        header={_l('行标题')}
        {...collapseProps}
      >
        <TitleStyle
          type="line"
          style={style}
          pivotTable={pivotTable}
          themeColor={themeColor}
          customPageConfig={customPageConfig}
          onChangeStyle={onChangeStyle}
        />
      </Collapse.Panel>
    );
  }

  const renderColumnTitleStyle = () => {
    return (
      <Collapse.Panel
        key="columnTitleStyle"
        header={_l('列标题')}
        {...collapseProps}
      >
        <TitleStyle
          type="column"
          style={style}
          themeColor={themeColor}
          customPageConfig={customPageConfig}
          onChangeStyle={onChangeStyle}
        />
      </Collapse.Panel>
    );
  }

  const renderSubLineCount = () => {
    const { lines } = pivotTable;
    const switchChecked = !!lines.slice(1, lines.length).filter(n => n.subTotal).length;

    if (lines.length <= 1) {
      return null;
    }

    return (
      <Collapse.Panel
        key="subLineCount"
        header={_l('行小计')}
        className={cx({ collapsible: !switchChecked })}
        {...collapseProps}
        extra={
          <Switch
            size="small"
            checked={switchChecked}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              changeCurrentReport(
                {
                  pivotTable: {
                    ...currentReport.pivotTable,
                    lines: lines.map((n, index) => {
                      if (index) {
                        return {
                          ...n,
                          subTotal: checked
                        }
                      } else {
                        return n;
                      }
                    })
                  },
                },
                true,
              );
            }}
          />
        }
      >
        <SubLineCount
          currentReport={currentReport}
          onChangeCurrentReport={changeCurrentReport}
        />
      </Collapse.Panel>
    );
  }

  const renderPivotTableLineCount = () => {
    const { reportType, displaySetup, yaxisList } = currentReport;
    const { showLineTotal, lineSummary = {} } = pivotTable;
    const { controlList = [], rename } = lineSummary;
    return (
      <Collapse.Panel
        key="lineCount"
        header={_l('行总计')}
        className={cx({ collapsible: !showLineTotal })}
        {...collapseProps}
        extra={
          <Switch
            size="small"
            checked={showLineTotal}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              changeCurrentReport(
                {
                  pivotTable: {
                    ...pivotTable,
                    showLineTotal: checked
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
            <div className="mBottom8">{_l('名称')}</div>
            <Input
              defaultValue={rename || _l('行汇总')}
              className="chartInput w100"
              onChange={event => {
                handleChangeLineSummary(
                  {
                    rename: event.target.value.slice(0, 20),
                  },
                  false,
                );
              }}
            />
          </div>
          <Location
            summary={lineSummary}
            locationType="line"
            onChangeSummary={handleChangeLineSummary}
          />
          {yaxisList.filter(item => isNumberControl(item.controlType) ? true : item.normType !== 7).map(item => (
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
                      changeCurrentReport(
                        {
                          pivotTable: {
                            ...pivotTable,
                            lineSummary: {
                              ...lineSummary,
                              controlList: controlList.concat(data)
                            }
                          },
                        },
                        true,
                      );
                    } else {
                      changeCurrentReport(
                        {
                          pivotTable: {
                            ...pivotTable,
                            lineSummary: {
                              ...lineSummary,
                              controlList: controlList.filter(item => item.controlId !== id)
                            }
                          },
                        },
                        true,
                      );
                    }
                  }}
                >
                  {item.controlName}
                </Checkbox>
              }
              summary={_.find(controlList, { controlId: item.controlId }) || { type: 1 }}
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
                changeCurrentReport(
                  {
                    pivotTable: {
                      ...pivotTable,
                      lineSummary: {
                        ...lineSummary,
                        controlList: newControlList
                      }
                    },
                  },
                  isRequest,
                );
              }}
            />
          ))}
        </Fragment>
      </Collapse.Panel>
    );
  }

  const renderPivotTableColumnCount = () => {
    const { reportType, displaySetup, yaxisList } = currentReport;
    const { showColumnTotal, columnSummary = {} } = pivotTable;
    const { controlList = [], rename } = columnSummary;
    const onChangeCountVisible = (id, checked, data) => {
      if (checked) {
        const control = {
          controlId: id,
          name: '',
          sum: 0,
          type: 1,
          ...data
        }
        changeCurrentReport(
          {
            pivotTable: {
              ...pivotTable,
              columnSummary: {
                ...columnSummary,
                controlList: controlList.concat(control)
              }
            },
          },
          true,
        );
      } else {
        this.props.changeCurrentReport(
          {
            pivotTable: {
              ...pivotTable,
              columnSummary: {
                ...columnSummary,
                controlList: controlList.filter(item => item.controlId !== id)
              }
            },
          },
          true,
        );
      }
    }
    const onChangeSummary = (id, data, isRequest = true) => {
      const newControlList = controlList.map(item => {
        if (id === item.controlId) {
          return {
            ...item,
            ...data
          }
        } else {
          return item;
        }
      }).filter(item => item.number || item.percent);
      changeCurrentReport(
        {
          pivotTable: {
            ...pivotTable,
            columnSummary: {
              ...columnSummary,
              controlList: newControlList
            }
          },
        },
        isRequest,
      );
    }
    const renderExtra = (item) => {
      const control = _.find(controlList, { controlId: item.controlId });
      return (
        <Fragment>
          <div className="mBottom5 bold">{item.controlName}</div>
          <div className="flexRow valignWrapper mBottom15">
            <Checkbox
              className="flex"
              checked={control ? control.number : false}
              onChange={(event) => {
                const { checked } = event.target;
                const id = item.controlId;
                if (control) {
                  onChangeSummary(id, { number: checked });
                } else {
                  onChangeCountVisible(id, checked, checked ? { number: true, percent: false } : undefined);
                }
              }}
            >
              {_l('数值')}
            </Checkbox>
            <Checkbox
              className="flex"
              checked={control ? control.percent : false}
              onChange={(event) => {
                const { checked } = event.target;
                const id = item.controlId;
                if (control) {
                  onChangeSummary(id, { percent: checked });
                } else {
                  onChangeCountVisible(id, checked, checked ? { number: false, percent: true } : undefined);
                }
              }}
            >
              {_l('百分比')}
            </Checkbox>
          </div>
        </Fragment>
      );
    }
    return (
      <Collapse.Panel
        key="columnCount"
        header={_l('列总计')}
        className={cx({ collapsible: !showColumnTotal })}
        extra={
          <Switch
            size="small"
            checked={showColumnTotal}
            onClick={(checked, event) => {
              event.stopPropagation();
            }}
            onChange={checked => {
              changeCurrentReport(
                {
                  pivotTable: {
                    ...pivotTable,
                    showColumnTotal: checked
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
            <div className="mBottom8">{_l('名称')}</div>
            <Input
              defaultValue={rename || _l('列汇总')}
              className="chartInput w100"
              onChange={event => {
                handleChangeColumnSummary(
                  {
                    rename: event.target.value.slice(0, 20),
                  },
                  false,
                );
              }}
            />
          </div>
          <Location
            summary={columnSummary}
            locationType="column"
            onChangeSummary={handleChangeColumnSummary}
          />
          {yaxisList.filter(item => isNumberControl(item.controlType) ? true : item.normType !== 7).map(item => (
            <Count
              key={item.controlId}
              yAxis={item}
              isPivotTable={true}
              extra={renderExtra(item)}
              summary={_.find(controlList, { controlId: item.controlId }) || { type: 1 }}
              onChangeSummary={(data, isRequest) => {
                onChangeSummary(item.controlId, data, isRequest);
              }}
            />
          ))}
        </Fragment>
      </Collapse.Panel>
    );
  }

  return (
    <Fragment>
      {renderPreinstallStyle()}
      {renderCell()}
      {renderLineTitleStyle()}
      {renderColumnTitleStyle()}
      {renderSubLineCount()}
      {renderPivotTableLineCount()}
      {renderPivotTableColumnCount()}
    </Fragment>
  );
}
