import _ from 'lodash';
import { CARD_WIDTH_SETTING } from './config';
import { getCoverStyle } from './utils';

export function getCardWidth(view) {
  const cardwidth = _.get(view, 'advancedSetting.cardwidth');

  if (!cardwidth) return undefined;

  const cardWidth = CARD_WIDTH_SETTING[cardwidth] || Number(cardwidth);
  const positionIsLeftOrRight =
    Number(cardwidth) < 5 &&
    ['0', '1'].includes(_.get(getCoverStyle(view), 'coverPosition') || (view.viewType === 3 ? '2' : '1'));

  return positionIsLeftOrRight ? cardWidth + 96 : cardWidth;
}
