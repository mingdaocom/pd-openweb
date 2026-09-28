import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import { isOtherShowFeild } from 'src/utils/domain/control/filters';
import { fieldCanSort, getSortData } from 'src/utils/domain/control/sort';
import { CONTROL_FILTER_WHITELIST } from 'src/utils/domain/worksheet/filterConstants';
import { emitter } from 'src/utils/platform/browser/dom';

export default function ColumnHead(props) {
  const {
    worksheetId,
    selected,
    className,
    style,
    control,
    isAsc,
    isLast,
    changeSort,
    updateSheetColumnWidths,
    onShowFullValue,
  } = props;
  const isShowOtherField = isOtherShowFeild(control);
  const itemType = control.type === 30 ? control.sourceControlType : control.type;
  const filterWhiteKeys = _.flatten(
    Object.keys(CONTROL_FILTER_WHITELIST).map(key => CONTROL_FILTER_WHITELIST[key].keys),
  );
  const canFilter = _.includes(filterWhiteKeys, itemType);
  const canSort = fieldCanSort(itemType);
  const maskData =
    _.get(control, 'advancedSetting.datamask') === '1' && _.get(control, 'advancedSetting.isdecrypt') === '1';
  return (
    <BaseColumnHead
      canDrag={false}
      className={className}
      style={style}
      control={control}
      showDropdown
      isLast={isLast}
      isAsc={isAsc}
      changeSort={changeSort}
      updateSheetColumnWidths={updateSheetColumnWidths}
      renderPopup={({ closeMenu }) => ({
        style: { minWidth: 180 },
        items: [
          ...(canSort && !isShowOtherField
            ? getSortData(itemType, control).map(item => ({
                key: `sort-${item.value}`,
                icon: (
                  <i className={cx('icon', item.value === 1 ? 'icon-descending-order2' : 'icon-ascending-order2')} />
                ),
                label: item.text,
                onClick: () => {
                  changeSort(item.value === 2);
                  closeMenu();
                },
              }))
            : []),
          maskData && {
            key: 'decode',
            icon: <i className="icon icon-eye_off" />,
            label: _l('解码'),
            onClick: onShowFullValue,
          },
          canFilter &&
            !selected &&
            !isShowOtherField && {
              key: 'filter',
              icon: <i className="icon icon-worksheet_filter" />,
              label: _l('筛选'),
              onClick: () => {
                emitter.emit('FILTER_ADD_FROM_COLUMNHEAD' + worksheetId + 'trash', control);
                closeMenu();
              },
            },
        ].filter(Boolean),
      })}
    />
  );
}

ColumnHead.propTypes = {
  className: PropTypes.string,
  style: PropTypes.shape({}),
  isAsc: PropTypes.bool,
  isLast: PropTypes.bool,
  selected: PropTypes.bool,
  control: PropTypes.shape({
    controlId: PropTypes.any,
    sourceControlType: PropTypes.any,
    type: PropTypes.number,
  }),
  changeSort: PropTypes.func,
  updateSheetColumnWidths: PropTypes.func,
};
