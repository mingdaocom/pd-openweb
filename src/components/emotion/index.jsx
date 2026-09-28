import React, { useCallback, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import twemoji from 'twemoji';
import { ConfigProvider, Popover, Segmented } from 'ming-ui/antd-components';
import { EMOTION_GROUP_IDS, getEmotionGroups, getEmotionImageSrc } from './data';
import { addEmotionHistory, readEmotionHistory, saveEmotionHistory } from './history';
import animalsIcon from './images/animals.png';
import aruIcon from './images/aru.png';
import bearIcon from './images/bear.png';
import defaultIcon from './images/default.png';
import foodsIcon from './images/foods.png';
import historyIcon from './images/history.png';
import objectsIcon from './images/objects.png';
import smileysIcon from './images/smileys.png';
import { insertEmotionAtCaret, resolvePopupContainer } from './input';
import { TWEMOJI_OPTIONS } from './parseEmotion';
import { createEmotionSelection, getVisibleEmotionGroups } from './picker';
import './emotion.less';

const GROUP_ICONS = {
  [EMOTION_GROUP_IDS.HISTORY]: historyIcon,
  [EMOTION_GROUP_IDS.CLASSIC]: defaultIcon,
  [EMOTION_GROUP_IDS.PEOPLE]: smileysIcon,
  [EMOTION_GROUP_IDS.NATURE]: animalsIcon,
  [EMOTION_GROUP_IDS.FOOD]: foodsIcon,
  [EMOTION_GROUP_IDS.OBJECTS]: objectsIcon,
  [EMOTION_GROUP_IDS.BEAR]: bearIcon,
  [EMOTION_GROUP_IDS.ARU]: aruIcon,
};
const SEGMENTED_THEME = {
  components: {
    Segmented: {
      borderRadius: 0,
      controlHeight: 41,
      controlPaddingHorizontal: 8,
      itemSelectedBg: 'var(--color-background-disabled)',
      trackBg: 'transparent',
    },
  },
};

function EmotionItem({ group, isHistory, item, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const label = item.code || _l('表情');
  const isBear = group.id === EMOTION_GROUP_IDS.BEAR;

  return (
    <button
      type="button"
      className={cx('emotionPickerItem', {
        emotionPickerEmojiItem: group.type === 'emoji',
        emotionPickerStickerItem: group.type === 'sticker' && !isHistory,
      })}
      aria-label={label}
      title={label}
      onClick={() => onSelect(group, item)}
      onMouseDown={event => event.preventDefault()}
      onMouseEnter={() => isBear && setHovered(true)}
      onMouseLeave={() => isBear && setHovered(false)}
    >
      {group.type === 'emoji' ? (
        <span dangerouslySetInnerHTML={{ __html: twemoji.parse(item.code, TWEMOJI_OPTIONS) }} />
      ) : (
        <img alt={label} src={getEmotionImageSrc(group, item, { animated: isBear && hovered })} />
      )}
    </button>
  );
}

EmotionItem.propTypes = {
  group: PropTypes.object.isRequired,
  isHistory: PropTypes.bool.isRequired,
  item: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default function Emotion({
  align,
  children,
  closeOnSelect = true,
  defaultGroup,
  hideClassic = false,
  history = true,
  historyKey,
  historySize = 40,
  input,
  onOpenChange,
  onSelect,
  placement = 'bottomLeft',
  popupContainer,
  showAru = false,
  showBear = false,
  zIndex,
}) {
  const groups = getEmotionGroups();
  const [historyItems, setHistoryItems] = useState(() =>
    history ? readEmotionHistory(groups, historyKey, { migrateLegacy: false }) : [],
  );
  const [open, setOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(
    defaultGroup || (historyItems.length ? EMOTION_GROUP_IDS.HISTORY : EMOTION_GROUP_IDS.CLASSIC),
  );
  const { visibleGroups, visibleHistoryItems } = getVisibleEmotionGroups(groups, historyItems, {
    hideClassic,
    history,
    showAru,
    showBear,
  });
  const fallbackGroup = visibleGroups.find(group => group.id === EMOTION_GROUP_IDS.CLASSIC) || visibleGroups[0];
  const activeGroup = visibleGroups.find(group => group.id === selectedGroup) || fallbackGroup;
  const isHistoryGroup = activeGroup.id === EMOTION_GROUP_IDS.HISTORY;
  const activeItems = isHistoryGroup ? visibleHistoryItems : activeGroup.content;

  const handleOpenChange = useCallback(
    nextOpen => {
      if (nextOpen && history) {
        setHistoryItems(readEmotionHistory(getEmotionGroups(), historyKey));
      }

      setOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [history, historyKey, onOpenChange],
  );

  const handleSelect = useCallback(
    (displayGroup, item) => {
      const sourceGroup = groups.find(group => group.id === item.groupId) || displayGroup;
      const selection = createEmotionSelection(sourceGroup, item);

      onSelect?.(selection);

      if (input && selection.text) {
        insertEmotionAtCaret(input, selection.text);
      }

      if (history) {
        const nextHistory = addEmotionHistory(historyItems, item, historySize);

        setHistoryItems(nextHistory);
        saveEmotionHistory(nextHistory, historyKey);
      }

      if (closeOnSelect) {
        setOpen(false);
        onOpenChange?.(false);
      }
    },
    [closeOnSelect, groups, history, historyItems, historyKey, historySize, input, onOpenChange, onSelect],
  );

  const getPopupContainer = useCallback(() => resolvePopupContainer(popupContainer), [popupContainer]);

  const content = (
    <div className="emotionPicker">
      <div className="emotionPickerContent" role="group" aria-label={activeGroup.label}>
        {activeItems.map(item => {
          const sourceGroup = groups.find(group => group.id === item.groupId) || activeGroup;
          return (
            <EmotionItem
              key={item.id}
              group={sourceGroup}
              isHistory={isHistoryGroup}
              item={item}
              onSelect={handleSelect}
            />
          );
        })}
      </div>
      <div className="emotionPickerFooter">
        <ConfigProvider theme={SEGMENTED_THEME}>
          <Segmented
            aria-label={_l('表情分类')}
            options={visibleGroups.map(group => ({
              value: group.id,
              icon: <img className="emotionPickerGroupIcon" alt={group.label} src={GROUP_ICONS[group.id]} />,
              title: group.label,
            }))}
            value={activeGroup.id}
            onChange={setSelectedGroup}
          />
        </ConfigProvider>
      </div>
    </div>
  );

  return (
    <Popover
      arrow={{ pointAtCenter: true }}
      align={align}
      content={content}
      getPopupContainer={getPopupContainer}
      noPadding
      styles={{ container: { overflow: 'hidden' } }}
      open={open}
      placement={placement}
      trigger="click"
      zIndex={zIndex}
      onOpenChange={handleOpenChange}
    >
      {children}
    </Popover>
  );
}

Emotion.propTypes = {
  align: PropTypes.object,
  children: PropTypes.element.isRequired,
  closeOnSelect: PropTypes.bool,
  defaultGroup: PropTypes.string,
  hideClassic: PropTypes.bool,
  history: PropTypes.bool,
  historyKey: PropTypes.string,
  historySize: PropTypes.number,
  input: PropTypes.any,
  onOpenChange: PropTypes.func,
  onSelect: PropTypes.func,
  placement: PropTypes.string,
  popupContainer: PropTypes.any,
  showAru: PropTypes.bool,
  showBear: PropTypes.bool,
  zIndex: PropTypes.number,
};
