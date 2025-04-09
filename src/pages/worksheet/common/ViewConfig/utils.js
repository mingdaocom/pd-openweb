import _ from 'lodash';

export const getCoverStyle = data => {
  const coverStyle = safeParse(_.get(data, 'advancedSetting.coverstyle'));
  const style = _.isEmpty(coverStyle) ? _.get(data, 'coverType') : _.get(coverStyle, 'style');

  return {
    coverPosition: _.isEmpty(coverStyle) ? _.get(data, 'advancedSetting.coverposition') : _.get(coverStyle, 'position'),
    coverType: String(style) === '1' ? 0 : style,
    coverFillType: _.get(coverStyle, 'type') || (String(style) === '1' ? 1 : 0),
  };
};
