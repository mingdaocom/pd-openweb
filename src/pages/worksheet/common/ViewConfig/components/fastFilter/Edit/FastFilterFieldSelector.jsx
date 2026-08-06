import React, { useRef } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { filterOnlyShowField, getIconByType } from 'src/pages/widgetConfig/util';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
import { FASTFILTER_CONDITION_TYPE, getControlFormatType, getSetDefault } from '../util';

// 快速筛选字段切换，替换字段时同步清理必填筛选配置。
export default function FastFilterFieldSelector(props) {
  const {
    worksheetControls,
    currentSheetInfo,
    fastFilters,
    activeFastFilterId,
    control,
    view,
    setActiveFastFilterId,
    updateView,
  } = props;
  const boxConT = useRef(null);

  return (
    <React.Fragment>
      <div className="title">{_l('筛选字段')}</div>
      <AddCondition
        renderInParent
        className="addControl"
        columns={filterOnlyShowField(
          setSysWorkflowTimeControlFormat(worksheetControls, currentSheetInfo.switches || []),
        ).filter(
          o =>
            (FASTFILTER_CONDITION_TYPE.includes(o.type) ||
              (o.type === 30 && FASTFILTER_CONDITION_TYPE.includes(getControlFormatType(o)))) &&
            !fastFilters.map(o => o.controlId).includes(o.controlId),
        )}
        onAdd={data => {
          const d = getSetDefault(data);
          const fastFilterData = fastFilters.map(o => (o.controlId === activeFastFilterId ? d : o));
          const ids = safeParse(_.get(view, 'advancedSetting.requiredcids'), 'array');

          // 被替换的字段如果曾配置为必填筛选，需要同步从 requiredcids 中移除。
          if (ids.includes(control.controlId)) {
            updateView(fastFilterData, {
              requiredcids: JSON.stringify(ids.filter(o => o !== control.controlId)),
            });
          } else {
            updateView(fastFilterData);
          }

          setActiveFastFilterId(data.controlId);
        }}
        style={{ width: '352px' }}
        offset={[0, 1]}
        classNamePopup="addControlDrop"
        comp={() => {
          const iconName = getIconByType(
            (worksheetControls.find(item => item.controlId === control.controlId) || {}).type,
            false,
          );
          return (
            <div className="inputBox mTop6" ref={boxConT}>
              {iconName ? <Icon icon={iconName} className="mRight12 Font18 textSecondary" /> : null}
              <div className="itemText">{control.controlName}</div>
              <Icon icon="arrow-down-border" className="mLeft12 Font14 textTertiary" />
            </div>
          );
        }}
      />
    </React.Fragment>
  );
}
