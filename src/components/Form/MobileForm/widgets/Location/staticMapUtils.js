const STATIC_MAP_URL = '/_AMapService/v3/staticmap';
const MAX_STATIC_MAP_SIZE = 1024;

const isValidNumber = value => value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value));

export function getStaticMapUrl({ x, y, width, height }) {
  if (![x, y, width, height].every(isValidNumber) || Number(width) <= 0 || Number(height) <= 0) {
    return '';
  }

  const mapWidth = Math.min(Math.round(Number(width)), MAX_STATIC_MAP_SIZE);
  const mapHeight = Math.min(Math.round(Number(height)), MAX_STATIC_MAP_SIZE);

  return `${STATIC_MAP_URL}?location=${x},${y}&zoom=17&size=${mapWidth}*${mapHeight}&scale=2&markers=mid,,A:${x},${y}`;
}
