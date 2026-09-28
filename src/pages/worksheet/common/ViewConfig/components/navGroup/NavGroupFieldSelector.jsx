import React from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Button, Tooltip } from 'ming-ui/antd-components';
import AddCondition from 'src/pages/worksheet/common/WorkSheetFilter/components/AddCondition';
import { filterOnlyShowField } from 'src/utils/domain/control/filters';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { setSysWorkflowTimeControlFormat } from 'src/utils/services/worksheet/calendar';
import bgNavGroups from './img/bgNavGroups.png';
import { canNavGroup } from './util';

export default function NavGroupFieldSelector({
  filterData = {},
  hasSelection,
  worksheetControls,
  worksheetId,
  currentSheetInfo,
  showAddCondition,
  onAdd,
  onClear,
}) {
  const renderAdd = comp => (
    <AddCondition
      renderInParent
      className="addControl"
      columns={setSysWorkflowTimeControlFormat(
        filterOnlyShowField(worksheetControls).filter(control => canNavGroup(control, worksheetId)),
        currentSheetInfo.switches || [],
      )}
      onAdd={onAdd}
      style={{ width: '440px' }}
      offset={[0, 0]}
      classNamePopup="addControlDrop"
      comp={comp}
      from="fastFilter"
      defaultVisible={showAddCondition}
    />
  );

  if (!hasSelection) {
    return (
      <div className="noData">
        <div className="cover">
          <img src={bgNavGroups} alt="" />
        </div>
        <h6>{_l('筛选列表')}</h6>
        <p className="text textSecondary">{_l('将所选字段选项以列表的形式显示在视图左侧，帮助用户快速查看记录。')}</p>
        {renderAdd(() => (
          <Button wide color="primary" variant="solid" size="large" icon={<Icon icon="add" className="Font16" />}>
            {_l('选择字段')}
          </Button>
        ))}
      </div>
    );
  }

  const selectedControl = worksheetControls.find(item => item.controlId === filterData.controlId) || {};
  const iconName = filterData.isErr ? 'error1' : getIconByType(selectedControl.type, false);

  return (
    <React.Fragment>
      <div className="title mTop25 textPrimary Bold">
        {_l('筛选字段')}
        <span className="cancel Right" onClick={onClear}>
          {_l('清除')}
        </span>
      </div>
      {renderAdd(() => (
        <div className={cx('inputBox mTop6', { Red: filterData.isErr })}>
          {iconName && (
            <Icon
              icon={iconName}
              className={cx('mRight12 Font18 ', {
                Red: filterData.isErr,
                textSecondary: !filterData.isErr,
              })}
            />
          )}
          <div className="itemText">
            {filterData.isErr ? (
              <Tooltip placement="bottom" title={_l('ID: %0', filterData.controlId)}>
                <span>{_l('该字段已删除')}</span>
              </Tooltip>
            ) : (
              filterData.controlName
            )}
          </div>
          <Icon icon="arrow-down-border" className="mLeft12 textTertiary" />
        </div>
      ))}
    </React.Fragment>
  );
}
