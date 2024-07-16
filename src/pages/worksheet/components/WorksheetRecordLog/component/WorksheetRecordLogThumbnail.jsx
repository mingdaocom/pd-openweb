import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import _ from 'lodash';
import { getClassNameByExt, formatFileSize, browserIsMobile } from 'src/util';
import WorksheetRecordLogSelectTags from './WorksheetRecordLogSelectTags';
import '../WorksheetRecordLogValue.less';
import RegExpValidator from 'src/util/expression';
function PicturePreview(props) {
  const { url, name, filesize, isPicture } = props;
  return (
    <div className="picturePreview">
      {isPicture && (
        <div className="imgCon">
          <img src={url} className="picturePreviewImg" />
        </div>
      )}
      <div className="fileDetail">
        <p className="filename">{name}</p>
        {filesize && <p className="fileSize">{formatFileSize(filesize)}</p>}
      </div>
    </div>
  );
}

function WorksheetRecordLogThumbnail(props) {
  const { oldList = [], newList = [], defaultList = [], type, recordInfo, control } = props;
  const isMobile = browserIsMobile();
  const [open, setOpen] = useState(false);
  let count = oldList.length + newList.length + defaultList.length;
  if (md.global.Config.IsLocal) {
    return (
      <React.Fragment>
        <WorksheetRecordLogSelectTags
          type="rect"
          oldValue={oldList
            .filter((m, index) => open || index < 8)
            .map(l => (type === 14 ? l.originalFilename + l.ext : _l('签名.jpg')))}
          newValue={newList
            .filter((m, index) => open || index < 8 - oldList.length)
            .map(l => (type === 14 ? l.originalFilename + l.ext : _l('签名.jpg')))}
          defaultValue={defaultList
            .filter((m, index) => open || index < 8 - oldList.length - newList.length)
            .map(l => (type === 14 ? l.originalFilename + l.ext : _l('签名.jpg')))}
        />
        {count > 8 && (
          <div>
            <span onClick={() => setOpen(!open)} className="WorksheetRecordLogOpen paddingLeft27">
              {open ? _l('收起') : _l('展开')}
            </span>
          </div>
        )}
      </React.Fragment>
    );
  }

  const renderList = (list, bgColor) => {
    if (isMobile) {
      return list.map(item => (
        <span
          key={`WorksheetRecordLogThumbnailItem-type-${type === 14 ? item.fileID : item.key}`}
          className={`WorksheetRecordLogThumbnailItem ${bgColor}`}
        >
          {type === 42 || RegExpValidator.fileIsPicture(item.ext) ? (
            <span className="itemImgCon">
              <img
                className="itemImg"
                src={(item.previewUrl || item.server || '').replace(
                  /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
                  'imageView2/2/h/20',
                )}
              />
            </span>
          ) : (
            <span
              className={`itemImgCon itemImg fileIcon ${getClassNameByExt(item.ext)}`}
              title={item.originalFilename + (item.ext || '')}
              style={{ width: '20px' }}
            />
          )}

          <span className="filename overflow_ellipsis">{type === 14 ? item.originalFilename : _l('签名')}</span>
          {type === 14 ? item.ext : '.jpg'}
        </span>
      ));
    }
    return list.map((item, index) => (
      <Trigger
        action={['hover']}
        getPopupContainer={() => document.body}
        destroyPopupOnHide
        mouseEnterDelay={0.4}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 4],
          overflow: {
            adjustY: true,
            adjustX: true,
          },
        }}
        popup={
          <PicturePreview
            url={(type === 14 ? item.previewUrl : item.server).replace(
              /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
              'imageView2/2/h/160',
            )}
            name={type === 14 ? item.originalFilename + item.ext : _l('签名.jpg')}
            filesize={type === 14 ? item.filesize : undefined}
            isPicture={type === 14 ? RegExpValidator.fileIsPicture(item.ext) : true}
          />
        }
      >
        <span
          key={`WorksheetRecordLogThumbnailItem-type-${type === 14 ? item.fileID : item.key}`}
          className={`WorksheetRecordLogThumbnailItem ${bgColor}`}
        >
          {type === 42 || RegExpValidator.fileIsPicture(item.ext) ? (
            <span className="itemImgCon">
              <img
                className="itemImg"
                src={(item.previewUrl || item.server || '').replace(
                  /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
                  'imageView2/2/h/20',
                )}
              />
            </span>
          ) : (
            <span
              className={`itemImgCon itemImg fileIcon ${getClassNameByExt(item.ext)}`}
              title={item.originalFilename + (item.ext || '')}
              style={{ width: '20px' }}
            />
          )}

          <span className="filename overflow_ellipsis">{type === 14 ? item.originalFilename : _l('签名')}</span>
          {type === 14 ? item.ext : '.jpg'}
        </span>
      </Trigger>
    ));
  };

  return (
    <div className="WorksheetRecordLogThumbnail paddingLeft27">
      {renderList(
        oldList.filter((m, index) => open || index < 8),
        'oldBackground',
      )}
      {renderList(
        newList.filter((m, index) => open || index < 8 - oldList.length),
        'newBackground',
      )}
      {renderList(
        defaultList.filter((m, index) => open || index < 8 - oldList.length - newList.length),
        'defaultBackground',
      )}
      {count > 8 && (
        <div>
          <span onClick={() => setOpen(!open)} className="WorksheetRecordLogOpen">
            {open ? _l('收起') : _l('展开')}
          </span>
        </div>
      )}
    </div>
  );
}

export default WorksheetRecordLogThumbnail;
