import React, { Fragment, useState, useEffect } from 'react';
import cx from 'classnames';
import { Icon, LoadDiv } from 'ming-ui';
import { Tooltip } from 'antd';
import { loadImage } from '../utils';
import './index.less';

const LargeImageCard = props => {
  const { isMobile, previewUrl, onPreview } = props;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImage(previewUrl).then(img => {
      setLoading(false);
    });
  }, []);

  return (
    <div className="attachmentLargeImageCard">
      {loading ? (
        <LoadDiv />
      ) : (
        <Fragment>
          <img
            className="w100"
            src={previewUrl}
            onClick={() => {
              if (isMobile) {
                onPreview();
              }
            }}
          />
          {!isMobile && (
            <div className="mask">
              <div
                className="preview flexRow alignItemsCenter justifyContentCenter"
                onClick={onPreview}
              >
                <Tooltip title={_l('展开')} placement="bottom">
                  <Icon className="Font17 pointer" icon="worksheet_enlarge" />
                </Tooltip>
              </div>
            </div>
          )}
        </Fragment>
      )}
    </div>
  );
}

export default (props) => {
  const { data, ...otherProps } = props;
  const { isMdFile, isKc } = props;
  const isPicture = isMdFile ? File.isPicture(data.fileExt || data.ext) : File.isPicture(data.fileExt);

  if (!isPicture) {
    return <div />;
  }

  if (isMdFile) {
    const { browse, onMDPreview } = props;
    const previewUrl = data.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, `imageView2/0`);
    return (
      <LargeImageCard
        {...otherProps}
        previewUrl={previewUrl}
        onPreview={() => {
          browse ? onMDPreview(data) : alert(_l('您权限不足，无法预览，请联系管理员或文件上传者'), 3);
        }}
      />
    );
  } else {
    const { url, onKCPreview, onPreview } = props;
    const previewImageUrl = isKc ? data.viewUrl : (url.indexOf('imageView2') > -1 ? url.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/0') : url + `${url.includes('?') ? '&' : '?'}imageView2/0`);
    return (
      <LargeImageCard
        {...otherProps}
        previewUrl={previewImageUrl}
        onPreview={() => {
          isKc ? onKCPreview(data) : onPreview(data);
        }}
      />
    );
  }
}
