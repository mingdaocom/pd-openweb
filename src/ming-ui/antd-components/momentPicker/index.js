import DatePicker from 'antd/es/date-picker';
import momentGenerateConfig from '@rc-component/picker/generate/moment';
import dayjs from 'dayjs';
import moment from 'moment';
import './index.less';

const MomentDatePicker = DatePicker.generatePicker(momentGenerateConfig);

const isEmptyValue = value => value === undefined || value === null || value === '';

const DEFAULT_AUTO_ADJUST_OVERFLOW = { adjustX: true, adjustY: true, shiftX: true, shiftY: true };
const PICKER_PLACEMENTS = {
  bottomLeft: { points: ['tl', 'bl'], offset: [0, 4] },
  bottomRight: { points: ['tr', 'br'], offset: [0, 4] },
  topLeft: { points: ['bl', 'tl'], offset: [0, -4] },
  topRight: { points: ['br', 'tr'], offset: [0, -4] },
};

export const getPickerBuiltinPlacements = autoAdjustOverflow => {
  const overflow =
    autoAdjustOverflow === false
      ? { adjustX: false, adjustY: false }
      : {
          ...DEFAULT_AUTO_ADJUST_OVERFLOW,
          ...(typeof autoAdjustOverflow === 'object' ? autoAdjustOverflow : {}),
        };

  return Object.keys(PICKER_PLACEMENTS).reduce(
    (result, placement) => ({
      ...result,
      [placement]: { ...PICKER_PLACEMENTS[placement], overflow },
    }),
    {},
  );
};

const getFormats = format => {
  if (Array.isArray(format)) {
    return format.filter(item => typeof item === 'string');
  }

  return typeof format === 'string' ? [format] : [];
};

const toMomentValue = (value, format) => {
  if (Array.isArray(value)) {
    const values = value.map(item => toMomentValue(item, format));
    return values.some(Boolean) ? values : null;
  }

  if (isEmptyValue(value)) {
    return null;
  }

  if (moment.isMoment(value)) {
    return value;
  }

  if (dayjs.isDayjs(value)) {
    return value.isValid() ? moment(value.valueOf()) : null;
  }

  if (value instanceof Date) {
    const parsedDate = moment(value);
    return parsedDate.isValid() ? parsedDate : null;
  }

  if (typeof value === 'string') {
    const parsedByFormat = getFormats(format)
      .map(item => moment(value, item))
      .find(item => item.isValid());

    if (parsedByFormat) {
      return parsedByFormat;
    }
  }

  const parsedValue = moment(value);
  return parsedValue.isValid() ? parsedValue : null;
};

const toMomentShowTime = (showTime, format) => {
  if (!showTime || typeof showTime !== 'object') {
    return showTime;
  }

  return ['defaultValue', 'defaultOpenValue'].reduce(
    (result, key) => {
      if (key in result) {
        result[key] = toMomentValue(result[key], format);
      }

      return result;
    },
    { ...showTime },
  );
};

const toMomentInfo = info => {
  if (!info || typeof info !== 'object' || !info.from) {
    return info;
  }

  return {
    ...info,
    from: toMomentValue(info.from),
  };
};

export const getPickerValueProps = props => {
  const {
    autoAdjustOverflow = true,
    builtinPlacements,
    value,
    defaultValue,
    defaultPickerValue,
    showTime,
    onChange,
    onOk,
    onCalendarChange,
    onPanelChange,
    disabledDate,
    disabledTime,
    format,
    ...restProps
  } = props;
  const valueProps = {
    ...restProps,
    format,
  };

  if (builtinPlacements) {
    valueProps.builtinPlacements = builtinPlacements;
  } else {
    valueProps.builtinPlacements = getPickerBuiltinPlacements(autoAdjustOverflow);
  }

  if ('value' in props) {
    valueProps.value = toMomentValue(value, format);
  }

  if ('defaultValue' in props) {
    valueProps.defaultValue = toMomentValue(defaultValue, format);
  }

  if ('defaultPickerValue' in props) {
    const nextDefaultPickerValue = toMomentValue(defaultPickerValue, format);

    if (nextDefaultPickerValue !== null) {
      valueProps.defaultPickerValue = nextDefaultPickerValue;
    }
  }

  if ('showTime' in props) {
    valueProps.showTime = toMomentShowTime(showTime, format);
  }

  if (onChange) {
    valueProps.onChange = (date, dateString) => onChange(toMomentValue(date), dateString);
  }

  if (onOk) {
    valueProps.onOk = date => onOk(toMomentValue(date));
  }

  if (onCalendarChange) {
    valueProps.onCalendarChange = (dates, dateStrings, info) =>
      onCalendarChange(toMomentValue(dates), dateStrings, toMomentInfo(info));
  }

  if (onPanelChange) {
    valueProps.onPanelChange = (date, mode) => onPanelChange(toMomentValue(date), mode);
  }

  if (disabledDate) {
    valueProps.disabledDate = (current, info) => disabledDate(toMomentValue(current), toMomentInfo(info));
  }

  if (disabledTime) {
    valueProps.disabledTime = (current, ...args) =>
      disabledTime(toMomentValue(current), ...args.map(arg => toMomentInfo(arg)));
  }

  return valueProps;
};

export const MomentTimePicker = MomentDatePicker.TimePicker;
export default MomentDatePicker;
