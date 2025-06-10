import React, { useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, QiniuUpload } from 'ming-ui';
import { Tooltip, Popover, Input, Checkbox } from 'antd';
import { TabsSettingPopover } from './styled.js';

const ImageUploadWrap = styled.div`
  .imageUpload {
    height: 160px;
    color: #757575;
    border: 1.5px dashed #bdbdbd;
    border-radius: 4px;
    &:hover {
      color: #2196f3;
      border-color: #2196f3;
    }
  }
  .imageView {
    height: 160px;
    border-radius: 4px;
    overflow: hidden;
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
    }
  }
  .image {
    width: 100%;
    height: 100%;
    &.fill {
      background-size: cover;
    }
    &.full {
      background-repeat: no-repeat;
      background-position: 50%;
      background-size: contain;
    }
  }
`;

let isEdit = false;
export default props => {
  const { icon, type, highlight, widget } = props;
  const { componentConfig = {} } = widget;
  const { url, name, showType = 1, showName = true } = componentConfig;
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const previewUrl = componentConfig.previewUrl || url;
  const handleChangeConfig = data => {
    props.handleToolClick(type, {
      componentConfig: {
        ...componentConfig,
        ...data
      }
    });
  }
  const renderQiniuUpload = (className, content) => {
    return (
      <QiniuUpload
        className={className}
        options={{
          multi_selection: false,
          filters: {
            mime_types: [{ title: 'image', extensions: 'jpg,jpeg,png' }],
          },
          type: 40,
          max_file_size: '5m',
        }}
        onUploaded={(up, file, response) => {
          up.disableBrowse(false);
          const url = file.serverName + file.key;
          handleChangeConfig({ url, previewUrl: file.url });
          setUploadLoading(false);
        }}
        onAdd={(up, files) => {
          setUploadLoading(true);
          up.disableBrowse();
        }}
        onError={(up, err, errTip) => {
          alert(errTip, 2);
        }}
      >
        {content}
      </QiniuUpload>
    );
  }
  return (
    <Popover
      zIndex={1000}
      placement="bottomLeft"
      overlayClassName="tabsSettingPopover"
      arrowPointAtCenter={true}
      mouseLeaveDelay={0.3}
      overlayInnerStyle={{
        padding: 24
      }}
      visible={popoverVisible}
      onVisibleChange={visible => {
        if (isEdit) return;
        setPopoverVisible(visible);
      }}
      content={(
        <TabsSettingPopover className="flexColumn disableDrag">
          <div className="flexRow valignWrapper mBottom10">
            <div className="bold flex">{_l('名称')}</div>
            {showType === 2 && (
              <Checkbox checked={showName} onChange={e => handleChangeConfig({ showName: e.target.checked })}>
                {_l('显示')}
              </Checkbox>
            )}
          </div>
          <Input
            value={name}
            onChange={e => handleChangeConfig({ name: e.target.value.trim().slice(0, 20) })}
            onFocus={() => {
              isEdit = true;
            }}
            onBlur={e => {
              isEdit = false;
              if (!e.target.value) {
                handleChangeConfig({ name: _l('图片') });
              }
            }}
          />
          <div className="flexRow valignWrapper mTop15 mBottom10">
            <div className="bold mRight10">{_l('显示方式')}</div>
            <div className="typeSelect flex flexRow valignWrapper">
              <div className={cx('centerAlign flex pointer Gray_75', { active: showType === 1 })} onClick={() => handleChangeConfig({ showType: 1 })}>{_l('透明')}</div>
              <div className={cx('centerAlign flex pointer Gray_75', { active: showType === 2 })} onClick={() => handleChangeConfig({ showType: 2 })}>{_l('卡片')}</div>
            </div>
          </div>
          <ImageUploadWrap className="mTop15">
            <div className="bold">{_l('图片')}</div>
            <div className="Gray_75 mBottom10">{_l('请选择5MB以内的jpg, jpeg或png图片')}</div>
            {previewUrl ? (
              <div className="imageView Relative">
                <div className="image fill" style={{ backgroundImage: `url(${previewUrl})` }} />
                <div className="mask flexColumn">
                  <div className="flex"></div>
                  <div className="btnsWrap flexRow alignItemsCenter">
                    {renderQiniuUpload(
                      undefined,
                      <Tooltip title={_l('更改图片')} placement="bottom">
                        <div className="resetBtn pointer flexRow alignItemsCenter justifyContentCenter">
                          <Icon className="ThemeColor Font20" icon="task-later" />
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              renderQiniuUpload(
                'w100',
                <div className="imageUpload flexRow alignItemsCenter justifyContentCenter pointer">
                  <Icon className="Font18" icon="insert_photo_21" />
                  <div className="mLeft5">{_l('选择上传的图片')}</div>
                </div>
              )
            )}
          </ImageUploadWrap>
        </TabsSettingPopover>
      )}
      getPopupContainer={() => document.body}
    >
      <li
        className={cx(type, { highlight })}
        key={type}
      >
        <i className={`icon-${icon} Font18`}></i>
      </li>
    </Popover>
  );
}

