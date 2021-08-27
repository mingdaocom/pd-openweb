import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import MDMap from 'ming-ui/components/amap/MDMap';
import EditableCellCon from '../EditableCellCon';
import { browserIsMobile } from 'src/util';

function Location(props) {
  const { className, style, cell, editable, isediting, updateCell, onClick, updateEditingStatus } = props;
  const { enumDefault2, advancedSetting } = cell;
  let { value } = cell;
  let locationData;
  try {
    locationData = JSON.parse(value);
  } catch (err) {}
  return (
    <EditableCellCon
      onClick={onClick}
      className={cx(className, { canedit: editable })}
      style={style}
      iconName="location"
      iconClassName="dateEditIcon"
      isediting={isediting}
      onIconClick={() => updateEditingStatus(true)}
    >
      <React.Fragment>
        {locationData && (
          <span
            className="worksheetCellPureString cellControl linelimit ellipsis"
            title={`${locationData.title} ${locationData.address}`}
          >{`${locationData.title} ${locationData.address}`}</span>
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
