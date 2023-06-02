import React, { Fragment, useState } from 'react';
import { Dialog, Input, QiniuUpload, Icon } from 'ming-ui';
import { formatResponseData } from 'src/components/UploadFiles/utils';
import styled from 'styled-components';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';

const PreviewBox = styled.div`
  padding: 10px;
  background: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 3px;
`;

export default ({
  title = _l('测试数据'),
  description = '',
  onOk = () => {},
  onClose = () => {},
  testArray = [],
  fileArray = [],
  formulaMap = {},
  testMap = {},
  isRequired = false,
  previewContent = '',
}) => {
  const [cacheTestMap, setTestMap] = useState(testMap);
  const [isUploadingIndex, setUploadingIndex] = useState('');
  const parseId = key => {
    return key
      .replace(/\$/g, '')
      .split(/([a-zA-Z0-9#]{24,32})-/)
      .filter(item => item);
  };
  const renderList = (source, isFile) => {
    return source.map((key, index) => {
      const [nodeId, controlId] = parseId(key);

      return (
        <div key={index} className="flexRow alignItemsCenter Height36 mTop10">
          <div
            className="Width190 mRight10 ellipsis bold"
            title={`${formulaMap[nodeId].name}.${formulaMap[controlId].name}`}
          >
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
            renderFile(key, index)
          )}
        </div>
      );
    });
  };
  const renderFile = (key, index) => {
    key = key + '14';

    return (
      <div className="flexRow alignItemsCenter" style={{ height: 20 }}>
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
              up.disableBrowse(false);

              setTestMap(cacheTestMap =>
                Object.assign({}, cacheTestMap, {
                  [key]: JSON.stringify(formatResponseData(file, decodeURIComponent(JSON.stringify(response)))),
                }),
              );
              setUploadingIndex('');
            }}
            onAdd={(up, files) => {
              setUploadingIndex(index);
              up.disableBrowse();
            }}
            onError={(up, err, errTip) => {
              alert(errTip, 2);
            }}
          >
            <div className="Gray_9e ThemeHoverColor3 pointer flexRow alignItemsCenter" style={{ height: 20 }}>
              <Icon icon="attachment" className="Font16 mRight10" />
              {isUploadingIndex === index ? _l('上传中...') : _l('添加附件')}
            </div>
          </QiniuUpload>
        )}
      </div>
    );
  };
  const getPreviewContent = content => {
    testArray.forEach(key => {
      const [nodeId, controlId] = parseId(key);

      content = content.replace(
        new RegExp(key.replace(/\$/g, '\\$'), 'g'),
        cacheTestMap[key]
          ? `#{<span style="background: #ffa340">${cacheTestMap[key]}</span>}`
          : `#{${formulaMap[nodeId].name}-${formulaMap[controlId].name}}`,
      );
    });

    return filterXSS(content, {
      stripIgnoreTag: true,
      whiteList: Object.assign({}, whiteList, { span: ['style'] }),
    });
  };

  return (
    <Dialog
      visible
      width={720}
      overlayClosable={false}
      title={title}
      description={description}
      onCancel={onClose}
      onOk={() => {
        if (isRequired) {
          if (
            Object.keys(cacheTestMap).length !== testArray.length ||
            Object.values(cacheTestMap).filter(item => !item.trim()).length
          ) {
            alert(_l('参数值不允许为空'), 3);
            return;
          }

          onOk(cacheTestMap);
        } else {
          onOk(cacheTestMap);
        }
      }}
    >
      <div className="flexRow alignItemsCenter Height36 Gray_75">
        <div className="Width190 mRight10 ellipsis">{_l('参数名称')}</div>
        <div className="flex">{_l('参数值')}</div>
      </div>
      {renderList(testArray)}
      {renderList(fileArray, true)}

      {previewContent && (
        <Fragment>
          <div className="bold mTop20">{_l('预览')}</div>
          <PreviewBox className="mTop10" dangerouslySetInnerHTML={{ __html: getPreviewContent(previewContent) }} />
        </Fragment>
      )}
    </Dialog>
  );
};
