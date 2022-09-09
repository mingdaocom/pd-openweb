import React, { Fragment, useState } from 'react';
import { Dialog, Input, QiniuUpload, Icon } from 'ming-ui';
import { formatResponseData } from 'src/components/UploadFiles/utils';

export default ({
  title = _l('测试数据'),
  onOk = () => {},
  onClose = () => {},
  testArray = [],
  fileArray = [],
  formulaMap = {},
  testMap = {},
}) => {
  const [cacheTestMap, setTestMap] = useState(testMap);
  const [isUploading, setUploading] = useState(false);
  const renderList = (source, isFile) => {
    return source.map((key, index) => {
      const [nodeId, controlId] = key
        .replace(/\$/g, '')
        .split(/([a-zA-Z0-9#]{24,32})-/)
        .filter(item => item);

      return (
        <div key={index} className="flexRow alignItemsCenter Height36 mTop10">
          <div className="Width190 mRight10 ellipsis bold">
            {`${formulaMap[nodeId].name}.${formulaMap[controlId].name}`}
          </div>
          {!isFile ? (
            <Input
              type="text"
              className="flex"
              placeholder={_l('请输入测试值')}
              value={cacheTestMap[key]}
              onChange={value => setTestMap(Object.assign({}, cacheTestMap, { [key]: value }))}
              onBlur={e => setTestMap(Object.assign({}, cacheTestMap, { [key]: e.target.value.trim() }))}
            />
          ) : (
            renderFile(key)
          )}
        </div>
      );
    });
  };
  const renderFile = key => {
    key = key + '14';

    return (
      <div className="flexRow alignItemsCenter">
        {cacheTestMap[key] ? (
          <Fragment>
            <Icon icon="attachment" className="Font16 mRight10 Gray_9e" />
            <span className="ellipsis InlineBlock ThemeColor3" style={{ maxWidth: 200 }}>
              {JSON.parse(cacheTestMap[key]).originalFileName || JSON.parse(cacheTestMap[key]).originalFilename}
            </span>
            <span className="ThemeColor3">
              .{File.GetExt(JSON.parse(cacheTestMap[key]).fileExt || JSON.parse(cacheTestMap[key]).ext)}
            </span>
            <span
              className="ThemeColor3 mLeft20 pointer"
              onClick={() => setTestMap(Object.assign({}, cacheTestMap, { [key]: '' }))}
            >
              {_l('清除')}
            </span>
          </Fragment>
        ) : (
          <QiniuUpload
            options={{ max_file_count: 1, max_file_size: '10m' }}
            onUploaded={(up, file, response) => {
              setUploading(false);
              up.disableBrowse(false);
              setTestMap(
                Object.assign({}, cacheTestMap, {
                  [key]: JSON.stringify(formatResponseData(file, decodeURIComponent(JSON.stringify(response)))),
                }),
              );
            }}
            onAdd={(up, files) => {
              setUploading(true);
              up.disableBrowse();
            }}
            onError={(up, err, errTip) => {
              alert(errTip, 2);
            }}
          >
            <div className="Gray_9e ThemeHoverColor3 pointer">
              <Icon icon="attachment" className="Font16 mRight10" style={{ minHeight: 20, lineHeight: '20px' }} />
              {isUploading ? _l('上传中...') : _l('添加附件')}
            </div>
          </QiniuUpload>
        )}
      </div>
    );
  };

  return (
    <Dialog visible width={720} title={title} onCancel={onClose} onOk={() => onOk(cacheTestMap)}>
      <div className="flexRow alignItemsCenter Height36 Gray_75">
        <div className="Width190 mRight10 ellipsis">{_l('参数名称')}</div>
        <div className="flex">{_l('参数值')}</div>
      </div>
      {renderList(testArray)}
      {renderList(fileArray, true)}
    </Dialog>
  );
};
