import _ from 'lodash';
import { browserIsMobile } from 'src/utils/common';

export const getCoverStyle = data => {
  const coverStyle = safeParse(_.get(data, 'advancedSetting.coverstyle'));
  const style = _.isEmpty(coverStyle) ? _.get(data, 'coverType') : _.get(coverStyle, 'style');

  if (browserIsMobile() && data.viewType === 6) {
    return { coverPosition: '0', coverType: 0, coverFillType: 0 };
  }

  return {
    coverPosition: _.isEmpty(coverStyle) ? _.get(data, 'advancedSetting.coverposition') : _.get(coverStyle, 'position'),
    coverType: String(style) === '1' ? 0 : style,
    coverFillType: _.get(coverStyle, 'type') || (String(style) === '1' ? 1 : 0),
  };
};
