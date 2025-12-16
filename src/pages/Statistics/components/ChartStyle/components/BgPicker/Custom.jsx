import React, { useEffect, useRef } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, QiniuUpload } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';

const Wrap = styled.div`
  .imageUpload {
    height: 160px;
    color: #757575;
    border: 1.5px dashed #bdbdbd;
    border-radius: 4px;
    &:hover {
      color: #1677ff;
      border-color: #1677ff;
    }
  }
  .imageView {
    height: 160px;
    border-radius: 4px;
    overflow: hidden;
    z-index: 1;
    &:hover .mask {
      display: flex;
    }
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.2);
      width: 100%;
      height: 100%;
      padding: 10px;
      display: none;
    }
    .btnsWrap {
      justify-content: end;
    }
    .resetBtn {
      padding: 10px;
      border-radius: 4px;
      background-color: #fff;
      &:hover {
        color: #1677ff;
      }
    }
  }
  .image {
    width: 100%;
    height: 100%;
    &.fill {
      background-size: cover;
      background-position: center;
    }
    &.full {
      background-repeat: no-repeat;
      background-position: 50%;
      background-size: contain;
    }
  }
`;

const fillTypes = [
  {
    name: _l('填满'),
    value: 1,
  },
  {
    name: _l('完整显示'),
    value: 2,
  },
  {
    name: _l('拉伸 (会变形)'),
    value: 3,
  },
].filter(item => item.value !== 2);

export default props => {
  const { value, config, onChange } = props;
  const { displaySetup, handleChangeDisplaySetup } = props;
  const { fillType = 1 } = config || {};
  const previewUrl = displaySetup.previewUrl || displaySetup.imageUrl;
  const fillTypeRef = useRef(fillType);

  useEffect(() => {
    fillTypeRef.current = fillType;
  }, [fillType]);

  const handleChange = data => {
    onChange({
      bgStyleValue: value,
      ...data,
    });
  };

  return (
    <Wrap>
      {previewUrl ? (
        <div
          className="imageView Relative pointer"
          onClick={() => {
            onChange({ bgStyleValue: value });
          }}
        >
          {fillType === 3 ? (
            <img src={previewUrl} className="w100 h100" />
          ) : (
            <div
              className={cx('image', { fill: fillType === 1, full: fillType === 2 })}
              style={{ backgroundImage: `url(${previewUrl})` }}
            />
          )}
          <div className="mask flexColumn">
            <div className="flex"></div>
            <div className="btnsWrap flexRow alignItemsCenter">
              <Tooltip title={_l('删除')} placement="bottom">
                <div
                  className="resetBtn pointer flexRow alignItemsCenter justifyContentCenter"
                  onClick={e => {
                    e.stopPropagation();
                    handleChangeDisplaySetup({
                      imageUrl: '',
                      previewUrl: '',
                    });
                  }}
                >
                  <Icon className="Gray_9e Font20" icon="delete2" />
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      ) : (
        <QiniuUpload
          className="w100"
          options={{
            multi_selection: false,
            filters: {
              mime_types: [{ title: 'image', extensions: 'jpg,jpeg,png' }],
            },
            type: 40,
            max_file_size: '5m',
          }}
          onUploaded={(up, file) => {
            up.disableBrowse(false);
            const url = file.serverName + file.key;
            handleChangeDisplaySetup({
              imageUrl: url,
              previewUrl: file.url,
            });
            onChange({ bgStyleValue: value, fillType: fillTypeRef.current });
          }}
          onAdd={up => {
            up.disableBrowse();
          }}
          onError={(up, err, errTip) => {
            alert(errTip, 2);
          }}
        >
          <div className="imageUpload flexRow alignItemsCenter justifyContentCenter pointer">
            <Icon className="Font18" icon="insert_photo_21" />
            <div className="mLeft5">{_l('选择上传的图片')}</div>
          </div>
        </QiniuUpload>
      )}
      <div className="Font12 bold mTop15 mBottom5">{_l('填充方式')}</div>
      <Select
        className="mdAntSelect w100"
        value={fillType}
        suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
        onChange={value => {
          handleChange({ fillType: value });
        }}
      >
        {fillTypes.map(c => (
          <Select.Option className="mdAntSelectOption" key={c.value} value={c.value}>
            <div className="valignWrapper h100">
              <span className="Font13 ellipsis">{c.name}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
    </Wrap>
  );
};
