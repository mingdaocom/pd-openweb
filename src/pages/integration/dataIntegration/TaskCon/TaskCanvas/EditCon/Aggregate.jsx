import React, { useState, useEffect, useRef } from 'react';
import { WrapL } from './style';
import { useSetState } from 'react-use';
import DropOption from 'src/pages/integration/components/DropOption';
import DropChoose from 'src/pages/integration/components/DropChoose';
import { OPERATION_TYPE_DATA } from '../config';
import ChangeName from 'src/pages/integration/components/ChangeName.jsx';
export default function Aggregate(props) {
  const { onUpdate } = props;
  const [{ listGroup, info, showChangeName, listStatistics, fieldsSetting }, setState] = useSetState({
    listGroup: [],
    listStatistics: [],
    fieldsSetting: [],
    showChangeName: false,
    info: {},
  });
  useEffect(() => {
    const {
      fieldsSetting = [
        {
          id: '129',
          dependFieldIds: ['jl8964'],
          name: 'joan.lueilwitz',
          dataType: 'hbn2no',
          jdbcTypeId: 918,
          precision: 536,
          scale: 253,
          isPk: true,
          isNotNull: true,
          alias: 'j6w6uh',
          isCheck: true,
          orderNo: 666,
          status: 'NORMAL',
          defaultValue: 'dn2qx6',
          comment: 'hptmpx',
          aggFunc: 'MAX',
          deduplication: true,
          // groupBy: true,
        },
      ],
    } = _.get(props.node, ['nodeConfig', 'config']) || {};
    const {
      fields = [
        {
          id: '129',
          dependFieldIds: ['jl8964'],
          name: 'joan.lueilwitz',
          dataType: 'hbn2no',
          jdbcTypeId: 918,
          precision: 536,
          scale: 253,
          isPk: true,
          isNotNull: true,
          alias: 'j6w6uh',
          isCheck: true,
          orderNo: 666,
          status: 'NORMAL',
          defaultValue: 'dn2qx6',
          comment: 'hptmpx',
          aggFunc: 'SUM',
          deduplication: true,
          groupBy: true,
        },
        {
          id: '129sd',
          dependFieldIds: ['jl8964'],
          name: 'joan.lueilwitz',
          dataType: 'hbn2no',
          jdbcTypeId: 918,
          precision: 536,
          scale: 253,
          isPk: true,
          isNotNull: true,
          alias: 'j6w6uh',
          isCheck: true,
          orderNo: 666,
          status: 'NORMAL',
          defaultValue: 'dn2qx6',
          comment: 'hptmpx',
          aggFunc: 'SUM',
          deduplication: true,
          groupBy: false,
        },
      ],
    } = _.get(props.node, ['nodeConfig']) || {};

    setState({
      fieldsSetting,
      listGroup: fields.filter(o => o.groupBy),
      listStatistics: fields.filter(o => !o.groupBy),
    });
  }, [props.node]);

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

  return (
    <WrapL>
      <div className="title Bold">{_l('分类汇总')}</div>
      <div className="des mTop15 Gray_9e">{_l('对源数据进行分类和汇总统计运算后，作为新的数据进入本节点。')}</div>
      <div className="title mTop16">{_l('分类字段')}</div>
      <div className="groupCon">
        {fieldsSetting
          .filter(o => o.groupBy)
          .map(o => {
            return (
              <span className="itemOp mTop12">
                <span className="Gray">{o.name}</span>
                <DropOption
                  list={listGroup}
                  handleOpenChangeName={() => {
                    setState({
                      info: o,
                      showChangeName: true,
                    });
                  }}
                />
                <i
                  className="icon icon-clear_bold mLeft8 InlineBlock"
                  onClick={() => {
                    setData({ fieldsSetting: fieldsSetting.filter(a => a.id !== o.id) });
                  }}
                />
              </span>
            );
          })}
        <DropChoose
          list={listGroup.filter(
            a =>
              !fieldsSetting
                .filter(o => o.groupBy)
                .map(o => o.id)
                .includes(a.id),
          )}
          onChange={info => {
            setData({ fieldsSetting: fieldsSetting.concat({ ...info, aggFunc: 'SUM' }) });
          }}
        />
      </div>
      <div className="title mTop16">{_l('汇总统计字段')}</div>
      <div className="groupCon">
        {fieldsSetting
          .filter(o => !o.groupBy)
          .map(o => {
            return (
              <span className="itemOp mTop12">
                <span className="Gray">{o.name}</span>
                <span className="Gray_bd">({OPERATION_TYPE_DATA.find(a => a.value === o.aggFunc).text})</span>
                <DropOption
                  list={listStatistics}
                  showAction={true}
                  handleOpenChangeName={() => {
                    setState({
                      info: o,
                      showChangeName: true,
                    });
                  }}
                  handleChangeType={aggFunc => {
                    setData({
                      fieldsSetting: fieldsSetting.map(a => {
                        if (a.id === o.id) {
                          return { ...a, aggFunc };
                        } else {
                          return a;
                        }
                      }),
                    });
                  }}
                />
                <i
                  className="icon icon-clear_bold mLeft8 InlineBlock"
                  onClick={() => {
                    setData({
                      fieldsSetting: fieldsSetting.filter(a => a.id !== o.id),
                    });
                  }}
                />
              </span>
            );
          })}
        <DropChoose
          list={listStatistics.filter(
            a =>
              !fieldsSetting
                .filter(o => !o.groupBy)
                .map(o => o.id)
                .includes(a.id),
          )}
          onChange={info => {
            setData({
              fieldsSetting: fieldsSetting.concat({ ...info, aggFunc: 'SUM' }),
            });
          }}
        />
      </div>
      {showChangeName && info.id && (
        <ChangeName
          name={info.name}
          onCancel={() => {
            setState({
              showChangeName: false,
              info: {},
            });
          }}
          onChange={name => {
            setData({
              fieldsSetting: fieldsSetting.map(a => {
                if (a.id === o.id) {
                  return { ...a, name };
                } else {
                  return a;
                }
              }),
            });
            setState({
              showChangeName: false,
              info: {},
            });
          }}
        />
      )}
    </WrapL>
  );
}
