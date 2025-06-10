import React, { Fragment, useMemo, useState } from 'react';
import styled from 'styled-components';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';
import { Dialog, Icon, Input, QiniuUpload } from 'ming-ui';
import { formatResponseData } from 'src/components/UploadFiles/utils';
import RegExpValidator from 'src/utils/expression';
import { ACTION_ID } from '../../../enum';
import SelectAuthAccount from '../SelectAuthAccount';

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
  isSingleKey = false,
  authId = '',
  connectId = '',
  hasAuth = false,
}) => {
  const [cacheTestMap, setTestMap] = useState(testMap);
  const [isUploadingIndex, setUploadingIndex] = useState('');
  const [auth2Id, setAuth2Id] = useState(authId);
  const parseId = key => {
    return key
      .replace(/\$/g, '')
      .split(/([a-zA-Z0-9#]{24,32})-/)
      .filter(item => item);
  };
  const getFilterTestMap = useMemo(() => {
    const accountMap = {};
    const source = testArray.filter(key => {
      const [nodeId] = parseId(key);

      if (hasAuth && (formulaMap[nodeId] || {}).actionId === ACTION_ID.CREDENTIALS) {
        accountMap[key] = key;

        return false;
      }

      return true;
    });

    setTestMap(Object.assign({}, cacheTestMap, accountMap));
    return source;
  }, []);
  const renderList = (source, isFile) => {
    return source.map((key, index) => {
      const [nodeId, controlId] = parseId(key);

      if (
        !(formulaMap[nodeId] || {}).name ||
        (!(formulaMap[`${nodeId}-${controlId}`] || {}).name && !isSingleKey) ||
        (hasAuth && (formulaMap[nodeId] || {}).actionId === ACTION_ID.CREDENTIALS)
      )
        return null;

      return (
        <div key={index} className="flexRow alignItemsCenter Height36 mTop10">
          <div
            className="Width190 mRight10 ellipsis bold"
            title={`${formulaMap[nodeId].name}${controlId ? `_${formulaMap[`${nodeId}-${controlId}`].name}` : ''}`}
          >
            {`${formulaMap[nodeId].name}${controlId ? `_${formulaMap[`${nodeId}-${controlId}`].name}` : ''}`}
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
            <Icon icon="attachment" className="Font16 mRight10 Gray_75" />
            <span className="ellipsis InlineBlock ThemeColor3" style={{ maxWidth: 200 }}>
              {JSON.parse(cacheTestMap[key]).originalFileName || JSON.parse(cacheTestMap[key]).originalFilename}
            </span>
            <span className="ThemeColor3">
              .
              {RegExpValidator.getExtOfFileName(
                JSON.parse(cacheTestMap[key]).fileExt || JSON.parse(cacheTestMap[key]).ext,
              )}
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
            <div className="Gray_75 ThemeHoverColor3 pointer flexRow alignItemsCenter" style={{ height: 20 }}>
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
          : `#{${formulaMap[nodeId].name}-${formulaMap[`${nodeId}-${controlId}`].name}}`,
      );
    });

    return filterXSS(content, {
      whiteList: Object.assign({}, whiteList, { span: ['style'] }),
    });
  };

  return (
    <Dialog
      visible
      width={720}
      className="workflowDialogBox"
      style={{ overflow: 'initial' }}
      overlayClosable={false}
      type="scroll"
      title={title}
      description={description}
      onCancel={onClose}
      onOk={() => {
        if (isRequired) {
          if (
            Object.keys(cacheTestMap).length !== testArray.length ||
            Object.values(cacheTestMap).filter(item => !item.trim()).length
          ) {
            alert(_l('参数值不允许为空'), 2);
            return;
          }

          onOk(cacheTestMap);
        } else {
          if (hasAuth && !auth2Id) {
            alert(_l('必须选择一个账户'), 2);
            return;
          }

          onOk(cacheTestMap, auth2Id);
        }
      }}
    >
      {hasAuth && getFilterTestMap.length !== testArray.length && (
        <SelectAuthAccount
          className="mBottom20"
          authId={auth2Id}
          connectId={connectId}
          onChange={auth2Id => setAuth2Id(auth2Id)}
        />
      )}

      {getFilterTestMap.length + fileArray.length > 0 && (
        <div className="flexRow alignItemsCenter Height36 Gray_75">
          <div className="Width190 mRight10 ellipsis">{_l('参数名称')}</div>
          <div className="flex">{_l('参数值')}</div>
        </div>
      )}

      {renderList(getFilterTestMap)}
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
