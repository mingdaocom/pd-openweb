import React, { Fragment, useState } from 'react';
import { Checkbox, Input, Popover, Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, QiniuUpload } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { TabsSettingPopover } from './styled.js';

const actionType = [
  {
    name: _l('无'),
    value: 0,
  },
  {
    name: _l('预览图片'),
    value: 1,
  },
  {
    name: _l('打开链接'),
    value: 2,
  },
];

const openModeType = [
  {
    name: _l('新页面'),
    value: 1,
  },
  {
    name: _l('当前页面'),
    value: 2,
  },
];

const fillType = [
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
];

const ImageUploadWrap = styled.div`
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
  const { toolItem, widget, renderItem } = props;
  const { type } = toolItem;
  const { componentConfig = {} } = widget;
  const { url, name, showName = true, linkUrl } = componentConfig;
  const showType = _.isNumber(componentConfig.showType) ? componentConfig.showType : 1;
  const action = _.isNumber(componentConfig.action) ? componentConfig.action : 0;
  const openMode = _.isNumber(componentConfig.openMode) ? componentConfig.openMode : 1;
  const fill = componentConfig.fill || 1;
  const [popoverVisible, setPopoverVisible] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [uploadLoading, setUploadLoading] = useState(false);
  const previewUrl = componentConfig.previewUrl || url;
  const handleChangeConfig = data => {
    props.handleToolClick(type, {
      componentConfig: {
        ...componentConfig,
        ...data,
      },
    });
  };
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
        onUploaded={(up, file) => {
          up.disableBrowse(false);
          const url = file.serverName + file.key;
          handleChangeConfig({ url, previewUrl: file.url });
          setUploadLoading(false);
        }}
        onAdd={up => {
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
  };
  return (
    <Popover
      zIndex={1000}
      placement="bottomLeft"
      overlayClassName="tabsSettingPopover"
      arrowPointAtCenter={true}
      mouseLeaveDelay={0.3}
      overlayInnerStyle={{
        padding: 24,
      }}
      visible={popoverVisible}
      onVisibleChange={visible => {
        if (isEdit) return;
        setPopoverVisible(visible);
      }}
      content={
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
              <div
                className={cx('centerAlign flex pointer Gray_75', { active: showType === 1 })}
                onClick={() => handleChangeConfig({ showType: 1 })}
              >
                {_l('透明')}
              </div>
              <div
                className={cx('centerAlign flex pointer Gray_75', { active: showType === 2 })}
                onClick={() => handleChangeConfig({ showType: 2 })}
              >
                {_l('卡片')}
              </div>
            </div>
          </div>
          <div className="flexRow valignWrapper mTop15 mBottom10 bold">{_l('填充方式')}</div>
          <Select
            className="mdAntSelect w100"
            value={fill}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              handleChangeConfig({ fill: value });
            }}
          >
            {fillType.map(c => (
              <Select.Option className="mdAntSelectOption" key={c.value} value={c.value}>
                <div className="valignWrapper h100">
                  <span className="Font13 ellipsis">{c.name}</span>
                </div>
              </Select.Option>
            ))}
          </Select>
          <div className="flexRow valignWrapper mTop15 mBottom10 bold">{_l('点击图片时')}</div>
          <Select
            className="mdAntSelect w100"
            value={action}
            suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
            onChange={value => {
              const data = { action: value };
              if (value === 2) {
                data.openMode = 1;
              }
              handleChangeConfig(data);
            }}
          >
            {actionType.map(c => (
              <Select.Option className="mdAntSelectOption" key={c.value} value={c.value}>
                <div className="valignWrapper h100">
                  <span className="Font13 ellipsis">{c.name}</span>
                </div>
              </Select.Option>
            ))}
          </Select>
          {action === 2 && (
            <Fragment>
              <Input
                className="mTop5"
                value={linkUrl}
                placeholder={_l('链接')}
                onChange={e => handleChangeConfig({ linkUrl: e.target.value.trim() })}
                onFocus={() => {
                  isEdit = true;
                }}
                onBlur={e => {
                  isEdit = false;
                  if (e.target.value && !/^https?:\/\/.+$/.test(e.target.value)) {
                    alert(_l('请输入正确的 url 格式'), 3);
                    handleChangeConfig({ linkUrl: '' });
                  }
                }}
              />
              <div className="flexRow valignWrapper mTop15 mBottom10 bold">{_l('打开方式')}</div>
              <Select
                className="mdAntSelect w100"
                value={openMode}
                suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
                onChange={value => {
                  handleChangeConfig({ openMode: value });
                }}
              >
                {openModeType.map(c => (
                  <Select.Option className="mdAntSelectOption" key={c.value} value={c.value}>
                    <div className="valignWrapper h100">
                      <span className="Font13 ellipsis">{c.name}</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Fragment>
          )}
          <ImageUploadWrap className="mTop15">
            <div className="bold">{_l('图片')}</div>
            <div className="Gray_75 mBottom10">{_l('请选择5MB以内的jpg, jpeg或png图片')}</div>
            {previewUrl ? (
              <div className="imageView Relative">
                {fill === 3 ? (
                  <img src={previewUrl} className="w100 h100" />
                ) : (
                  <div
                    className={cx('image', { fill: fill === 1, full: fill === 2 })}
                    style={{ backgroundImage: `url(${previewUrl})` }}
                  />
                )}
                <div className="mask flexColumn">
                  <div className="flex"></div>
                  <div className="btnsWrap flexRow alignItemsCenter">
                    {renderQiniuUpload(
                      undefined,
                      <Tooltip title={_l('更改图片')} placement="bottom">
                        <div className="resetBtn pointer flexRow alignItemsCenter justifyContentCenter">
                          <Icon className="ThemeColor Font20" icon="task-later" />
                        </div>
                      </Tooltip>,
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
                </div>,
              )
            )}
          </ImageUploadWrap>
        </TabsSettingPopover>
      }
      getPopupContainer={() => document.body}
    >
      {renderItem()}
    </Popover>
  );
};
