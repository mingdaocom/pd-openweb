import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _, { isUndefined } from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, Icon, SortableList } from 'ming-ui';
import 'src/pages/AppSettings/components/Aggregation/components/style.less';
import { canArraySplit, GROUPLIMITTYPES, GROUPMAX, GROUPMAXBYREL, isUnique } from '../config';
import {
  formatControls,
  getControls,
  getLimitControlByRelativeNum,
  getNodeInfo,
  getResultField,
  isDelStatus,
} from '../util';
import ChooseControls from './ChooseControls';

const inputW = 240;
const inputWm = 200;
const Wrap = styled.div`
  overflow-x: auto;
  max-height: 400px;
`;
const WrapItem = styled.div(
  ({ length }) => `
  height: 40px;
  padding-left: 36px;
  & > span {
    display: inline-block;
    height: 40px;
  }
  .leftCon {
    height: 36px;
    line-height: 36px;
    position: absolute;
    flex-shrink: 0;
    left: 24px;
    width: 36px;
    min-width: 36px;
    text-align: center;
    background: #fff;
    z-index: 1;
    &:hover {
      .dragIcon,
      .clearIcon {
        opacity: 1;
        color: #9e9e9e;
        &:hover {
          color: Red;
        }
      }
    }
    width: 36px;
    min-width: 36px;
    text-align: center;
    .num {
      opacity: 1;
      position: absolute;
      left: 50%;
      transform: translate(-50%, 0);
      width: 36px;
    }
    .clearIcon {
      opacity: 0;
      position: absolute;
      left: 50%;
      transform: translate(-50%, 0);
      width: 36px;
      z-index: 1;
    }
    &:hover {
      .num {
        opacity: 0;
      }
      .clearIcon {
        opacity: 1;
      }
    }
  }
  .dragIcon,
  .clearIcon {
    opacity: 0;
    font-size: 14px;
  }
  &:hover {
    background: rgba(230, 247, 255, 0.61);
    .leftCon:not(.tit) {
      background: rgba(230, 247, 255, 0.61);
      .num {
        opacity: 0;
      }
    }
    &.cardItemTitle {
      background: #fff;
    }
    .dragIcon,
    .clearIcon {
      opacity: 1;
      color: #9e9e9e;
      &:hover {
        color: Red;
      }
    }
    .conByWorksheet {
    }
    .titleConByWorksheet {
      background: rgba(230, 247, 255, 0.61);
    }
  }
  .joinCon {
    width: 32px;
    min-width: 32px;
  }
  .Dropdown--input {
    min-width: ${length > 2 ? inputWm : inputW}px;
    width: ${length > 2 ? inputWm : inputW}px;
    height: 35px;
    line-height: 35px;
    background: #ffffff;
    border: 1px solid #dddddd;
    border-radius: 3px;
    padding: 0 8px 0 12px;
    &.hasField {
      position: relative;
      .clearField,
      .icon-arrow-down-border {
        position: absolute;
        right: 6px;
      }
      .clearField {
        opacity: 0;
      }
      &:hover {
        .clearField {
          opacity: 1;
        }
        .icon-arrow-down-border {
          display: none;
        }
      }
    }
  }
  &.cardItemTitle {
    .Dropdown--input {
      background: #f4f4f4;
      border: none;
      font-weight: 700;
      padding: 0 12px;
    }
  }
`,
);
const WrapDrop = styled.div`
  background: #fff;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  padding: 5px 0;
  max-height: 360px;
`;
const WrapAdd = styled.span`
  color: #1677ff;
  background: #fff;
  height: 36px;
  position: relative;
  z-index: 1;
`;
export default function GroupDialog(props) {
  const { onHide, onOk, visible, className, sourceInfos = [], flowData } = props;
  const tbodyContainer = useRef(null);
  const [{ groupControls }, setState] = useSetState({
    groupControls: props.groupControls.length <= 0 ? [{ arraySplit: true }] : props.groupControls,
  });

  useEffect(() => {
    const top = tbodyContainer.current && tbodyContainer.current.scrollTop;
    $('.leftCon').css({ transform: `translate(0,${-top}px)` });
  }, [groupControls]);

  const Item = props => {
    const { item, onUpdate, items, sourceInfos } = props;
    const { num } = item;
    let version = Math.random();
    return (
      <WrapItem className={cx('flexRow cardItem alignItemsCenter mTop12', `${num}_itemC`)} length={sourceInfos.length}>
        <div className="leftCon flexRow alignItemsCenter justifyContentCenter">
          <div className="num">{num + 1}</div>
          <Icon
            icon="trash"
            className="clearIcon Hand del Font16"
            onClick={() => {
              onUpdate(items.filter((o, i) => i !== num));
            }}
          />
        </div>
        <div
          className="flex flexRow alignItemsCenter conByWorksheet titleConByWorksheet"
          style={{
            width: sourceInfos.length * (sourceInfos.length > 2 ? inputWm : inputW) + (sourceInfos.length - 1) * 32,
            minWidth: sourceInfos.length * (sourceInfos.length > 2 ? inputWm : inputW) + (sourceInfos.length - 1) * 32,
          }}
        >
          <React.Fragment>
            {sourceInfos.map((o, i) => {
              const fields = _.get(item, `fields`);
              const data = (fields || []).find((o = {}, n) => !!o.oid && n !== i);
              const list = items.map(a => (_.get(a, `fields[${i}].oid`) || '').split('_')[1]);
              const oidList = items.map(a => _.get(a, `fields[${i}].oid`) || '');
              let sourceInfo = o;
              const groupDt = getNodeInfo(flowData, 'GROUP');
              const flowDataNew = _.cloneDeep(flowData);
              flowDataNew.aggTableNodes[groupDt.nodeId].nodeConfig.config.groupFields = items;
              const sourceInfoData = [
                {
                  ...sourceInfo,
                  controls: formatControls(getControls(data, (sourceInfo || {}).controls || []), o.worksheetId)
                    .filter(
                      o => !list.includes(o.controlId) && ![6, 8].includes(o.type), //这期先不支持数值金额
                    )
                    .map(o => {
                      return {
                        ...o,
                        relationControls: formatControls(getControls(data, o.relationControls || []))
                          .filter(
                            a => !oidList.includes(`${o.dataSource}_${a.controlId}`) && ![6, 8].includes(a.type), //这期先不支持数值金额
                          )
                          .map(o => {
                            if (
                              getLimitControlByRelativeNum(flowDataNew) >= GROUPMAXBYREL &&
                              GROUPLIMITTYPES.includes(o.type)
                            ) {
                              o.isLimit = true;
                            } else {
                              o = _.omit(o, ['isLimit']);
                            }
                            return o;
                          }),
                      };
                    }),
                },
              ];
              let isDel = !_.get(item, `fields[${i}].name`);
              if (!isDel) {
                isDel = isDelStatus(_.get(item, `fields[${i}]`), [sourceInfo]);
              }
              const fieldsName = !_.get(item, `fields[${i}].name`)
                ? _l('选择字段')
                : isDel
                  ? _l('已删除')
                  : _.get(item, `fields[${i}].name`);

              return (
                <React.Fragment>
                  <Trigger
                    action={['click']}
                    key={`${o.worksheetId}_${i}_${o.controlId}_${version}`}
                    getPopupContainer={() => document.body}
                    popupClassName="aggregationChooseControlTriggerWrap"
                    popupAlign={{ points: ['tl', 'bl'], offset: [0, 0], overflow: { adjustX: true, adjustY: true } }}
                    popup={
                      <WrapDrop>
                        <ChooseControls
                          hasFormat
                          title={(o || {}).workSheetName}
                          worksheetId={o.worksheetId}
                          flowData={flowDataNew}
                          key={version + ''}
                          sourceInfos={sourceInfoData}
                          onChange={data => {
                            const { control, childrenControl } = data;
                            const dataControl = childrenControl ? childrenControl : control;
                            const name = childrenControl
                              ? `${control.controlName}-${dataControl.controlName}`
                              : dataControl.controlName;
                            let newDt = {
                              alias: name,
                              controlSetting: dataControl,
                              isChildField: !!childrenControl, //可选，是否为子表字段(工作表关联字段关联表下的字段)-默认false
                              parentFieldInfo: childrenControl
                                ? {
                                    controlSetting: control,
                                    oid: `${o.worksheetId}_${control.controlId}`,
                                  }
                                : {}, //可选，父字段，子表字段的上级字段，isChildField为true的时候必须有
                              isNotNull: true,
                              isTitle: dataControl.attribute === 1, //是否是标题，只有是工作表字段才有值
                              mdType: dataControl.type,
                              name: name,
                              oid: `${childrenControl ? control.dataSource : o.worksheetId}_${dataControl.controlId}`, //工作表:oid记录为 worksheetId_controllId,这里前端需要这种层级关系，后端获取的时候只需controllerId
                              precision: 0,
                              scale: 0,
                            };
                            let newFields = fields || [];
                            newFields[i] = newDt;
                            onUpdate(
                              items.map((it, n) => {
                                return n === num ? { ...it, fields: newFields } : it;
                              }),
                            );
                          }}
                        />
                      </WrapDrop>
                    }
                  >
                    <div
                      className={cx('Dropdown--input Dropdown--border flexRow alignItemsCenter', {
                        hasField: _.get(item, `fields[${i}].name`),
                      })}
                    >
                      <div
                        className={cx('flex WordBreak overflow_ellipsis', {
                          Gray_bd: !_.get(item, `fields[${i}].name`),
                          Red: isDel,
                        })}
                      >
                        {fieldsName}
                      </div>
                      {_.get(item, `fields[${i}].parentFieldInfo.controlSetting.controlName`) && (
                        <Tooltip
                          placement="bottomLeft"
                          offset={[-20, 0]}
                          autoCloseDelay={0}
                          title={
                            <span className="">
                              {_.get(item, `fields[${i}].parentFieldInfo.controlSetting.controlName`) && (
                                <span className="Gray_bd pRight5">{_l('关联')}</span>
                              )}
                              {`${_.get(item, `fields[${i}].parentFieldInfo.controlSetting.controlName`) + '>'}${
                                !_.get(item, `fields[${i}]controlSetting`)
                                  ? _.get(item, `fields[${i}]alias`)
                                  : _.get(item, `fields[${i}]controlSetting.controlName`) || _l('未命名')
                              }`}
                            </span>
                          }
                        >
                          <Icon icon="info_outline" className="Hand Gray_9e ThemeHoverColor3 Font16 pRight20" />
                        </Tooltip>
                      )}
                      {_.get(item, `fields[${i}].name`) && (
                        <Icon
                          icon="cancel"
                          className="Gray_9e mLeft8 clearField"
                          onClick={e => {
                            e.stopPropagation();
                            let newFields = fields || [];
                            newFields[i] = {};
                            onUpdate(
                              items.map((it, n) => {
                                return n === num ? { ...it, fields: newFields } : it;
                              }),
                            );
                          }}
                        />
                      )}
                      <Icon icon="arrow-down-border" className="mLeft5 Font16 Hand Gray_9e" />
                    </div>
                  </Trigger>
                  {i < sourceInfos.length - 1 && (
                    <div className="joinCon flexRow alignItemsCenter justifyContentCenter">
                      <Icon icon="more_horiz" className="Font20 Gray_bd" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        </div>
      </WrapItem>
    );
  };
  const onSave = () => {
    //字段名称显示第一个工作表，第一个字段的名称。
    let isErr = false;
    groupControls.map(o => {
      sourceInfos.map((oo, nn) => {
        if (!(_.get(o, `fields[${nn}]`) || {}).oid) {
          isErr = true;
        }
      });
      // if (_.uniq(_.get(o, `fields`) || {}).map(a => a.mdType).length !== 1) {
      //   isErr = true;
      // }
    });
    if (isErr) {
      alert(_l('配置存在错误，请完整配置'), 3);
      return;
    }
    let newGroupControls = groupControls.map(o => {
      if (!!o.resultField && o.resultField.oid === o.fields[0].oid) {
        return o;
      } else {
        return {
          ...o,
          resultField: getResultField(o.fields, flowData),
        };
      }
    });
    const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
    const aggregateFields = _.get(aggregateDt, 'nodeConfig.config.aggregateFields') || [];
    let aliasList = [];
    aggregateFields.map(o => {
      aliasList.push(o.alias);
    });
    const addUniqueItemWithName = newName => {
      if (!aliasList.find(o => o === newName)) {
        return newName;
      } else {
        let suffix = 1;
        let uniqueName = newName + suffix;
        while (aliasList.some(item => item === uniqueName)) {
          suffix++;
          uniqueName = newName + suffix;
        }
        return uniqueName;
      }
    };
    onOk(
      newGroupControls.map(o => {
        let data = o.resultField;
        let name = addUniqueItemWithName(data.alias);
        aliasList.push(name);
        let it = {
          ...o,
          resultField: { ...data, alias: name, name },
        };
        if (!canArraySplit(it.resultField.controlSetting)) {
          it = _.omit(it, ['arraySplit']);
        } else if (isUndefined(it.arraySplit)) {
          it.arraySplit = !isUnique(it.resultField.controlSetting);
        }
        return it;
      }),
    );
    onHide();
  };
  return (
    <Dialog
      dialogClasses={className}
      className={cx('groupConPolymerizationDialog')}
      visible={visible}
      anim={false}
      overlayClosable={false}
      title={_l('设置归组')}
      description={_l('对多表数据源归组，请分别选择工作表中的同类型字段进行归组合并')}
      style={{ maxWidth: window.innerWidth - 100, width: 'auto' }}
      onCancel={onHide}
      onOk={() => {
        onSave();
      }}
    >
      <div className="groupConPolymerizationCon noSelect">
        <Wrap
          className="tbodyContainer"
          ref={tbodyContainer}
          onScroll={() => {
            const top = tbodyContainer.current && tbodyContainer.current.scrollTop;
            $(`.leftCon`).css({
              transform: `translate(0,${-top}px)`,
            });
          }}
        >
          <WrapItem className="flexRow cardItem cardItemTitle  alignItemsCenter" length={sourceInfos.length}>
            <div className="flex flexRow alignItemsCenter conByWorksheet">
              <div className="leftCon tit"></div>
              {sourceInfos.map((it, i) => {
                return (
                  <React.Fragment>
                    <div className="Dropdown--input TxtCenter WordBreak overflow_ellipsis">{it.workSheetName}</div>
                    {i < sourceInfos.length - 1 && <div className="joinCon"></div>}
                  </React.Fragment>
                );
              })}
            </div>
          </WrapItem>
          <SortableList
            items={groupControls.map((o, i) => {
              return { ...o, num: i };
            })}
            itemKey="num"
            renderItem={options => (
              <Item
                {...options}
                items={groupControls}
                sourceInfos={sourceInfos}
                {...props}
                onUpdate={groupControls => {
                  setState({ groupControls });
                }}
              />
            )}
          />
        </Wrap>

        {groupControls.length < GROUPMAX && (
          <WrapAdd
            className="Hand pTop12 addItem Bold ThemeHoverColor3 flexRow alignItemsCenter InlineBlock addGroupBtn"
            onClick={() => {
              setState({ groupControls: groupControls.concat({}) });
            }}
          >
            <Icon icon="add" className="InlineBlock Font16" /> <span>{_l('归组')}</span>
          </WrapAdd>
        )}
      </div>
    </Dialog>
  );
}
