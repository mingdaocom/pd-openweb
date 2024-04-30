import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Dialog, Icon } from 'ming-ui';
import { SettingItem } from '../../../../../styled';
import { CustomActionWrap, DynamicBtn } from '../../style';
import UploadFile from '../UploadField';
import cx from 'classnames';

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
  }, []);

  const voiceFiles = safeParse(advancedSetting.voicefiles, 'array');

  return (
    <Fragment>
      <Dialog
        width={480}
        visible={visible}
        okDisabled={_.isEmpty(advancedSetting.file)}
        className="SearchWorksheetDialog"
        title={_l('播放声音')}
        onCancel={() => setState({ visible: false })}
        onOk={() => {
          handleOk({ ...actionData, advancedSetting });
          setState({ visible: false });
        }}
      >
        <CustomActionWrap>
          <SettingItem className="mTop0">
            <div className="settingItemTitle">{_l('声音')}</div>
            {voiceFiles.map(item => {
              return (
                <div
                  className={cx('alertContent overflow_ellipsis mBottom8', {
                    active: item.filePath === advancedSetting.file,
                  })}
                  onClick={() => {
                    setState({ advancedSetting: { ...advancedSetting, file: item.filePath } });
                  }}
                >
                  <Icon icon="volume_up" className="mRight12 Gray_75 Font16" />
                  {item.fileName}
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
          fileUploaded={file => {
            const { name, key, type, serverName } = file;
            const itemFile = { filePath: serverName + key, fileName: name, fileType: type };
            setState({
              advancedSetting: { ...advancedSetting, voicefiles: JSON.stringify(voiceFiles.concat([itemFile])) },
              fieldVisible: false,
            });
          }}
        />
      </Dialog>
    </Fragment>
  );
}
