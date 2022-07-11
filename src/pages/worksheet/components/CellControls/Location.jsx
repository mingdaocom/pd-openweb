import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MDMap from 'ming-ui/components/amap/MDMap';
import MapLoader from 'ming-ui/components/amap/MapLoader';
import EditableCellCon from '../EditableCellCon';
import { browserIsMobile } from 'src/util';

function Location(props) {
  const { className, style, cell, editable, recordId, isediting, updateCell, onClick, updateEditingStatus } = props;
  const { enumDefault2, advancedSetting, strDefault } = cell;
  const onlyCanAppUse = (strDefault || '00')[0] === '1';
  let { value } = cell;
  let locationData;
  try {
    locationData = JSON.parse(value);
  } catch (err) {}

  const getLocationInfo = () => {
    return locationData.title || locationData.address
      ? [locationData.title, locationData.address].filter(o => o).join(' ')
      : `${_l('经度：%0', locationData.x)} ${_l('纬度：%0', locationData.y)}`;
  };

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
            distance={enumDefault2 ? parseInt(advancedSetting.distance, 10) : 0}
            defaultAddress={locationData ? { lng: locationData.x, lat: locationData.y } : null}
            onAddressChange={({ lng, lat, address, name }) => {
              updateCell({
                value: JSON.stringify({ x: lng, y: lat, address, title: name }),
              });
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
};

export default Location;
