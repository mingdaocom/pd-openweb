import React, { Fragment } from 'react';
import { Checkbox } from 'ming-ui/antd-components';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';

// 操作设置
export default function AttachmentOperate(props) {
  const { data, onChange } = props;
  const {
    allowupload = '1',
    allowdelete = '1',
    allowdownload = '1',
    alldownload = '1',
    allowappupload = '1',
    allowcamera,
  } = getAdvanceSetting(data);

  const isDownload = allowdownload === '1' || alldownload === '1';

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          checked={allowupload === '1'}
          onChange={event =>
            onChange(
              handleAdvancedSettingChange(data, {
                allowupload: String(+event.target.checked),
              }),
            )
          }
          size="small"
        >
          {_l('允许上传')}
        </Checkbox>
      </div>
      {allowupload === '1' && (
        <div className="labelWrap pLeft24">
          <Checkbox
            checked={allowcamera === '1'}
            onChange={event =>
              onChange(
                handleAdvancedSettingChange(data, {
                  allowcamera: String(+event.target.checked),
                }),
              )
            }
            size="small"
          >
            {_l('PC端拍摄照片')}
          </Checkbox>
        </div>
      )}
      <div className="labelWrap">
        <Checkbox
          checked={allowappupload !== '0'}
          onChange={event =>
            onChange(
              handleAdvancedSettingChange(data, {
                allowappupload: String(+event.target.checked),
              }),
            )
          }
          size="small"
        >
          {_l('允许从移动设备扫码上传')}
        </Checkbox>
      </div>
      <div className="labelWrap">
        <Checkbox
          checked={allowdelete === '1'}
          onChange={event =>
            onChange(
              handleAdvancedSettingChange(data, {
                allowdelete: String(+event.target.checked),
              }),
            )
          }
          size="small"
        >
          {_l('允许删除')}
        </Checkbox>
      </div>
      <div className="labelWrap">
        <Checkbox
          checked={isDownload}
          onChange={event => {
            const checked = !event.target.checked;
            return onChange(
              handleAdvancedSettingChange(data, {
                allowdownload: String(+!checked),
                alldownload: String(+!checked),
              }),
            );
          }}
          size="small"
        >
          {_l('允许下载')}
        </Checkbox>
      </div>

      {isDownload && (
        <div className="pLeft24">
          <div className="labelWrap">
            <Checkbox
              checked={allowdownload === '1'}
              onChange={event =>
                onChange(
                  handleAdvancedSettingChange(data, {
                    allowdownload: String(+event.target.checked),
                  }),
                )
              }
              size="small"
            >
              {_l('单个文件')}
            </Checkbox>
          </div>
          <div className="labelWrap">
            <Checkbox
              checked={alldownload === '1'}
              onChange={event =>
                onChange(
                  handleAdvancedSettingChange(data, {
                    alldownload: String(+event.target.checked),
                  }),
                )
              }
              size="small"
            >
              {_l('全部下载')}
            </Checkbox>
          </div>
        </div>
      )}
    </Fragment>
  );
}
