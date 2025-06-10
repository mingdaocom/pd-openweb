import { renderText as renderCellText } from 'src/utils/control';

export function parseRecord(record = {}, mapViewConfig, controls) {
  const titleField = controls.find(l => l.attribute === 1) || {};
  const titleValue = renderCellText(
    { ...titleField, value: titleField.controlId ? record[titleField.controlId] : undefined },
    { noMask: _.get(titleField, 'advancedSetting.datamask') !== '1' },
  );

  const abstractField = controls.find(l => l.controlId === mapViewConfig.abstract) || {};
  const abstractValue = record[abstractField.controlId]
    ? renderCellText({ ...abstractField, value: abstractField.controlId ? record[abstractField.controlId] : undefined })
    : '';

  return {
    position: safeParse(record[mapViewConfig.positionId]),
    title: titleValue || _l('未命名'),
    summary: record[mapViewConfig.summaryId],
    cover: record[mapViewConfig.coverId],
    record,
    abstract: abstractValue,
  };
}

export function calculateZoomLevel(coordinates, mapWidth, mapHeight, paddingPercentage = 10) {
  if (coordinates.length < 2) {
    return 0;
  }

  var maxLat = -90;
  var minLat = 90;
  var maxLng = -180;
  var minLng = 180;

  for (var i = 0; i < coordinates.length; i++) {
    var lat = coordinates[i][0];
    var lng = coordinates[i][1];

    if (lat > maxLat) {
      maxLat = lat;
    }
    if (lat < minLat) {
      minLat = lat;
    }
    if (lng > maxLng) {
      maxLng = lng;
    }
    if (lng < minLng) {
      minLng = lng;
    }
  }

  var latRange = maxLat - minLat;
  var lngRange = maxLng - minLng;

  var zoomLat = Math.log2(mapHeight / (latRange * (1 + paddingPercentage / 100)));
  var zoomLng = Math.log2(mapWidth / (lngRange * (1 + paddingPercentage / 100)));

  var zoomLevel = Math.floor(Math.min(zoomLat, zoomLng));

  return zoomLevel;
}

export function calculatePoleCenter(coordinates) {
  if (coordinates.length === 0) {
    return;
  }

  var minLatitude = 90;
  var maxLatitude = -90;
  var minLongitude = 180;
  var maxLongitude = -180;

  for (var i = 0; i < coordinates.length; i++) {
    var latitude = coordinates[i][0];
    var longitude = coordinates[i][1];

    if (latitude < minLatitude) {
      minLatitude = latitude;
    }
    if (latitude > maxLatitude) {
      maxLatitude = latitude;
    }
    if (longitude < minLongitude) {
      minLongitude = longitude;
    }
    if (longitude > maxLongitude) {
      maxLongitude = longitude;
    }
  }

  var centerLatitude = (minLatitude + maxLatitude) / 2;
  var centerLongitude = (minLongitude + maxLongitude) / 2;

  return [centerLatitude, centerLongitude];
}
