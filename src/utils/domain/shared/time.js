/**
 * 将毫秒时长格式化为本地化的分秒文本，不足一秒按一秒显示。
 */
export function formatElapsedDuration(milliseconds) {
  if (!milliseconds || milliseconds < 0) return '';
  const seconds = Math.max(1, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0) return _l('%0分%1秒', minutes, remainingSeconds);
  return _l('%0秒', remainingSeconds);
}
