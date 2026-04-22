import React, { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react';
import { get } from 'lodash';
import { Icon } from 'ming-ui';
import { compatibleMDJS } from 'src/utils/project';
import composite from '../../assets/composite.png';
import paste from '../../assets/paste.png';
import photo from '../../assets/photo.png';
import voice from '../../assets/voice.png';
import { COMPOSITE_INPUT_TYPE } from '../../core/config';
import { useVoice } from '../VoiceProvider';
import './index.less';

const creationTypesList = [
  { type: COMPOSITE_INPUT_TYPE.PHOTO, icon: photo, title: _l('拍照录入') },
  { type: COMPOSITE_INPUT_TYPE.VOICE, icon: voice, title: _l('语音录入') },
  {
    type: COMPOSITE_INPUT_TYPE.PASTE,
    icon: paste,
    title: _l('文本黏贴'),
    hidden: !window.isMingDaoApp,
  },
  { type: COMPOSITE_INPUT_TYPE.COMPOSITE, icon: composite, title: _l('组合录入') },
];

const MingoCreation = forwardRef((props, ref) => {
  const { voiceInputRef, compositeInputRef, onPhotoRecognition = () => {} } = props;

  const { error, onAbort, onGenerateRecord } = useVoice();

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useImperativeHandle(ref, () => ({
    open() {
      setMounted(true);
      setVisible(true);
      setAnimate(true);
    },
    close() {
      // 走动画关闭
      setAnimate(true);
      setVisible(false);
    },
    closeImmediate,
  }));

  const handleAnimationEnd = () => {
    if (!visible && animate) {
      // 动画结束后卸载
      setMounted(false);
    }
  };

  const handleCreateItemClick = (e, type) => {
    e.stopPropagation();
    switch (type) {
      case COMPOSITE_INPUT_TYPE.PHOTO:
        onPhotoRecognition();
        break;
      case COMPOSITE_INPUT_TYPE.PASTE:
        if (window.isMingDaoApp) {
          compatibleMDJS('getPasteBoard', {
            type: 0,
            success: res => {
              const text = res?.text?.trim();
              if (text) {
                onGenerateRecord({ text });
              } else alert(_l('粘贴板为空，重新检查'), 3);
            },
            cancel: res => {
              const { code } = res;
              if (Number(code) === 0) alert(_l('粘贴板未获取到数据，请重试'), 3);
            },
          });
          closeImmediate();
          return;
        }
        break;
      case COMPOSITE_INPUT_TYPE.VOICE:
        voiceInputRef.current?.open();
        closeImmediate();
        break;
      case COMPOSITE_INPUT_TYPE.COMPOSITE:
        compositeInputRef.current?.open();
        closeImmediate();
        break;
      default:
        break;
    }
  };

  // 立即关闭
  const closeImmediate = () => {
    setAnimate(false);
    setVisible(false);
    setMounted(false);
  };

  useEffect(() => {
    return () => {
      onAbort();
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="mingoCreationWrapper toastWrapper">
      <div className="toastMask" onAnimationEnd={handleAnimationEnd} onClick={() => setVisible(false)}></div>
      <div className="toastContent">
        <div
          className={`creationTypesList ${visible ? 'fadeIn' : 'fadeOut'}`}
          onAnimationEnd={handleAnimationEnd}
          onClick={() => setVisible(false)}
        >
          {creationTypesList
            .filter(({ hidden }) => !hidden)
            .filter(
              ({ type }) =>
                (type === COMPOSITE_INPUT_TYPE.VOICE &&
                  !error &&
                  !!get(md, 'global.Account.accountId') &&
                  md.global.SysSettings.enableVoiceToText) ||
                type !== COMPOSITE_INPUT_TYPE.VOICE,
            )
            .map(({ type, icon, title }) => (
              <div className="createItem" onClick={e => handleCreateItemClick(e, type)} key={type}>
                <img className="typeIcon" src={icon} alt={title} />
                <div className="title">{title}</div>
              </div>
            ))}
        </div>
      </div>
      <div
        className={`closeBtn ${visible ? 'enter' : 'exit'}`}
        onAnimationEnd={handleAnimationEnd}
        onClick={() => setVisible(false)}
      >
        <Icon icon="close" />
      </div>
    </div>
  );
});

export default memo(MingoCreation);
