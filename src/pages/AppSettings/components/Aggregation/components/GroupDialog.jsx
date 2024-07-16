import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Icon, Dialog } from 'ming-ui';
import cx from 'classnames';
import { useSetState } from 'react-use';
import { SortableContainer, SortableElement, SortableHandle, arrayMove } from '@mdfe/react-sortable-hoc';
import Trigger from 'rc-trigger';
import ChooseControls from './ChooseControls';
import 'src/pages/AppSettings/components/Aggregation/components/style.less';
import { getNodeInfo, getControls, getResultField } from '../util';
import _ from 'lodash';

const inputW = 240;
const inputWm = 200;
const Wrap = styled.div`
  overflow-x: auto;
  max-height: 400px;
`;
const WrapItem = styled.div(
  ({ length }) => `
  height: 40px;
  .leftCon,
  .rightCon {
    height: 36px;
    line-height: 36px;
    position: absolute;
    flex-shrink: 0;
    width: 16px;
    left: 5px;
    min-width: 16px;
    &.rightCon {
      right: 10px;
      left: initial;
    }
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
  }
  .dragIcon,
  .clearIcon {
    opacity: 0;
    font-size: 14px;
  }
  &:hover {
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
    width: 40px;
    min-width: 40px;
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
    &.hasFeil {
      position: relative;
      .clearFeil,
      .icon-arrow-down-border {
        position: absolute;
        right: 6px;
      }
      .clearFeil {
        opacity: 0;
      }
      &:hover {
        .clearFeil {
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
  color: #2196f3;
`;
export default function GroupDialog(props) {
  const { onHide, onOk, visible, className, sourceInfos = [], flowData } = props;
  const tbodyContainer = useRef(null);
  const [{ groupControls }, setState] = useSetState({
    groupControls: props.groupControls.length <= 0 ? [{}] : props.groupControls,
  });

  const SortHandle = SortableHandle(() => (
    <div className="leftCon flexRow alignItemsCenter justifyContentCenter">
      <Icon className="Gray_bd Hand dragIcon ThemeHoverColor3" icon="drag" />
    </div>
  ));

  const Item = SortableElement(props => {
    const { item, onUpdate, items, sourceInfos, num } = props;
    // const [{ visibleTrigger }, setState] = useSetState({
    //   visibleTrigger: false,
    // });
    let version = Math.random();
    return (
      <WrapItem className={cx('flexRow cardItem alignItemsCenter mTop12', `${num}_itemC`)} length={sourceInfos.length}>
        <SortHandle />
        <div
          className="flex flexRow alignItemsCenter conByWorksheet titleConByWorksheet"
          style={{
            width: sourceInfos.length * (sourceInfos.length > 2 ? inputWm : inputW) + (sourceInfos.length - 1) * 40,
            minWidth: sourceInfos.length * (sourceInfos.length > 2 ? inputWm : inputW) + (sourceInfos.length - 1) * 40,
          }}
        >
          <React.Fragment>
            {sourceInfos.map((o, i) => {
              const fields = _.get(item, `fields`);
              const data = (fields || []).find((o = {}, n) => !!o.oid && n !== i);
              const list = items.map(a => (_.get(a, `fields[${i}].oid`) || '').split('_')[1]);
              let sourceInfo = sourceInfos.find(it => it.worksheetId === o.worksheetId) || {};
              const groupDt = getNodeInfo(flowData, 'GROUP');
              const sourceInfoData = [
                {
                  ...sourceInfo,
                  controls: getControls(data, (sourceInfo || {}).controls || []).filter(
                    o => !list.includes(o.controlId) && ![6, 8].includes(o.type), //这期先不支持数值金额
                  ),
                },
              ];
              const isDel =
                !!_.get(item, `fields[${i}].name`) &&
                !((sourceInfo || {}).controls || []).find(
                  o => o.controlId === (_.get(item, `fields[${i}].oid`) || '').split('_')[1],
                );
              const fieldsName = !_.get(item, `fields[${i}].name`)
                ? _l('选择字段')
                : isDel
                ? _l('已删除')
                : _.get(item, `fields[${i}].name`);
              const flowDataNew = _.cloneDeep(flowData);
              flowDataNew.aggTableNodes[groupDt.nodeId].nodeConfig.config.groupFields = items;
              return (
                <React.Fragment>
                  <Trigger
                    action={['click']}
                    key={`${o.worksheetId}_${i}_${o.controlId}_${version}`}
                    getPopupContainer={() => document.body}
                    popupAlign={{ points: ['tl', 'bl'], offset: [0, 0], overflow: { adjustX: true, adjustY: true } }}
                    popup={
                      <WrapDrop>
                        <ChooseControls
                          title={(o || {}).workSheetName}
                          worksheetId={o.worksheetId}
                          flowData={flowDataNew}
                          key={version + ''}
                          sourceInfos={sourceInfoData}
                          onChange={data => {
                            const { control, childrenControl } = data;
                            let newDt = {
                              alias: control.controlName,
                              controlSetting: !!childrenControl ? childrenControl : control,
                              isChildField: !!childrenControl, //可选，是否为子表字段(工作表关联字段关联表下的字段)-默认false
                              parentFieldInfo: !!childrenControl ? control : {}, //可选，父字段，子表字段的上级字段，isChildField为true的时候必须有
                              isNotNull: true,
                              isTitle: control.attribute === 1, //是否是标题，只有是工作表字段才有值
                              mdType: control.type,
                              name: control.controlName,
                              oid: `${o.worksheetId}_${control.controlId}`, //工作表:oid记录为 worksheetId_controllId,这里前端需要这种层级关系，后端获取的时候只需controllerId
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
                        hasFeil: _.get(item, `fields[${i}].name`),
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
                      {_.get(item, `fields[${i}].name`) && (
                        <Icon
                          icon="cancel1"
                          className="Gray_9e mLeft8 clearFeil"
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
                      <Icon icon="task-point-more" className="mLeft5 Font20 Gray_bd" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        </div>
        <div className="rightCon flexRow alignItemsCenter justifyContentCenter">
          <Icon
            icon="delete1"
            className="clearIcon Hand del Font16 mLeft4"
            onClick={() => {
              onUpdate(items.filter((o, i) => i !== num));
            }}
          />
        </div>
      </WrapItem>
    );
  });
  const SortableList = SortableContainer(props => {
    const { items, sourceInfos } = props;

    return (
      <Wrap
        className="tbodyContainer"
        ref={tbodyContainer}
        onScroll={() => {
          const top = tbodyContainer.current && tbodyContainer.current.scrollTop;
          $(`.leftCon,.rightCon`).css({
            transform: `translate(0,${-top}px)`,
          });
        }}
      >
        <WrapItem className="flexRow cardItem cardItemTitle  alignItemsCenter" length={sourceInfos.length}>
          <div className="flex flexRow alignItemsCenter conByWorksheet">
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
        {_.map(items, (item, index) => {
          return (
            <Item item={item} sourceInfos={sourceInfos} {...props} key={'item_' + index} index={index} num={index} />
          );
        })}
      </Wrap>
    );
  });
  const onSave = () => {
    //字段名称显示第一个工作表，第一个字段的名称。
    let isErr = false;
    groupControls.map((o, n) => {
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
          resultField: getResultField(o.fields),
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
        return {
          ...o,
          resultField: { ...data, alias: name, name },
        };
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
      // footer={null}
      width={
        // sourceInfos.length > 2
        //   ? 3 * inputW + 2 * 40 + 24 * 2
        // :
        sourceInfos.length * (sourceInfos.length > 2 ? inputWm : inputW) + (sourceInfos.length - 1) * 40 + 24 * 2
      }
      onCancel={onHide}
      onOk={() => {
        onSave();
      }}
    >
      <div className="groupConPolymerizationCon noSelect">
        <SortableList
          items={groupControls}
          sourceInfos={sourceInfos}
          distance={5}
          useDragHandle
          axis={'y'}
          onSortEnd={({ oldIndex, newIndex }) => {
            if (oldIndex === newIndex) {
              return;
            }
            setState({
              groupControls: arrayMove(groupControls, oldIndex, newIndex),
            });
          }}
          helperClass={'groupConPolymerization'}
          onUpdate={groupControls => {
            setState({ groupControls });
          }}
        />

        <WrapAdd
          className="Hand mTop12 addItem Bold ThemeHoverColor3 flexRow alignItemsCenter"
          onClick={() => {
            setState({ groupControls: groupControls.concat({}) });
          }}
        >
          <Icon icon="add" className="InlineBlock Font16" /> <span>{_l('归组')}</span>
        </WrapAdd>
      </div>
    </Dialog>
  );
}
