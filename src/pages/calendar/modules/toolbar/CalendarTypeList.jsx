import React from 'react';
import { Dropdown, Spin } from 'ming-ui/antd-components';

const getTaskTypeItems = () => [
  { key: '1', label: _l('参与的任务') },
  { key: '2', label: _l('负责的任务') },
  { key: '3', label: _l('托付的任务') },
];

function CalendarTypeCheckbox({ checked, label, onChange }) {
  const toggleChecked = () => onChange(!checked);

  const handleKeyDown = event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    toggleChecked();
  };

  return (
    <span
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={`iconTickStyle ${checked ? 'icon-calendar-check' : 'icon-calendar-nocheck'} textSecondary`}
      tabIndex={0}
      onClick={toggleChecked}
      onKeyDown={handleKeyDown}
    />
  );
}

function CalendarTypeRow({ checked, colorClassName, id, name, onChange }) {
  return (
    <li id={id}>
      <i className={`${colorClassName} iconTickM`} />
      <CalendarTypeCheckbox checked={checked} label={name} onChange={onChange} />
      <span className="textPrimary">{name}</span>
    </li>
  );
}

export default function CalendarTypeList({
  categories,
  filterTaskType,
  isLoading,
  isTaskCalendar,
  isWorkCalendar,
  onCategoryChange,
  onFilterTaskTypeChange,
  onTaskCalendarChange,
  onWorkCalendarChange,
  selectedCategoryIds,
}) {
  const taskTypeItems = getTaskTypeItems();
  const taskTypeName = taskTypeItems.find(item => item.key === String(filterTaskType))?.label;

  return (
    <ul id="sortable">
      <CalendarTypeRow
        checked={isWorkCalendar}
        colorClassName="iconTickBlue"
        id="workCalendar"
        name={_l('工作日程')}
        onChange={onWorkCalendarChange}
      />
      <li id="taskCalendar">
        <i className="iconTickGreen iconTickM" />
        <CalendarTypeCheckbox checked={isTaskCalendar} label={_l('任务')} onChange={onTaskCalendarChange} />
        <Dropdown
          trigger={['click']}
          menu={{
            items: taskTypeItems,
            selectable: true,
            selectedKeys: [String(filterTaskType)],
            onClick: ({ key }) => onFilterTaskTypeChange(key),
          }}
        >
          <span id="filterTaskType" data-tasktype={filterTaskType}>
            <span className="filterTaskTypeName textPrimary">{taskTypeName}</span>
            <i className="icon-arrow-down-border textPrimary" />
          </span>
        </Dropdown>
      </li>
      {categories.map(category => (
        <CalendarTypeRow
          key={category.catID}
          checked={selectedCategoryIds.includes(String(category.catID))}
          colorClassName={category.colorClassName}
          id={undefined}
          name={category.catName}
          onChange={checked => onCategoryChange(String(category.catID), checked)}
        />
      ))}
      {isLoading && (
        <li className="calendarTypeLoading">
          <Spin size="small" />
        </li>
      )}
    </ul>
  );
}
