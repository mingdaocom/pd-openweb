import React from 'react';
import { arrayOf, func, string } from 'prop-types';
import { Segmented } from 'ming-ui/antd-components';

const HIDDEN_SEGMENTED_VALUE = '__hidden_weekday__';
const WEEKDAY_SEGMENTED_GROUP_STYLE = {
  display: 'flex',
  gap: 2,
  marginLeft: 26,
  padding: 4,
  background: 'var(--color-background-secondary)',
  borderRadius: 4,
};
const WEEKDAY_SEGMENTED_STYLE = { flex: 1, padding: 0, background: 'transparent' };

export const toggleHiddenDay = (hiddenDays, day, dayCount) => {
  const nextHiddenDays = hiddenDays.includes(day) ? hiddenDays.replace(day, '') : `${hiddenDays}${day}`;

  return nextHiddenDays.length < dayCount ? nextHiddenDays : hiddenDays;
};

export default function WeekdaySegmented({ className, weekdays, hiddenDays = '', onChange }) {
  return (
    <div className={className} style={WEEKDAY_SEGMENTED_GROUP_STYLE}>
      {weekdays.map((label, index) => {
        const value = String(index + 1);
        const isHidden = hiddenDays.includes(value);

        return (
          <Segmented
            key={value}
            block
            style={WEEKDAY_SEGMENTED_STYLE}
            options={[{ label, value }]}
            value={isHidden ? HIDDEN_SEGMENTED_VALUE : value}
            onClick={() => {
              const nextHiddenDays = toggleHiddenDay(hiddenDays, value, weekdays.length);

              if (nextHiddenDays !== hiddenDays) {
                onChange(nextHiddenDays);
              }
            }}
          />
        );
      })}
    </div>
  );
}

WeekdaySegmented.propTypes = {
  className: string,
  weekdays: arrayOf(string),
  hiddenDays: string,
  onChange: func,
};
