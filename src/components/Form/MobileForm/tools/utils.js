import _ from 'lodash';
import { HAVE_VALUE_STYLE_WIDGET } from 'src/utils/domain/control/formEnum';
import { isEmptyValue } from 'src/utils/domain/control/number';
import { getTitleStyle } from 'src/utils/domain/control/style';
import { FIELD_SIZE_OPTIONS, TITLE_SIZE_OPTIONS } from './config';

export const fixWeixinInputBlurScroll = () => {
  if (!window.isWeiXin) return;

  setTimeout(() => {
    const activeElement = document.activeElement;
    const isActiveFormInput =
      activeElement &&
      _.includes(['INPUT', 'TEXTAREA', 'SELECT'], activeElement.tagName) &&
      activeElement.closest &&
      activeElement.closest('.customMobileFormContainer');

    if (isActiveFormInput) return;

    // 处理微信 webview 键盘收起后页面未撑开
    window.scrollTo(0, 0);
  }, 100);
};

// Mobile 下组件样式（不需要高度，动态设置size options）
export const getValueStyle = (data, isField = true) => {
  const item = Object.assign({}, data);
  let type = item.type;
  let { valuecolor, valuesize = '0', valuestyle = '0000' } = item.advancedSetting || {};
  let SIZE_OPTIONS = isField ? FIELD_SIZE_OPTIONS : TITLE_SIZE_OPTIONS;

  if (item.type === 30) {
    valuecolor = _.get(item, 'sourceControl.advancedSetting.valuecolor') || 'var(--color-text-primary)';
    valuesize = _.get(item, 'sourceControl.advancedSetting.valuesize') || '0';
    valuestyle = _.get(item, 'sourceControl.advancedSetting.valuestyle') || '0000';
    type = _.get(item, 'sourceControl.type');
  }

  return _.includes(HAVE_VALUE_STYLE_WIDGET, type)
    ? {
        type,
        size: SIZE_OPTIONS[valuesize],
        valueStyle: isEmptyValue(item.value)
          ? ''
          : `color: ${valuecolor || 'var(--color-text-primary)'};${getTitleStyle(valuestyle)}`,
      }
    : { type };
};

function parseCardStyle(control, value, type) {
  try {
    const parsedValue = safeParse(value) || {};
    return {
      ...getValueStyle(
        {
          ...control,
          type: 3,
          value: '_',
          advancedSetting: {
            ...control.advancedSetting,
            valuecolor: parsedValue.color || 'none',
            valuesize: parsedValue.size || (type === 'recordTitle' ? 1 : undefined),
            valuestyle: parsedValue.style,
          },
        },
        false,
      ),
      direction: parsedValue.direction,
    };
  } catch (err) {
    console.log(err);
    return {};
  }
}

export const getRecordCardStyle = control => {
  const {
    cardtitlestyle, // 字段标题 direction: 1 水平 2 垂直
    cardvaluestyle, // 字段值
    rowtitlestyle, // 记录标题
    cardstyle,
  } = control.advancedSetting;
  const cardStyle = safeParse(cardstyle);

  return {
    controlTitleStyle: parseCardStyle(control, cardtitlestyle, ''),
    controlValueStyle: parseCardStyle(control, cardvaluestyle, ''),
    recordTitleStyle: parseCardStyle(control, rowtitlestyle, 'recordTitle'),
    cardStyle: {
      backgroundColor: cardStyle.background,
      borderColor: cardStyle.bordercolor,
    },
  };
};
