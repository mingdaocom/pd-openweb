import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Dropdown, QiniuUpload, Radio } from 'ming-ui';
import { formatResponseData } from 'src/components/UploadFiles/utils';
import { VOICE_FILE_LIST } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config';
import { LANGUAGE_BCP47 } from '../../../enum';
import CustomTextarea from '../CustomTextarea';
import audioGif from './audio.gif';

const AudioBox = styled.span`
  margin: 10px 10px 0 0;
  display: inline-flex;
  padding: 0 18px;
  border-radius: 3px;
  border: 1px solid #ccc;
  cursor: pointer;
  position: relative;
  align-items: center;
  font-size: 12px;
  vertical-align: top;
  height: 36px;
  z-index: 1;
  &.active {
    border-color: #1677ff;
    &::after {
      position: absolute;
      content: '';
      right: -8px;
      top: -8px;
      border-width: 8px;
      border-color: #1677ff transparent transparent transparent;
      border-style: solid;
      transform: rotate(-135deg);
    }
  }
`;

const DelBtn = styled.i`
  &:hover {
    color: #f44336 !important;
  }
`;

const list = [
  { text: _l('音频'), value: 1 },
  { text: _l('语音播报'), value: 2 },
];

const SpeechSetting = [
  {
    title: _l('语言'),
    data: LANGUAGE_BCP47,
    key: 'language',
  },
  {
    title: _l('音调'),
    data: [
      { text: '低音', value: '0' },
      { text: '默认', value: '1' },
      { text: '高音', value: '2' },
    ],
    key: 'pitch',
  },
  {
    title: _l('语速'),
    data: [
      { text: '慢', value: '0' },
      { text: '默认', value: '1' },
      { text: '快', value: '3' },
      { text: '超快', value: '5' },
    ],
    key: 'speed',
  },
];

const trialListening = ({ language, pitch, speed, content }, formulaMap) => {
  if (!content.trim()) return;

  const arr = content.match(/\$[^ \r\n]+?\$/g);

  if (arr) {
    arr.forEach(obj => {
      const ids = obj
        .replace(/\$/g, '')
        .split(/([a-zA-Z0-9#]{24,32})-/)
        .filter(item => item);

      content = content.replace(
        obj,
        `{${(formulaMap[ids[0]] || {}).name || ''}-${(formulaMap[ids.join('-')] || {}).name || ''}}`,
      );
    });
  }

  const utterance = new SpeechSynthesisUtterance(content);

  utterance.lang = language; // 设置为中文
  utterance.pitch = parseInt(pitch); // 音调
  utterance.rate = parseInt(speed); // 语速
  utterance.volume = 1; // 音量

  // 播放语音
  window.speechSynthesis.speak(utterance);
};

export default ({ companyId, processId, relationId, selectNodeId, promptSound, formulaMap, updateSource }) => {
  const [uploading, setUploading] = useState(false);
  const [audioEnd, setAudioEnd] = useState(true);
  const audioRef = useRef(null);
  const playAudio = src => {
    audioRef.current.src = src;
    audioRef.current.play();
    setAudioEnd(false);
  };
  const renderCustomAudio = () => {
    const file = JSON.parse(promptSound.file)[0];

    return (
      <AudioBox
        className="active mRight25 mTop0"
        onClick={() => {
          playAudio(file.url || file.viewUrl);
        }}
      >
        {audioEnd ? (
          <i className="Font16 icon-volume_up mRight5" />
        ) : (
          <img src={audioGif} height={16} className="mRight5" />
        )}
        {file.originalFileName || file.originalFilename}
      </AudioBox>
    );
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => {
        setAudioEnd(true);
      });
    }
  }, [audioRef.current]);

  return (
    <Fragment>
      <div className="Font13 bold">{_l('类型')}</div>
      <div className="flexRow mTop10">
        {list.map((item, i) => {
          return (
            <Radio
              key={item.value}
              className={cx({ mLeft50: i !== 0 })}
              checked={promptSound.type === item.value}
              text={item.text}
              onClick={() =>
                updateSource({
                  promptSound: {
                    content: '',
                    file: '',
                    language: 'zh-CN',
                    pitch: '1',
                    preset: '',
                    speed: '1',
                    type: item.value,
                  },
                })
              }
            />
          );
        })}
      </div>

      {promptSound.type === 1 ? (
        <Fragment>
          <div className="Font13 bold mTop20">{_l('预设')}</div>
          <div>
            {[{ fileKey: '', filePath: require('/staticfiles/images/session_new_message.mp3'), fileName: _l('默认') }]
              .concat(VOICE_FILE_LIST.filter(item => item.fileKey !== '12'))
              .map((item, i) => (
                <AudioBox
                  key={i}
                  className={cx({ active: promptSound.preset === item.fileKey && !promptSound.file })}
                  onClick={() => {
                    updateSource({ promptSound: { ...promptSound, preset: item.fileKey, file: '' } });
                    playAudio(item.filePath);
                  }}
                >
                  {audioEnd || promptSound.preset !== item.fileKey || !!promptSound.file ? (
                    <i className="Font16 icon-volume_up mRight5" />
                  ) : (
                    <img src={audioGif} height={16} className="mRight5" />
                  )}
                  {item.fileName}
                </AudioBox>
              ))}
          </div>

          <div className="Font13 bold mTop20">{_l('自定义')}</div>
          <div className="Font13 Gray_75 mTop5">{_l('仅支持MP3 和 WAV音频格式，大小在10MB以内')}</div>

          <div className="flexRow alignItemsCenter mTop10">
            {promptSound.file && renderCustomAudio()}

            <QiniuUpload
              options={{
                max_file_count: 1,
                max_file_size: '10m',
                filters: {
                  mime_types: [{ extensions: 'mp3,wav' }],
                },
                error_callback: () => {
                  alert(_l('只允许上传单个文件'), 2);
                  return;
                },
              }}
              onUploaded={(up, file, response) => {
                up.disableBrowse(false);

                const newFile = formatResponseData(file, decodeURIComponent(JSON.stringify(response)));

                updateSource({
                  promptSound: {
                    ...promptSound,
                    preset: '',
                    file: JSON.stringify([newFile]),
                  },
                });

                playAudio(newFile.url);
                setUploading(false);
              }}
              onAdd={up => {
                setUploading(true);
                up.disableBrowse();
              }}
              onError={(up, err, errTip) => {
                alert(errTip, 2);
              }}
            >
              {promptSound.file ? (
                <span className="pointer" data-tip={_l('重新上传')}>
                  <i className="Font20 icon-file_upload Gray_75 ThemeHoverColor3" />
                </span>
              ) : (
                <AudioBox className="mTop0">
                  <i className="Font16 mRight5 icon-add" />
                  {uploading ? _l('上传中...') : _l('自定义')}
                </AudioBox>
              )}
            </QiniuUpload>

            {promptSound.file && (
              <span className="mLeft25 pointer" data-tip={_l('删除')}>
                <DelBtn
                  className="Font20 icon-hr_delete Gray_75"
                  onClick={() =>
                    updateSource({
                      promptSound: {
                        ...promptSound,
                        preset: '',
                        file: '',
                      },
                    })
                  }
                />
              </span>
            )}
          </div>

          <audio ref={audioRef} className="Visibility" />
        </Fragment>
      ) : (
        <Fragment>
          <div className="Font13 bold mTop20">{_l('内容')}</div>
          <CustomTextarea
            className="minH100"
            projectId={companyId}
            processId={processId}
            relationId={relationId}
            selectNodeId={selectNodeId}
            type={2}
            content={promptSound.content}
            formulaMap={formulaMap}
            onChange={(err, value) => updateSource({ promptSound: { ...promptSound, content: value } })}
            updateSource={updateSource}
          />

          {SpeechSetting.map((item, i) => (
            <Fragment key={i}>
              <div className="Font13 bold mTop20">{item.title}</div>
              <Dropdown
                className="w100 mTop10"
                menuClass="w100"
                data={item.data}
                value={promptSound[item.key]}
                border
                onChange={value => updateSource({ promptSound: { ...promptSound, [item.key]: value } })}
              />
            </Fragment>
          ))}

          <div className="mTop10">
            <AudioBox
              className={cx('ThemeBorderColor3 ThemeBGColor3 White', { Alpha5: !promptSound.content.trim() })}
              onClick={() => trialListening(promptSound, formulaMap)}
            >
              <i className="Font16 mRight5 icon-volume_up" />
              {_l('试听')}
            </AudioBox>
          </div>
        </Fragment>
      )}
    </Fragment>
  );
};
