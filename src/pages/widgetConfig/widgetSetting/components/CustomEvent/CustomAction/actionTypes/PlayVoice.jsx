import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, Icon } from 'ming-ui';
import fileAjax from 'src/api/file';
import { SettingItem } from '../../../../../styled';
import { VOICE_FILE_LIST } from '../../config';
import { CustomActionWrap, DynamicBtn } from '../../style';
import UploadFile from '../UploadField';

export default function PlayVoice(props) {
  const { actionData = {}, handleOk } = props;
  const [{ advancedSetting, visible, fieldVisible }, setState] = useSetState({
    advancedSetting: actionData.advancedSetting || {},
    visible: true,
    fieldVisible: false,
  });

  useEffect(() => {
    setState({
      advancedSetting: actionData.advancedSetting || {},
    });
    window.customEditPlayer = document.createElement('audio');
  }, []);

  const voiceFiles = safeParse(advancedSetting.voicefiles, 'array');

  const handleSet = async item => {
    setState({ advancedSetting: { ...advancedSetting, fileKey: item.fileKey } });
    const curFile = _.find(VOICE_FILE_LIST.concat(voiceFiles), v => v.fileKey === item.fileKey);
    if (item.fileKey && curFile) {
      let audioSrc = _.get(curFile, 'filePath');
      // 上传的mp3置换url
      if (!Number(item.fileKey)) {
        audioSrc = await fileAjax.getChatFileUrl({ serverName: curFile.filePath, key: item.fileKey });
      }
      window.customEditPlayer.src = audioSrc;
      window.customEditPlayer.play();
    }
  };

  return (
    <Fragment>
      <Dialog
        width={480}
        visible={visible}
        okDisabled={!advancedSetting.fileKey}
        className="SearchWorksheetDialog"
        title={_l('播放声音')}
        onCancel={() => {
          setState({ visible: false });
          window.customEditPlayer = '';
        }}
        overlayClosable={false}
        onOk={() => {
          handleOk({ ...actionData, advancedSetting });
          setState({ visible: false });
        }}
      >
        <CustomActionWrap>
          <SettingItem className="mTop0">
            <div className="settingItemTitle">{_l('声音')}</div>
            {VOICE_FILE_LIST.concat(voiceFiles).map(item => {
              const isActive = item.fileKey === advancedSetting.fileKey;
              const isUpload = _.get(item, 'fileKey.length') > 3;
              return (
                <div
                  className={cx('alertContent overflow_ellipsis mBottom8', {
                    active: isActive,
                  })}
                  onClick={() => handleSet(item)}
                >
                  <Icon icon="volume_up" className="mRight12 Gray_75 Font16" />
                  <span className="flex overflow_ellipsis">{item.fileName}</span>
                  {isUpload && (
                    <Icon
                      icon="trash"
                      className="deleteBtn mLeft5 Font16"
                      onClick={e => {
                        e.stopPropagation();
                        const newVoiceFiles = voiceFiles.filter(i => i.fileKey !== item.fileKey);
                        setState({
                          advancedSetting: {
                            ...advancedSetting,
                            fileKey: isActive ? '' : advancedSetting.fileKey,
                            voicefiles: JSON.stringify(newVoiceFiles),
                          },
                        });
                      }}
                    />
                  )}
                </div>
              );
            })}
          </SettingItem>

          <DynamicBtn className="mTop12" onClick={() => setState({ fieldVisible: true })}>
            <Icon icon="add" className="Bold" />
            {_l('上传mp3')}
          </DynamicBtn>
        </CustomActionWrap>
      </Dialog>

      <Dialog
        width={800}
        title={_l('上传mp3')}
        visible={fieldVisible}
        footer={null}
        onCancel={() => setState({ fieldVisible: false })}
      >
        <UploadFile
          fileUploaded={files => {
            const newFiles = files.map(f => {
              const { name, key, serverName } = f;
              return { filePath: serverName, fileName: name, fileKey: key };
            });
            setState({
              advancedSetting: { ...advancedSetting, voicefiles: JSON.stringify(voiceFiles.concat(newFiles)) },
              fieldVisible: false,
            });
          }}
        />
      </Dialog>
    </Fragment>
  );
}
