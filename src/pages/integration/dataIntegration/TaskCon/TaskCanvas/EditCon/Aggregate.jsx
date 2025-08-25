import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
import DropChoose from 'src/pages/integration/components/DropChoose';
import DropOption from 'src/pages/integration/components/DropOption';
import {
  getAggData,
  getAggregateData,
  getDefaultAggregate,
  getTimeGroupDropData,
  isTimeTypes,
} from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/util.js';
import { WrapL } from './style';

export default function Aggregate(props) {
  const { onUpdate } = props;
  const [{ groupFields, info, showChangeName, aggregateFields, preFields, key, item, popupVisible }, setState] =
    useSetState({
      groupFields: [],
      aggregateFields: [],
      showChangeName: false,
      info: {},
      preFields: [],
      key: '',
      item: null,
      popupVisible: false,
    });
  useEffect(() => {
    const { list = [], node = {} } = props;
    const preNode = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)[0];
    const preFields = _.get(preNode, ['nodeConfig', 'fields'])
      .filter(o => o.isCheck)
      .map(o => {
        return { ...o, name: o.alias || o.name };
      });
    const { groupFields = [], aggregateFields = [] } = _.get(props.node, ['nodeConfig', 'config']) || {};
    // 汇总统计字段列表，数据结构大部分和fields一样，只新增了一个aggFuncType属性
    setState({
      groupFields: groupFields || [],
      aggregateFields: aggregateFields || [],
      preFields,
    });
  }, [props]);

  const setData = options => {
    onUpdate({
      ...props.node,
      nodeConfig: {
        ...(_.get(props.node, ['nodeConfig']) || {}),
        config: {
          ...(_.get(props.node, ['nodeConfig', 'config']) || {}),
          ...options,
        },
      },
    });
  };

  const getAggregate = (info, data) => {
    let { id, alias } = info;
    let num = data.filter(item => item.id === id && item.aggFuncType === info.aggFuncType).length;
    return { ...info, alias: num > 0 ? `${alias}_${num}` : alias };
  };
  return (
    <WrapL>
      <div className="title Bold">{_l('分类汇总')}</div>
      <div className="des mTop15 Gray_9e">{_l('对源数据进行分类和汇总统计运算后，作为新的数据进入本节点。')}</div>
      <div className="title mTop16">{_l('分类字段')}</div>
      <div className="groupCon">
        {groupFields.map((o, item) => {
          return (
            <span className="itemOp mTop12 flexRow alignItemsCenter">
              {!preFields.find(it => it.id === o.id) ? (
                <React.Fragment>
                  <span className="Red">{_l('字段已删除')}</span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <span className="Gray itemOpName overflow_ellipsis WordBreak InlineBlock" title={o.alias || o.name}>
                    {o.alias || o.name}
                  </span>
                  {!isTimeTypes(o) ? (
                    <i
                      className="icon icon-edit mLeft8 InlineBlock Hand"
                      onClick={() => {
                        setState({
                          info: o,
                          key: 'groupFields',
                          showChangeName: true,
                          item,
                        });
                      }}
                    />
                  ) : (
                    <DropOption
                      list={getTimeGroupDropData(o.jdbcTypeId)}
                      popupVisible={!o.aggFuncType || (popupVisible && item + 1 === groupFields.length)}
                      value={o.aggFuncType}
                      handleOpenChangeName={() => {
                        setState({
                          info: o,
                          key: 'groupFields',
                          showChangeName: true,
                          item,
                        });
                      }}
                      forGroup
                      handleChangeType={aggFuncType => {
                        setData({
                          groupFields: groupFields.map((a, i) => {
                            if (a.id === o.id && i === item) {
                              return getAggregate(
                                { ...a, alias: `${o.name}_${getAggData({ aggFuncType }).text}`, aggFuncType },
                                groupFields,
                              );
                            } else {
                              return a;
                            }
                          }),
                        });
                      }}
                    />
                  )}
                </React.Fragment>
              )}
              <i
                className="icon icon-clear_bold mLeft8 InlineBlock Hand"
                onClick={() => {
                  setData({ groupFields: groupFields.filter(a => a.id !== o.id) });
                }}
              />
            </span>
          );
        })}
        <DropChoose
          list={preFields.filter(o => !groupFields.find(it => it.id === o.id))}
          onChange={info => {
            const aggFuncType = isTimeTypes(info) ? getDefaultAggregate(info.jdbcTypeId) : null;
            setData({
              groupFields: groupFields.concat(
                getAggregate(
                  {
                    ...info,
                    alias: aggFuncType ? `${info.name}_${getAggData({ aggFuncType }).text}` : info.name,
                    aggFuncType,
                    groupBy: true,
                  },
                  groupFields,
                ),
              ),
            });
          }}
        />
      </div>
      <div className="title mTop16">{_l('汇总统计字段')}</div>
      <div className="groupCon">
        {aggregateFields.map((o, item) => {
          let str = getAggData(o).text;
          return (
            <span className="itemOp mTop12">
              {!preFields.find(it => it.id === o.id) && !o.isRowsCount ? (
                <React.Fragment>
                  <span className="Red">{_l('字段已删除')}</span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <span className="Gray itemOpName overflow_ellipsis WordBreak InlineBlock" title={o.alias || o.name}>
                    {o.alias || o.name}
                  </span>
                  <span className="Gray_bd">{str && `(${str})`}</span>
                  <DropOption
                    list={getAggregateData(o.jdbcTypeId, o.isRowsCount)}
                    popupVisible={!o.aggFuncType || (popupVisible && item + 1 === aggregateFields.length)}
                    value={o.aggFuncType}
                    handleOpenChangeName={() => {
                      setState({
                        info: o,
                        key: 'aggregateFields',
                        showChangeName: true,
                        item,
                      });
                    }}
                    handleChangeType={aggFuncType => {
                      setData({
                        aggregateFields: aggregateFields.map((a, i) => {
                          if (a.id === o.id && i === item) {
                            return getAggregate(
                              { ...a, alias: `${o.name}_${aggFuncType}`, aggFuncType },
                              aggregateFields,
                            );
                          } else {
                            return a;
                          }
                        }),
                      });
                    }}
                  />
                </React.Fragment>
              )}
              <i
                className="icon icon-clear_bold mLeft8 InlineBlock Hand"
                onClick={() => {
                  setData({
                    aggregateFields: aggregateFields.filter((a, i) => item !== i),
                  });
                }}
              />
            </span>
          );
        })}
        <DropChoose
          list={[{ name: '*', id: 'count', disabled: !!aggregateFields.find(o => o.isRowsCount) }, ...preFields]} //isRowsCount 只能添加一次
          onChange={info => {
            // 枚举值：SUM（求和）、MAX（最大值）、MIN（最小值）、AVG（平均值）、COUNT（计数）、DISTINCT_COUNT（去重计数）
            const list = getAggregateData(info.jdbcTypeId, info.id === 'count');
            if (info.id === 'count') {
              setData({
                aggregateFields: aggregateFields.concat({
                  ..._.omit(info, ['disabled']),
                  id: '',
                  name: 'rows_count',
                  alias: 'rows_count',
                  isRowsCount: true,
                  aggFuncType: list[0].value,
                }),
              });
            } else {
              setData({
                aggregateFields: aggregateFields.concat(
                  getAggregate(
                    {
                      ...info,
                      alias: `${info.name}_${list[0].value}`,
                      isRowsCount: false,
                      aggFuncType: list[0].value,
                    },
                    aggregateFields,
                  ),
                ),
              });
            }
            setState({
              popupVisible: true,
            });
          }}
        />
      </div>
      {showChangeName && !!key && (
        <ChangeName
          name={info.alias}
          title={
            (info.aggFuncType ? `${info.aggFuncType}(${info.isRowsCount ? '*' : info.alias})` : info.alias) +
            ' ' +
            _l('重命名为')
          }
          onCancel={() => {
            setState({
              showChangeName: false,
              info: {},
              key: '',
            });
          }}
          list={aggregateFields}
          deduplication={key === 'aggregateFields'}
          onChange={alias => {
            setData({
              [key]: (key === 'aggregateFields' ? aggregateFields : groupFields).map((a, i) => {
                if (a.id === info.id && i === item) {
                  return { ...a, alias };
                } else {
                  return a;
                }
              }),
            });
            setState({
              showChangeName: false,
              info: {},
              item: null,
              key: '',
            });
          }}
        />
      )}
    </WrapL>
  );
}
