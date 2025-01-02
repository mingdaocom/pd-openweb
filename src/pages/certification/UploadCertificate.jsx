import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, QiniuUpload, Icon } from 'ming-ui';

const Wrapper = styled.div`
  .addBtn {
    padding: 0 16px !important;
    display: flex;
    align-items: center;
    transition: none;
    span {
      color: #151515;
    }
    .icon {
      color: #9e9e9e;
      font-size: 18px;
    }
    &:hover {
      border-color: #2196f3 !important;
      span {
        color: #2196f3;
      }
      .icon {
        color: #2196f3;
      }
    }

    .icon-loading_button {
      display: inline-block;
      animation: loadingRotate 1s linear infinite;
      @keyframes loadingRotate {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    }
  }
  .imgWrap {
    width: 180px;
    height: 130px;
    margin-top: 10px;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .mask {
      opacity: 0;
      background-color: rgba(0, 0, 0, 0.6);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      .deleteBtn {
        width: 32px;
        height: 24px;
        background: #fff;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        left: 12px;
        bottom: 12px;
        &:hover {
          .Icon {
            color: red !important;
          }
        }
      }
    }
    &:hover {
      .mask {
        opacity: 1;
      }
    }
  }
`;

export default function UploadCertificate(props) {
  const { value, onChange } = props;
  const [uploading, setUploading] = useState(false);

  return (
    <Wrapper>
      <QiniuUpload
        options={{
          multi_selection: false,
          filters: {
            mime_types: [{ title: 'image', extensions: 'jpg,jpeg,png' }],
          },
          max_file_size: '5m',
          bucket: 3,
          type: 23,
          error_callback: () => {
            alert(_l('有不合法的文件格式，请重新选择图片上传'), 3);
            return;
          },
        }}
        onUploaded={(up, file, response) => {
          up.disableBrowse(false);
          setUploading(false);
          onChange(file);
        }}
        onAdd={(up, files) => {
          setUploading(true);
          up.disableBrowse();
        }}
        onError={(up, err, errTip) => {
          alert(errTip, 2);
        }}
      >
        <Button type="ghostgray" className="addBtn">
          {uploading ? <Icon icon="loading_button" /> : <Icon icon="attachment" />}
          <span className="mLeft6 bold Font13">{_l('添加附件')}</span>
        </Button>
      </QiniuUpload>
      {value && (
        <div className="imgWrap">
          <img src={`${value.url}&imageView2/1/w/180/h/130`} />
          <div className="mask">
            <div className="deleteBtn Hand" onClick={() => onChange(null)}>
              <Icon icon="task-new-delete" className="Gray_9e Font17" />
            </div>
          </div>
        </div>
      )}
    </Wrapper>
  );
}
