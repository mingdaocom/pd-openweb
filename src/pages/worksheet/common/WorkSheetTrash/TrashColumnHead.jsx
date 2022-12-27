import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Menu, MenuItem } from 'ming-ui';
import { emitter, fieldCanSort, getSortData } from 'worksheet/util';
import { CONTROL_FILTER_WHITELIST } from 'worksheet/common/WorkSheetFilter/enum';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import { isOtherShowFeild } from 'src/pages/widgetConfig/util';
import _ from 'lodash';

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
      className={className}
      style={style}
      control={control}
      showDropdown
      isLast={isLast}
      isAsc={isAsc}
      changeSort={changeSort}
      updateSheetColumnWidths={updateSheetColumnWidths}
      renderPopup={({ closeMenu }) => (
        <Menu className="worksheetColumnHeadMenu" style={{ width: 180 }} onClickAway={closeMenu}>
          {canSort &&
            !isShowOtherField &&
            getSortData(itemType, control).map(item => (
              <MenuItem
                key={item.value}
                onClick={() => {
                  changeSort(item.value === 2);
                  closeMenu();
                }}
              >
                <i className={cx('icon', item.value === 1 ? 'icon-descending-order2' : 'icon-ascending-order2')}></i>
                {item.text}
              </MenuItem>
            ))}
          {maskData && (
            <MenuItem onClick={onShowFullValue}>
              <i className="icon icon-eye_off"></i>
              {_l('解密')}
            </MenuItem>
          )}
          {canFilter && !selected && !isShowOtherField && (
            <MenuItem
              onClick={() => {
                emitter.emit('FILTER_ADD_FROM_COLUMNHEAD' + worksheetId + 'trash', control);
                closeMenu();
              }}
            >
              <i className="icon icon-worksheet_filter"></i>
              {_l('筛选')}
            </MenuItem>
          )}
        </Menu>
      )}
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
