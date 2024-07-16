import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Icon } from 'ming-ui';
import ChooseControlsForAggregation from './ChooseControlsForAggregation';
import CalculationDialog from './CalculationDialog';
import { getNodeInfo, getAggFuncTypes, getRuleAlias, updateConfig } from '../util';
import { getTranslateInfo } from 'src/util';
import { isFormulaResultAsTime } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util.js';
import { CAN_AS_TIME_DYNAMIC_FIELD } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';

export default function AddAggregation(props) {
  const { onUpdate } = props;
  const [{ showCalculation, flowData, sourceInfos }, setState] = useSetState({
    showCalculation: false,
    flowData: props.flowData,
    sourceInfos: props.sourceInfos,
  });

  useEffect(() => {
    setState({
      flowData: props.flowData,
      sourceInfos: props.sourceInfos,
    });
  }, [props]);

  const updateAggregateDt = newDt => {
    const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
    onUpdate([
      updateConfig(aggregateDt, {
        aggregateFields: (_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).concat(newDt),
      }),
    ]);
  };

  const sourceDt = getNodeInfo(flowData, 'DATASOURCE');
  const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
  const isMax =
    (_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).filter(o => !o.isCalculateField).length >= 10;
  const renderAddAgg = () => {
    if (isMax) return null;
    return (
      <span className="InlineBlock">
        <span
          className={cx(
            'mTop16 Bold alignItemsCenter flexRow',
            (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length <= 0 ? '' : 'Hand',
            isMax ? 'Gray_bd' : 'Gray_75 ThemeHoverColor3',
          )}
        >
          <Icon icon="add" className="Font16" />
          <span>{_l('字段')}</span>
        </span>
      </span>
    );
  };

  const onChange = ({ control = {}, childrenControl }, worksheetId) => {
    const controlData = !!childrenControl ? childrenControl : control;
    const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
    const { hs, aggFuncType, aggFuncName } = getAggFuncTypes(
      _.get(aggregateDt, 'nodeConfig.config.aggregateFields') || [],
      controlData,
      worksheetId,
    );
    if (hs) {
      alert(_l('不能重复添加相同计算方式的相同字段'), 3);
      return;
    }
    const dot = ['COUNT', 'DISTINCT_COUNT'].includes(aggFuncType) ? undefined : 2;
    let newDt =
      control.controlId === 'rowscount'
        ? {
            name: _l('记录数量'),
            alias: getRuleAlias(`${_l('记录数量')}-${aggFuncName}`, flowData),
            isRowsCount: true,
            aggFuncType,
            oid: `${worksheetId}_rowscount`,
            dot: 0,
          }
        : {
            aggFuncType,
            alias: getRuleAlias(`${controlData.controlName}-${aggFuncName}`, flowData),
            controlSetting: {
              ...controlData,
              dot,
              advancedSetting: { ...controlData.advancedSetting, showtype: '0', dot }, //聚合字段showtype：0
              unit:
                isFormulaResultAsTime(controlData) || _.includes(CAN_AS_TIME_DYNAMIC_FIELD, controlData.type)
                  ? ''
                  : controlData.unit, //时间类默认把unit都去掉
            },
            isChildField: !!childrenControl, //可选，是否为子表字段(工作表关联字段关联表下的字段)-默认false
            parentFieldInfo: !!childrenControl ? control : {}, //可选，父字段，子表字段的上级字段，isChildField为true的时候必须有
            isNotNull: true,
            isTitle: controlData.attribute === 1, //是否是标题，只有是工作表字段才有值
            mdType: controlData.type,
            name: controlData.controlName,
            oid: `${worksheetId}_${controlData.controlId}`, //工作表:oid记录为 worksheetId_controllId,这里前端需要这种层级关系，后端获取的时候只需controllerId
            precision: 0,
            scale: 0,
            isCalculateField: false,
          };
    updateAggregateDt(newDt);
  };

  const onOk = control => {
    if (!getRuleAlias(control.controlName, flowData, true)) {
      alert(_l('已存在该字段名称，名称不可重复'), 3);
      return;
    }
    let newDt = {
      alias: control.controlName,
      controlSetting: control,
      isChildField: false, //可选，是否为子表字段(工作表关联字段关联表下的字段)-默认false
      parentFieldInfo: {}, //可选，父字段，子表字段的上级字段，isChildField为true的时候必须有
      isNotNull: true,
      isTitle: false, //是否是标题，只有是工作表字段才有值
      mdType: 31,
      name: control.controlName,
      precision: 0,
      scale: 0,
      isCalculateField: true,
    };
    updateAggregateDt(newDt);
    setState({
      showCalculation: false,
    });
  };

  const allControls = (_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || [])
    .filter(item => {
      if (item.isCalculateField) {
        return false;
      } else {
        let isDelete = _.get(item, 'isDelete');
        if (
          !(_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).find(
            it => item.oid && item.oid.indexOf(it.workSheetId) >= 0,
          )
        ) {
          isDelete = true;
        }
        return !isDelete;
      }
    })
    .map(o => {
      return { ...o, controlName: o.alias, controlId: _.get(o, 'id'), type: 6 };
    });

  return (
    <React.Fragment>
      {isMax ? (
        <div
          className="InlineBlock"
          onClick={() => {
            alert(_l('已达到上限'), 3);
          }}
        >
          {renderAddAgg()}
        </div>
      ) : (
        <Trigger
          action={['click']}
          getPopupContainer={() => document.body}
          key={`ChooseControlsForAggregation_${(_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).length}`}
          popupAlign={{ points: ['tl', 'bl'], offset: [0, 4], overflow: { adjustX: true, adjustY: true } }}
          popup={
            (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length > 0 ? (
              <ChooseControlsForAggregation
                worksheets={_.get(sourceDt, 'nodeConfig.config.sourceTables').map(o => {
                  return {
                    ...o,
                    controls: (sourceInfos.find(it => it.worksheetId === o.workSheetId) || {}).controls,
                    tableName: getTranslateInfo(o.appId, null, o.workSheetId).name || o.tableName,
                  };
                })}
                worksheetId={
                  (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length > 1
                    ? ''
                    : (_.get(sourceDt, 'nodeConfig.config.sourceTables') || [])[0].workSheetId
                }
                list={[]}
                flowData={flowData}
                sourceInfos={sourceInfos}
                onChange={onChange}
              />
            ) : (
              <span className=""></span>
            )
          }
        >
          {renderAddAgg()}
        </Trigger>
      )}
      {(_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length > 0 &&
        (_.get(aggregateDt, 'nodeConfig.config.aggregateFields') || []).filter(o => !o.isCalculateField).length > 0 && (
          <span className="InlineBlock">
            <span
              className={cx('Hand mTop16 Gray_75 ThemeHoverColor3 Bold flexRow alignItemsCenter', { mLeft25: !isMax })}
              onClick={() => {
                setState({
                  showCalculation: true,
                });
              }}
            >
              <Icon icon="add" className="Font16" />
              <span>{_l('计算字段')}</span>
            </span>
          </span>
        )}

      {showCalculation && (
        <CalculationDialog
          visible={showCalculation}
          onHide={() => {
            setState({
              showCalculation: false,
            });
          }}
          onOk={onOk}
          allControls={allControls}
        />
      )}
    </React.Fragment>
  );
}
