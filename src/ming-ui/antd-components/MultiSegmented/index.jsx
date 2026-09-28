import React from 'react';
import theme from 'antd/es/theme';
import { arrayOf, func, node, number, oneOfType, shape, string } from 'prop-types';
import Segmented from '../Segmented';

const DESELECTED_VALUE = '__multi_segmented_deselected__';
const BASE_GROUP_STYLE = {
  display: 'flex',
  gap: 2,
  padding: 4,
};
const ITEM_STYLE = { flex: 1 };
const SEGMENTED_STYLE = { width: '100%', padding: 0, background: 'transparent' };

const isToggleKey = key => key === 'Enter' || key === ' ';

export default function MultiSegmented({ className, options, value = [], onChange }) {
  const { token } = theme.useToken();
  const trackBg = token.Segmented?.trackBg || token.colorBgLayout;

  return (
    <div className={className} style={{ ...BASE_GROUP_STYLE, background: trackBg, borderRadius: token.borderRadius }}>
      {options.map(option => {
        const selected = value.includes(option.value);
        const toggle = () => onChange(option.value, !selected);

        return (
          <div
            key={option.value}
            className="hap-multi-segmented-item"
            style={ITEM_STYLE}
            onPointerDown={event => {
              event.preventDefault();
              toggle();
            }}
            onKeyDown={event => {
              if (isToggleKey(event.key)) {
                event.preventDefault();
                toggle();
              }
            }}
          >
            <Segmented
              block
              style={SEGMENTED_STYLE}
              value={selected ? option.value : DESELECTED_VALUE}
              options={[option]}
            />
          </div>
        );
      })}
    </div>
  );
}

MultiSegmented.propTypes = {
  className: string,
  options: arrayOf(
    shape({
      icon: node,
      label: node,
      value: oneOfType([string, number]).isRequired,
    }),
  ).isRequired,
  value: arrayOf(oneOfType([string, number])),
  onChange: func.isRequired,
};
