import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, Icon } from 'ming-ui';
import { WIDGETS_TO_API_TYPE_ENUM_N } from 'src/pages/Role/PortalCon/setting/InfoSet/config.js';
import { getIconByType } from 'src/pages/widgetConfig/util';

const typeList = _.keys(WIDGETS_TO_API_TYPE_ENUM_N);
const Wrap = styled.div`
  .List {
    h6 {
    }
    .listLiHeader {
      color: #9e9e9e;
      font-size: 12px;
    }
    .listLi {
      display: flex;
    }
    .columnTxt {
      flex: 1;
      height: 36px;
      background: #f8f8f8;
      border-radius: 3px;
    }
    .iconBox {
      padding: 0;
      width: 10%;
      text-align: center;
    }
    .Dropdown {
      flex: 1;
      max-width: 45%;
    }
    .Dropdown--input {
      display: flex;
      line-height: 36px;
      padding: 0 10px !important;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 3px;
      .value,
      .Dropdown--placeholder {
        flex: 1;
      }
      i {
        &::before {
          line-height: 36px;
        }
      }
    }
  }
`;

export default function ReviewFreeMap(props) {
  const { onChange } = props;
  const [cellConfigs, setCellConfigs] = useState([]); //免审名单
  const [cells, setCells] = useState([]); //免审文件内容信息
  const [controls, setControls] = useState([]);
  const [query, setQuery] = useState({});

  useEffect(() => {
    setQuery(props.query || {});
    getData();
  }, []);

  useEffect(() => {
    getData();
    setQuery(props.query || {});
  }, [props.type, props.cell, props.query, props.controls, _.get(props, ['query', 'configs'])]);

  const getData = () => {
    if (props.type === 1) {
      const { templates = {} } = props.query || {} || {};
      const { controls = [] } = templates;
      setCells(
        controls.filter(item => !['rowid', 'wfname'].includes(item.controlId) && typeList.includes(item.type + '')),
      );
    } else {
      const { cell = {} } = props;
      setCells(cell.cells);
      setCellConfigs(cell.cellConfigs || []);
    }
    setControls(props.controls);
  };

  if (cells.length <= 0) {
    return '';
  }

  return (
    <Wrap>
      <div className="List mTop32">
        <h6 className="Font13">{_l('配置免审映射字段')}</h6>
        <div className="listLiHeader mTop12"></div>
        {controls
          .filter(o => o.type !== 29)
          .map((o, i) => {
            return (
              <div className="listLi mBottom6" key={i}>
                <span className="columnTxt InlineBlock LineHeight36">
                  <Icon className="Font18 TxtMiddle Gray_9e mLeft15 mRight8" icon={getIconByType(o.type, false)} />
                  {o.controlName}
                </span>
                <span className="iconBox InlineBlock TxtBottom LineHeight36">
                  <Icon className="Font18 ThemeColor3" type="arrow_forward" />
                </span>
                <Dropdown
                  key={o.controlId + '_Dropdown_' + props.type}
                  isAppendToBody
                  data={
                    props.type === 1
                      ? cells
                          .filter(a => {
                            if ([9, 10, 11].includes(a.type) && [9, 10, 11].includes(o.type)) {
                              return a;
                            }
                            if ([15, 16].includes(a.type) && [15, 16].includes(o.type)) {
                              return a;
                            }
                            if (a.type === o.type) return a;
                          }) //必须类型相同
                          .map(item => {
                            return {
                              ...item,
                              value: item.controlId,
                              text: item.controlName,
                              disabled: !!(_.get(query, ['configs']) || []).find(
                                o => o.subCid === item.controlId && controls.map(it => it.controlId).includes(o.cid),
                              ),
                            };
                          })
                      : cells.map(item => {
                          return {
                            ...item,
                            value: item.columnNum,
                            text: item.columnName,
                            disabled: cellConfigs.map(o => o.columnNum).includes(item.columnNum),
                          };
                        })
                  }
                  placeholder={_l('请选择')}
                  value={
                    props.type === 1
                      ? ((_.get(query, ['configs']) || []).find(item => o.controlId === item.cid) || {}).subCid
                      : (cellConfigs.find(item => item.controlId === o.controlId) || {}).columnNum
                  }
                  className={cx('flex InlineBlock')}
                  onChange={newValue => {
                    if (props.type === 1) {
                      //worksheet
                      const hasMarry = !!(_.get(query, ['configs']) || []).find(
                        o => o.subCid === newValue && controls.map(it => it.controlId).includes(o.cid),
                      );
                      const controlsIds = controls.map(item => item.controlId);
                      const cellConfigsCids = (_.get(query, ['configs']) || []).map(item => item.cid);
                      if (hasMarry) {
                        alert(_l('该列已匹配过'), 3);
                        onChange({
                          configs: _.get(query, ['configs']),
                        });
                        setQuery({ ...query, configs: _.get(query, ['configs']) });
                        return;
                      }
                      if (cellConfigsCids.includes(o.controlId)) {
                        let da = {
                          configs: _.get(query, ['configs'])
                            .map(item => {
                              if (item.cid === o.controlId) {
                                return { cid: o.controlId, subCid: newValue };
                              } else {
                                return item;
                              }
                            })
                            .filter(o => controlsIds.includes(o.cid)),
                        };
                        onChange(da);
                        setQuery({ ...query, ...da });
                      } else {
                        let newdata = {
                          cid: o.controlId,
                          subCid: newValue,
                        };
                        let configs = _.get(query, ['configs']) || [];
                        configs.push(newdata);
                        onChange({
                          configs: configs.filter(o => controlsIds.includes(o.cid)),
                        });
                        setQuery({ ...query, configs });
                      }
                    } else {
                      //excel
                      if (cellConfigs.map(o => o.columnNum).includes(newValue)) {
                        alert(_l('该列已匹配过'), 3);
                        return;
                      }
                      const cellConfigsIds = cellConfigs.map(item => item.controlId);
                      let itemCell = cells
                        .filter(item => !cellConfigs.map(a => a.columnNum).includes(item.columnNum))
                        .find(item => item.columnNum === newValue);
                      let newdata = {
                        controlId: o.controlId,
                        columnName: itemCell.columnName,
                        columnNum: newValue,
                        controlName: o.controlName,
                      };
                      if (cellConfigsIds.includes(o.controlId)) {
                        onChange(
                          cellConfigs.map(item => {
                            if (item.controlId === o.controlId) {
                              return newdata;
                            } else {
                              return item;
                            }
                          }),
                        );
                      } else {
                        onChange([...cellConfigs, newdata]);
                      }
                    }
                  }}
                />
              </div>
            );
          })}
      </div>
    </Wrap>
  );
}
