import React, { useState } from 'react';
import { Input as AntdInput } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, Icon, Input, LoadDiv, QiniuUpload, SortableList, Tooltip } from 'ming-ui';
import RegExpValidator from 'src/utils/expression';
import suggestImg from './image/suggest.png';
import { coverUrls } from './utils';
import './style.less';

const BulletinDialog = styled(Dialog)`
  .mui-dialog-header {
    display: none;
  }
  .mui-dialog-body {
    display: flex;
    padding: 0 !important;
  }
  .leftWrapper {
    width: 320px;
    border-right: 1px solid #eaeaea;
    display: flex;
    flex-direction: column;
    .title {
      padding: 16px 24px;
      line-height: 26px;
    }
    .listContent {
      flex: 1;
      overflow: auto;
      padding-bottom: 32px;
      .addBtn {
        margin-top: 32px;
        margin-left: 36px;
        &.disabled {
          background: #f8f8f8 !important;
          color: #9e9e9e !important;
          border-color: #eaeaea !important;
        }
      }
    }
  }
  .rightWrapper {
    flex: 1;
    padding: 24px;
    .image {
      width: 100%;
      height: 140px;
      border-radius: 3px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      background-size: cover !important;

      .customBtnWrapper {
        position: absolute;
        top: 4px;
        right: 4px;

        .uploadBtn {
          background-color: rgba(0, 0, 0, 0.5);
          padding: 6px 8px;
          border-radius: 4px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          &:hover {
            background-color: rgba(0, 0, 0, 0.3);
          }
        }
      }
    }
    .picList {
      display: flex;
      flex-wrap: nowrap;
      gap: 8px;
      padding: 14px 0;
      .picItem {
        flex: 1;
        height: 40px;
        border-radius: 3px;
        background-size: cover !important;
        position: relative;
        cursor: pointer;
        &.isActive {
          box-shadow: rgba(33, 150, 243) 0px 0px 0px 2px;
        }
        .activeMaskWrapper {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.5);
          .icon-done {
            color: #fff;
            font-size: 40px;
            text-shadow: 0px 0px 4px rgba(0, 0, 0, 0.4);
          }
        }
      }
    }
    .linkInput {
      width: 100%;
      margin: 8px 0 20px;
      &:hover {
        border-color: #1e88e5 !important;
      }
    }
    .saveBtn {
      &.disabled {
        background: #a6d5fb !important;
        color: #fff;
      }
    }
  }
`;

const ItemWrapper = styled.div`
  z-index: 10000;
  .bulletinItem {
    display: flex;
    align-items: center;
    padding: 8px 16px 8px 36px;
    border: 2px solid transparent;
    cursor: pointer;

    .icon-drag {
      margin-left: -26px;
    }
    .picWrapper {
      width: 90px;
      min-width: 90px;
      height: 56px;
      border-radius: 5px;
      background-size: cover !important;
    }
    .delIcon {
      display: none;
      cursor: pointer;
      color: #bdbdbd;
      font-size: 16px;
      &:hover {
        color: #f44336;
      }
    }

    &:hover {
      border-color: #eaeaea;
      .delIcon {
        display: block;
      }
    }
    &.isActive {
      border-color: #2196f3;
      .delIcon {
        display: block;
      }
    }
  }
`;

const TitleInput = styled(AntdInput)`
  &.ant-input-affix-wrapper {
    transition: none !important;
    border-color: #ccc !important;
    border-radius: 3px !important;
    padding: 6px 12px !important;
    &:hover {
      border-color: #1e88e5 !important;
    }
  }
  &.ant-input-affix-wrapper-focused {
    box-shadow: none !important;
    border-color: #1e88e5 !important;
  }
`;

export default function BulletinSetting(props) {
  const { bulletinBoards = [], onClose, updatePlatformSetting } = props;
  const [bulletins, setBulletins] = useState(
    !bulletinBoards.length
      ? [
          {
            url: md.global.FileStoreConfig.pictureHost + coverUrls[0],
            key: coverUrls[0],
            link: '',
            title: '',
            bucket: 4,
          },
        ]
      : bulletinBoards,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [editStatus, setEditStatus] = useState({ editing: false, saved: false });
  const [flag, setFlag] = useState(+new Date());

  const onChangeData = obj => {
    setActiveIndex(activeIndex => {
      setBulletins(bulletins => {
        const newBulletins = bulletins.map((item, i) => {
          return i === activeIndex ? { ...item, ...obj } : item;
        });
        setEditStatus({ editing: true, saved: false });
        return newBulletins;
      });
      return activeIndex;
    });
  };

  const onSwitchItem = index => {
    if (index === activeIndex) return;
    if (editStatus.editing) {
      alert(_l('请先保存正在编辑的内容'), 3);
      return;
    }
    setActiveIndex(index);
    setEditStatus({ editing: false, saved: false });
  };

  const onDelete = currentIndex => {
    const isAdded = bulletins.length > bulletinBoards.length && currentIndex === bulletins.length - 1;

    const deleteItem = isUpdate => {
      const newBulletins = bulletins.filter((_, index) => index !== currentIndex);
      setActiveIndex(0);
      setBulletins(newBulletins);
      setEditStatus({ editing: false, saved: false });
      isUpdate &&
        updatePlatformSetting({ bulletinBoards: newBulletins }, () => {
          alert('删除成功');
        });
    };

    if (isAdded) {
      deleteItem();
    } else {
      if (editStatus.editing) {
        alert(_l('请先保存正在编辑的内容'), 3);
        return;
      }
      Dialog.confirm({
        title: _l('删除此项'),
        buttonType: 'danger',
        description: _l('删除后无法恢复'),
        onOk: () => deleteItem(true),
      });
    }
  };

  const onAdd = () => {
    const picKey = coverUrls[_.random(0, 7)];
    const newBulletins = bulletins.concat({
      key: picKey,
      url: md.global.FileStoreConfig.pictureHost + picKey,
      title: '',
      link: '',
      bucket: 4,
    });
    setBulletins(newBulletins);
    setActiveIndex(newBulletins.length - 1);
    setEditStatus({ editing: true, saved: false });
  };

  const onSave = () => {
    if (!!bulletins.filter(item => item.link.trim() && !RegExpValidator.isURL(item.link.trim())).length) {
      alert(_l('链接格式不正确'), 3);
      return;
    }
    updatePlatformSetting(
      { bulletinBoards: bulletins.map(item => ({ ...item, link: item.link.trim(), title: item.title.trim() })) },
      () => {
        alert('保存成功');
        setEditStatus({ editing: false, saved: true });
      },
    );
  };

  const renderItem = ({ item, index, dragging }) => {
    const { title, url } = item;

    return (
      <ItemWrapper>
        <div
          className={cx('bulletinItem', { isActive: index === activeIndex && !dragging })}
          onClick={() => onSwitchItem(index)}
        >
          <Icon className="mRight10 Font16 Hand Gray_9e dragIcon" icon="drag" />
          <div className="picWrapper" style={{ background: `url(${url}) no-repeat center` }}></div>
          {title && (
            <div className="mLeft16 Font14 overflow_ellipsis" title={title}>
              {title}
            </div>
          )}
          <div className="flex"></div>
          {bulletins.length > 1 && (
            <Icon
              icon="delete1"
              className="delIcon"
              onClick={e => {
                e.stopPropagation();
                onDelete(index);
              }}
            />
          )}
        </div>
      </ItemWrapper>
    );
  };

  return (
    <BulletinDialog visible={true} width={1000} type="fixed" showFooter={false} onCancel={onClose}>
      <div className="leftWrapper">
        <div className="title">
          <span className="Font17 bold">{_l('宣传栏')}</span>
          <span className="Font12 bold Gray_9e mLeft10">{`${bulletins.length} / 10`}</span>
        </div>
        <div className="listContent">
          <SortableList
            flag={flag}
            items={bulletins}
            renderItem={renderItem}
            itemKey="id"
            helperClass="bulletinHelperClass"
            onSortEnd={(newItems, newIndex) => {
              if (editStatus.editing) {
                alert(_l('请先保存正在编辑的内容'), 3);
                setFlag(+new Date());
                return;
              }
              setActiveIndex(newIndex);
              setBulletins(newItems);
              updatePlatformSetting({ bulletinBoards: newItems });
            }}
          />
          {bulletins.length < 10 && (
            <Button
              type="ghost"
              className={cx('addBtn', { disabled: editStatus.editing })}
              disabled={editStatus.editing}
              onClick={onAdd}
            >
              {_l('添加')}
            </Button>
          )}
        </div>
      </div>
      <div className="rightWrapper">
        <div className="bold mBottom8">{_l('图片')}</div>
        <div className="Gray_9e mBottom15">
          <span>
            {_l('支持 jpg、jpeg、png、gif格式，2MB以内')} <span></span>
          </span>
          <Tooltip
            themeColor="white"
            tooltipClass="suggestWrapper"
            popupPlacement="bottom"
            popupAlign={{
              overflow: { adjustX: true, adjustY: true },
            }}
            text={
              <React.Fragment>
                <div className="title">{_l('设计建议')}</div>
                <div className="description">
                  {_l(
                    '建议尺寸为 1600x480px，支持 jpg、jpeg、png、gif，2MB以内。图片在浏览器窗口尺寸变化时可能会被裁切，建议将重要信息放在中间安全区域内',
                  )}
                </div>
                <img src={suggestImg} />
              </React.Fragment>
            }
          >
            <span className="ThemeColor3 mLeft4 pointer bold">{_l('设计建议')}</span>
          </Tooltip>
        </div>
        <div
          className="image"
          style={{
            background: uploadLoading ? '#f5f5f5' : `url(${bulletins[activeIndex].url}) no-repeat center`,
          }}
        >
          <div className="customBtnWrapper">
            <QiniuUpload
              options={{
                multi_selection: false,
                filters: {
                  mime_types: [{ title: 'image', extensions: 'jpg,jpeg,png,gif' }],
                },
                type: 4,
                max_file_size: '2m',
              }}
              onUploaded={(up, file, response) => {
                up.disableBrowse(false);

                onChangeData({ key: file.key, url: file.serverName + file.key });
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
              <div className="uploadBtn">{_l('自定义')}</div>
            </QiniuUpload>
          </div>
          {uploadLoading && (
            <React.Fragment>
              <LoadDiv />
              <span className="mTop12 Gray_9e">{_l('正在上传')}</span>
            </React.Fragment>
          )}
        </div>
        <div className="picList">
          {coverUrls.map((item, index) => {
            const isActive = item === bulletins[activeIndex].key;
            const url = md.global.FileStoreConfig.pictureHost + item;
            return (
              <div
                key={index}
                className={cx('picItem', { isActive })}
                style={{ background: `url(${url}) no-repeat center` }}
                onClick={() => onChangeData({ url, key: item })}
              >
                {isActive && (
                  <div className="activeMaskWrapper">
                    <Icon icon="done" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bold mTop4">{_l('链接')}</div>
        <Input
          className="linkInput"
          placeholder={_l('例如：') + location.origin}
          value={bulletins[activeIndex].link}
          onChange={value => onChangeData({ link: value })}
        />
        <div className="bold">{_l('标题')}</div>
        <div className="mTop8 mBottom20">
          <TitleInput
            showCount={true}
            maxLength={30}
            value={bulletins[activeIndex].title}
            onChange={e => onChangeData({ title: e.target.value })}
          />
        </div>

        {(editStatus.editing || editStatus.saved) && (
          <Button
            type="primary"
            className={cx('saveBtn', { disabled: editStatus.saved })}
            disabled={editStatus.saved}
            onClick={onSave}
          >
            {editStatus.saved ? _l('已保存') : _l('保存')}
          </Button>
        )}
      </div>
    </BulletinDialog>
  );
}
