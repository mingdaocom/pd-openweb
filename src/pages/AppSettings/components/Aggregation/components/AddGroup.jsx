import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Icon } from 'ming-ui';
import 'src/pages/integration/dataIntegration/connector/style.less';
import { getTranslateInfo } from 'src/utils/app';
import { canArraySplit, GROUPLIMITTYPES, GROUPMAX, isUnique } from '../config';
import {
  getGroupFields,
  getGroupInfo,
  getLimitControlByRelativeNum,
  getNodeInfo,
  getRuleAlias,
  setResultFieldSettingByAggFuncType,
  updateConfig,
} from '../util';
import ChooseControls from './ChooseControls';
import { WrapDropW } from './style';

export default function (props) {
  const { onUpdate, flowData, sourceInfos } = props;
  const sourceDt = getNodeInfo(flowData, 'DATASOURCE');
  const getSourceTableData = (_.get(sourceDt, 'nodeConfig.config.sourceTables') || [])[0] || {};
  const [{ showList }, setState] = useSetState({ showList: false });
  if (getGroupFields(flowData).length >= GROUPMAX) {
    return '';
  }
  if (props.updateLoading) {
    return <div className={cx('mTop16 Gray_bd  qw alignItemsCenter flexRow')}>{_l('加载中...')}</div>;
  }
  return (
    <Trigger
      action={['click']}
      key={`groupFields_${(getGroupFields(flowData) || []).length}`}
      getPopupContainer={() => document.body}
      popupAlign={{ points: ['tl', 'bl'], offset: [0, 4], overflow: { adjustX: true, adjustY: true } }}
      popupVisible={showList}
      onPopupVisibleChange={showList => setState({ showList })}
      popupClassName="aggregationChooseControlTriggerWrap"
      popup={
        (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length <= 0 || !showList ? (
          <span />
        ) : (
          <WrapDropW>
            <ChooseControls
              title={
                getTranslateInfo(getSourceTableData.appId, null, getSourceTableData.workSheetId).name ||
                getSourceTableData.tableName
              }
              worksheetId={getSourceTableData.workSheetId}
              flowData={flowData}
              sourceInfos={sourceInfos.map(o => {
                const { appId, workSheetId, tableName } =
                  (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).find(
                    ii => ii.workSheetId === o.worksheetId,
                  ) || {};
                const limitNum = getLimitControlByRelativeNum(flowData);
                return {
                  ...o,
                  controls: o.controls
                    .filter(o => ![6, 8].includes(o.type)) //归组这一期先不做数值和金额)
                    .map(o => {
                      if (o.relationControls) {
                        o.relationControls = o.relationControls.map(o => {
                          if (limitNum >= 3 && GROUPLIMITTYPES.includes(o.type)) {
                            o.isLimit = true;
                          } else {
                            o = _.omit(o, ['isLimit']);
                          }
                          return o;
                        });
                      }
                      return o;
                    }),
                  tableName: getTranslateInfo(appId, null, workSheetId).name || tableName,
                };
              })}
              onChange={data => {
                const { control, childrenControl } = data;
                const workSheetId = ((_.get(sourceDt, 'nodeConfig.config.sourceTables') || [])[0] || {}).workSheetId;
                const controlData = !!childrenControl ? childrenControl : control;
                const name = !!childrenControl
                  ? `${control.controlName}-${controlData.controlName}`
                  : controlData.controlName;
                let newDt = {
                  alias: getRuleAlias(name, flowData),
                  controlSetting: controlData,
                  isChildField: !!childrenControl, //可选，是否为子表字段(工作表关联字段关联表下的字段)-默认false
                  parentFieldInfo: !!childrenControl
                    ? {
                        controlSetting: control,
                        oid: `${workSheetId}_${control.controlId}`,
                      }
                    : {}, //可选，父字段，子表字段的上级字段，isChildField为true的时候必须有
                  isNotNull: true,
                  isTitle: controlData.attribute === 1, //是否是标题，只有是工作表字段才有值
                  mdType: controlData.type,
                  name: name,
                  oid: `${!!childrenControl ? control.dataSource : workSheetId}_${controlData.controlId}`, //工作表:oid记录为 worksheetId_controllId,这里前端需要这种层级关系，后端获取的时候只需controllerId
                  precision: 0,
                  scale: 0,
                };
                const resultField = { ...newDt, ...getGroupInfo({ fields: [newDt] }, flowData) };
                let groupFieldAdd = {
                  fields: [newDt],
                  resultField: setResultFieldSettingByAggFuncType(resultField),
                };
                if (canArraySplit(controlData)) {
                  groupFieldAdd.arraySplit = !isUnique(controlData);
                }
                const groupDt = getNodeInfo(flowData, 'GROUP');
                onUpdate(
                  [
                    updateConfig(groupDt, {
                      displayNull: _.get(groupDt, 'nodeConfig.config.displayNull') !== false,
                      groupFields: getGroupFields(flowData).concat(groupFieldAdd),
                    }),
                  ],
                  true,
                  flowData,
                );
                setState({ showList: false });
              }}
            />
          </WrapDropW>
        )
      }
    >
      <div
        className={cx(
          'mTop16 Gray_75 ThemeHoverColor3 qw alignItemsCenter flexRow',
          (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length <= 0 ? '' : 'Hand',
        )}
      >
        <Icon icon="add" className="Font16" /> <span>{_l('字段')}</span>
      </div>
    </Trigger>
  );
}
