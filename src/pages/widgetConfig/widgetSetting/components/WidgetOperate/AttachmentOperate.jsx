import React, { Fragment } from 'react';
import { Checkbox } from 'ming-ui';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';

// 操作设置
export default function AttachmentOperate(props) {
  const { data, onChange } = props;
  const { allowupload = '1', allowdelete = '1', allowdownload = '1', alldownload = '1' } = getAdvanceSetting(data);

  const isDownload = allowdownload === '1' || alldownload === '1';

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          size="small"
          text={_l('允许上传')}
          checked={allowupload === '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { allowupload: String(+!checked) }))}
        />
      </div>
      <div className="labelWrap">
        <Checkbox
          size="small"
          text={_l('允许删除')}
          checked={allowdelete === '1'}
          onClick={checked => onChange(handleAdvancedSettingChange(data, { allowdelete: String(+!checked) }))}
        />
      </div>
      <div className="labelWrap">
        <Checkbox
          size="small"
          text={_l('允许下载')}
          checked={isDownload}
          onClick={checked =>
            onChange(
              handleAdvancedSettingChange(data, { allowdownload: String(+!checked), alldownload: String(+!checked) }),
            )
          }
        />
      </div>

      {isDownload && (
        <div className="pLeft24">
          <div className="labelWrap">
            <Checkbox
              size="small"
              text={_l('单个文件')}
              checked={allowdownload === '1'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { allowdownload: String(+!checked) }))}
            />
          </div>
          <div className="labelWrap">
            <Checkbox
              size="small"
              text={_l('全部下载')}
              checked={alldownload === '1'}
              onClick={checked => onChange(handleAdvancedSettingChange(data, { alldownload: String(+!checked) }))}
            />
          </div>
        </div>
      )}
    </Fragment>
  );
}
