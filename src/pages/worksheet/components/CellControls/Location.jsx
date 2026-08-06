import React, { forwardRef, useImperativeHandle } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import MDMap from 'ming-ui/components/amap/MDMap';
import { browserIsMobile } from 'src/utils/common';
import { isKeyBoardInputChar } from 'src/utils/common';
import EditableCellCon from '../EditableCellCon';

function Location(props, ref) {
  const { className, style, cell, editable, updateCell, onClick, updateEditingStatus, onValidate } = props;
  const { enumDefault2, advancedSetting, strDefault } = cell;
  const onlyCanAppUse = (strDefault || '00')[0] === '1';
  const isediting = props.isediting && !onlyCanAppUse;
  let { value } = cell;
  let locationData;

  try {
    locationData = JSON.parse(value);
  } catch (err) {
    console.log(err);
  }

  const getLocationInfo = () => {
    return locationData.title || locationData.address
      ? [locationData.title, locationData.address].filter(o => o).join(' ')
      : `${locationData.y}， ${locationData.x}`;
  };

  useImperativeHandle(ref, () => ({
    handleTableKeyDown(e) {
      switch (e.key) {
        case 'Escape':
          updateEditingStatus(false);
          break;
        default:
          if (!isKeyBoardInputChar(e.key)) {
            return;
          }

          updateEditingStatus(true);
          e.stopPropagation();
          break;
      }
    },
  }));

  return (
    <EditableCellCon
      onClick={onClick}
      className={cx(className, { canedit: editable && !onlyCanAppUse })}
      style={style}
      iconName="location"
      iconClassName="dateEditIcon"
      isediting={isediting}
      onIconClick={() => updateEditingStatus(true)}
    >
      <React.Fragment>
        {locationData && (
          <span className="worksheetCellPureString cellControl linelimit ellipsis" title={getLocationInfo()}>
            {getLocationInfo()}
          </span>
        )}
        {isediting && (
          <MDMap
            isMobile={browserIsMobile()}
            allowCustom={advancedSetting.allowcustom === '1'}
            distance={enumDefault2 ? parseInt(advancedSetting.distance, 10) : 0}
            defaultAddress={locationData || null}
            onAddressChange={({ lng, lat, address, name }) => {
              const newValue = JSON.stringify({ x: lng, y: lat, address, title: name });
              updateCell({
                value: newValue,
              });
              // 定位通过地图浮层即时提交，不走输入/失焦校验流程；必填报错后重新定位需主动重新校验，
              // 以清掉持久化在 cellErrors 中的旧错误，否则错误状态不会重置。
              if (typeof onValidate === 'function') {
                onValidate(newValue);
              }

              updateEditingStatus(false);
            }}
            onClose={() => {
              updateEditingStatus(false);
            }}
          />
        )}
      </React.Fragment>
    </EditableCellCon>
  );
}

Location.propTypes = {
  editable: PropTypes.bool,
  isediting: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  cell: PropTypes.shape({}),
  updateCell: PropTypes.func,
  onClick: PropTypes.func,
  updateEditingStatus: PropTypes.func,
  onValidate: PropTypes.func,
};

export default forwardRef(Location);
