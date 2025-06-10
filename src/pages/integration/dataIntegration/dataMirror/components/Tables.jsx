import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dropdown, Icon, Input, LoadDiv, Tooltip } from 'ming-ui';
import dataMirrorAjax from 'src/pages/integration/api/dw.js';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { emitter } from 'src/utils/common';

const WrapPopup = styled.div`
  width: 620px;
  background: #ffffff;
  box-shadow: 0px 2px 9px 1px rgba(0, 0, 0, 0.25);
  border-radius: 5px 5px 5px 5px;
  padding: 18px;
  .controlCon {
    max-height: 200px;
    overflow: auto;
  }
  .controlL {
    line-height: 36px;
    & > div {
      flex-shrink: 0;
      min-width: 0;
    }
  }
  .isChild .wsFieldName {
    padding-left: 20px;
    position: relative;
    &::before {
      z-index: 1;
      content: ' ';
      width: 0px;
      height: 36px;
      border-left: 1px solid #707070;
      position: absolute;
      left: 7px;
      top: 0;
    }
    &.isLast {
      &::before {
        height: 18px;
      }
    }
    &::after {
      content: ' ';
      width: 10px;
      height: 0;
      border-top: 1px dashed #707070;
      position: absolute;
      top: 50%;
      left: 10px;
    }
  }
  .headerCon {
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 5px;
  }
  .option {
    max-width: 130px;
  }
  .destTable {
    min-width: 270px !important;
    max-width: 270px !important;
    width: 270px !important;
  }
`;
const ListBox = styled.div`
  .dataItem {
    flex-shrink: 0;
    min-width: 0;
    align-items: center;
    margin: 0;
    padding: 12px 0;
    .titleText,
    .taskNum {
      font-size: 14px;
      font-weight: 700;
    }
    &:hover {
      background: rgba(247, 247, 247, 1);
      .titleText {
        color: #2196f3;
      }
    }
  }
  .optionTxt {
    color: #2196f3;
    &:hover {
      color: #1565c0;
    }
  }
`;
const Wrap = styled.div`
  min-height: 200px;
  .option {
    max-width: 50px;
  }
  .flexShrink0 {
    flex-shrink: 0;
    min-width: 0;
  }
  .w100px {
    width: 100px;
    max-width: 100px;
  }
  .w200 {
    width: 200px;
  }
  .warn {
    color: #ffbb00;
  }
  .headerCon {
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 10px;
  }
`;
const dateArr = [
  {
    value: 'wsId',
    text: _l('工作表ID'),
  },
  {
    value: 'wsName',
    text: _l('工作表名称'),
  },
  {
    value: 'alias',
    text: _l('工作表别名'),
  },
];
function Controls(props) {
  const { item, dest } = props;
  const [{ data, loading }, setState] = useSetState({
    data: [],
    loading: true,
  });
  useEffect(() => {
    getControls();
  }, []);
  const getControls = () => {
    dataMirrorAjax
      .getFieldsInfo({
        wsId: item.worksheetId,
        dataSourceId: dest.dataDestId,
      })
      .then(res => {
        const { data } = res;
        setState({
          data: safeParse(data, 'array'),
          loading: false,
        });
      });
  };
  const renderPopup = data => {
    const columnPopup = [
      {
        dataIndex: 'sourceTable',
        title: _l('工作表'),
        render: (item, isLast) => {
          return (
            <div className="flexRow alignItemsCenter w100">
              <span title={item.wsFieldName} className={cx('titleText overflow_ellipsis wsFieldName', { isLast })}>
                <Icon icon={getIconByType(item.wsControlType)} className="mRight3 Font16 Gray_75" />
                {item.wsFieldName}
              </span>
              {item.description && (
                <Tooltip text={item.description} placement="topRight">
                  <Icon icon="info" className="Gray_9e mLeft4 pointer" />
                </Tooltip>
              )}
            </div>
          );
        },
      },
      {
        dataIndex: 'destTable',
        title: _l('数据库表'),
        render: item => {
          return (
            <div className="flexRow alignItemsCenter">
              <span title={item.tableFieldName} className="titleText overflow_ellipsis">
                {item.tableFieldName}
              </span>
            </div>
          );
        },
      },
      {
        dataIndex: 'option',
        title: _l('类型'),
        render: item => {
          return (
            <div className="flexRow alignItemsCenter">
              <span title={item.FieldType} className="titleText overflow_ellipsis">
                {item.FieldType}
              </span>
            </div>
          );
        },
      },
    ];

    const renderChild = (sourceItem, isLast) => {
      return (
        <div className="flexRow alignItemsCenter w100 isChild controlL">
          {columnPopup.map((item, j) => {
            return (
              <div className={cx(`${item.dataIndex} flex flexShrink0`)}>
                {item.render ? item.render(sourceItem, isLast) : sourceItem[item.dataIndex]}
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <WrapPopup>
        {loading ? (
          <LoadDiv />
        ) : (
          <div className="flexColumn h100">
            <div className="flexRow headerCon">
              {columnPopup.map((o, index) => {
                return (
                  <div
                    key={index}
                    className={cx(`${o.dataIndex} flex flexShrink0`, {
                      w100px: index === 0,
                    })}
                  >
                    {o.renderTitle ? o.renderTitle() : o.title}
                  </div>
                );
              })}
            </div>
            <div className="flex flexShrink0 controlCon">
              <ListBox className="">
                {(data || []).map((sourceItem, i) => {
                  return (
                    <React.Fragment>
                      <div key={i} className="flexRow alignItemsCenter w100 controlL">
                        {columnPopup.map((item, j) => {
                          return (
                            <div
                              key={`${i}-${j}_WrapPopup`}
                              className={cx(`${item.dataIndex} flex flexShrink0`, { w100px: j === 0 })}
                            >
                              {item.render ? item.render(sourceItem) : sourceItem[item.dataIndex]}
                            </div>
                          );
                        })}
                      </div>
                      {(_.get(sourceItem, 'children') || []).map((o, num) => {
                        return renderChild(o, num + 1 >= (_.get(sourceItem, 'children') || []).length);
                      })}
                    </React.Fragment>
                  );
                })}
              </ListBox>
            </div>
          </div>
        )}
      </WrapPopup>
    );
  };
  return (
    <Trigger
      action={['click']}
      popupClassName="moreOption"
      getPopupContainer={() => document.body}
      // popupVisible={visibleId === item.value}
      // onPopupVisibleChange={visible => setState({ visibleId: visible ? item.value : '' })}
      popupAlign={{
        points: ['tr', 'bl'],
        offset: [25, 5],
        overflow: { adjustX: true, adjustY: true },
      }}
      popup={() => renderPopup(data)}
    >
      <span className="Font13 optionTxt Hand">{_l('预览')}</span>
    </Trigger>
  );
}
export default function Tables(props) {
  const cache = useRef({});
  const { dest, worksheetInfos = [], onChange } = props;
  const [{ dropType, showInput, doubleWriteTables, loading }, setState] = useSetState({
    dropType: 'wsId',
    showInput: '',
    doubleWriteTables: props.doubleWriteTables || [],
    loading: true,
  });
  cache.current.doubleWriteTables = props.doubleWriteTables || [];
  useEffect(() => {
    checkTableExists();
  }, []);

  useEffect(() => {
    emitter.addListener('CHECK_TABLE_EXISTS', onCheckBeforeCreate);
    return () => {
      emitter.removeListener('CHECK_TABLE_EXISTS', onCheckBeforeCreate);
    };
  }, []);

  const onCheckBeforeCreate = () => {
    checkTableExists(cache.current.doubleWriteTables, true);
  };

  const checkTableExists = (data, nextCreate) => {
    const tableNames = (data || doubleWriteTables).map(o => o.tableName);
    onChange(null, false, true);
    dataMirrorAjax
      .checkTableExists({
        tableNames: tableNames,
        dataSourceId: dest.dataDestId,
        dbName: dest.db,
        projectId: props.projectId,
        schemaName: dest.schemaName,
      })
      .then(res => {
        let hasErr = false;
        const list = (data || doubleWriteTables).map((o, i) => {
          if (res.data[o.tableName]) {
            hasErr = true;
          }
          return { ...o, isErr: res.data[o.tableName] };
        });
        setState({
          loading: false,
          doubleWriteTables: list,
        });
        cache.current.doubleWriteTables = list;
        onChange(list, nextCreate && !hasErr);
        if (nextCreate && hasErr) {
          alert(_l('数据库表名存在相同'), 3);
        }
      });
  };

  const columns = [
    {
      dataIndex: 'sourceTable',
      title: _l('工作表'),
      render: item => {
        const name = worksheetInfos.find(o => item.worksheetId === o.value).label;
        return (
          <div className="flexRow alignItemsCenter">
            <span title={name} className="overflow_ellipsis">
              {name}
            </span>
          </div>
        );
      },
    },
    {
      dataIndex: 'id',
      title: 'ID',
      render: item => {
        return (
          <div className="flexRow alignItemsCenter">
            <span title={item.worksheetId} className="overflow_ellipsis">
              {item.worksheetId}
            </span>
          </div>
        );
      },
    },
    {
      dataIndex: 'destTable',
      title: _l('数据库表'),
      renderTitle: () => {
        return (
          <div className="flexRow alignItemsCenter pointer">
            <span className="flex flexShrink0">{_l('数据库表')}</span>
            <Dropdown
              className="timeDrop mLeft20 mRight10"
              menuStyle={{ width: '150px', right: 0, left: 'initial' }}
              data={dateArr}
              value={dropType}
              renderTitle={() => (
                <span className="Gray_75 bold TxtTop">
                  {_l('使用')}
                  {dateArr.find(o => o.value === dropType).text}
                </span>
              )}
              onChange={dropType => {
                const data = doubleWriteTables.map(o => {
                  return { ...o, tableName: dropType === 'wsId' ? `ws_${o[dropType]}` : o[dropType] };
                });
                setState({
                  dropType: dropType,
                  doubleWriteTables: data,
                });
                onChange(data);
                if (data.filter(o => !o.tableName.trim()).length > 0) {
                  return alert(_l('数据库表名不能为空'), 3);
                }
                if (data.filter(o => data.filter(a => a.tableName === o.tableName).length > 1).length > 0) {
                  return alert(_l('数据库表名存在相同'), 3);
                }
                checkTableExists(data);
              }}
            />
          </div>
        );
      },
      render: item => {
        return (
          <div className="flexRow alignItemsCenter mRight10">
            {showInput === item.worksheetId ? (
              <Input
                autoFocus
                className="flex flexShrink0"
                defaultValue={item.tableName}
                onBlur={event => {
                  const value = event.target.value.trim();
                  if (!value) {
                    setState({
                      showInput: '',
                      doubleWriteTables: doubleWriteTables,
                    });
                    return alert(_l('数据库表名不能为空'), 3);
                  }
                  if (value === item.tableName) {
                    setState({
                      showInput: '',
                    });
                    return;
                  }
                  if (doubleWriteTables.filter(o => o.tableName === value).length >= 1) {
                    setState({
                      showInput: '',
                      doubleWriteTables: doubleWriteTables,
                    });
                    return alert(_l('存在相同，请重新修改'), 3);
                  }
                  let data = doubleWriteTables.map(o =>
                    o.worksheetId === showInput ? { ...o, tableName: value, isErr: false } : o,
                  );
                  setState({
                    showInput: '',
                    doubleWriteTables: data,
                  });
                  checkTableExists(data);
                }}
              />
            ) : (
              <React.Fragment>
                {item.isErr && (
                  <Tooltip text={_l('表已存在')}>
                    <Icon icon="info1" className="Font18 mRight3 warn" />
                  </Tooltip>
                )}
                <span className={cx('title ellipsis mRight3', item.isErr ? 'Gray_bd' : 'Gray')}>{item.tableName}</span>
                <Icon
                  icon="edit"
                  className={cx('Font18 Gray_75 mLeft5 ThemeHoverColor3 Hand')}
                  onClick={() => {
                    setState({
                      showInput: item.worksheetId,
                    });
                  }}
                />
              </React.Fragment>
            )}
          </div>
        );
      },
    },
    {
      dataIndex: 'option',
      title: '',
      render: item => {
        return <Controls item={item} dest={dest} />;
      },
    },
  ];
  if (loading) {
    return <LoadDiv />;
  }
  return (
    <Wrap>
      <div className="flexColumn h100">
        <div className="">{_l('即将在数据库中创建表，“数据库表”列将用作表名。')}</div>
        <div className="flexRow alignItemsCenter headerCon mTop20">
          {columns.map((o, index) => {
            return (
              <div key={index} className={cx(`${o.dataIndex} flex flexShrink0`, { w100px: index === 0 })}>
                {o.renderTitle ? o.renderTitle() : o.title}
              </div>
            );
          })}
        </div>
        <div className="flex flexShrink0">
          <ListBox className="">
            {(doubleWriteTables || []).map((sourceItem, i) => {
              return (
                <div key={i} className="dataItem flexRow alignItemsCenter w100">
                  {columns.map((item, index) => {
                    return (
                      <div
                        key={`${i}-${index}`}
                        className={cx(`${item.dataIndex} flex flexShrink0`, { w100px: index === 0 })}
                      >
                        {item.render ? item.render(sourceItem) : sourceItem[item.dataIndex]}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </ListBox>
        </div>
      </div>
    </Wrap>
  );
}
