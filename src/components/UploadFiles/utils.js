import React from 'react';
import _ from 'lodash';
import { Modal } from 'ming-ui/antd-components';
import 'src/pages/PageHeader/components/NetState/index.less';
import { formatFileSize } from 'src/utils/core/file';
import RegExpValidator from 'src/utils/domain/validation/expression';
import { pathCompletion } from 'src/utils/platform/navigation/path';

export const QiniuUpload = {
  Tokens: {
    upMediaToken: '', // 私信token 公开空间
    upPubToken: '', // 其它token 公开空间 如：BUG反馈
    upPicToken: '', // 上传图片token 公开空间
    upDocToken: '', // 上传文档token 私密空间
  },
  Types: {
    media: 1,
    pub: 2,
    mainWeb: 3,
  },
};

export const getRandStr = length => {
  let randStrArr = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];

  let randArr = [];

  for (let i = 0; i < length; i++) {
    randArr.push(randStrArr[Math.floor(Math.random() * randStrArr.length)]);
  }

  return randArr.join('');
};

export const getHashCode = str => {
  str = str + '';
  let h = 0;
  let off = 0;
  let len = str.length;

  for (let i = 0; i < len; i++) {
    h = 31 * h + str.charCodeAt(off++);
    if (h > 0x7fffffff || h < 0x80000000) {
      h = h & 0xffffffff;
    }
  }

  return h;
};

export const isValid = files => {
  let count = 0;
  let canSvg = !window.isPublicWorksheet;

  for (let i = 0, length = files.length; i < length; i++) {
    if (
      RegExpValidator.validateFileExt('.' + RegExpValidator.getExtOfFileName(files[i].name)) &&
      ((RegExpValidator.getExtOfFileName(files[i].name) !== 'svg' && !canSvg) || canSvg)
    )
      count++;
  }

  return count !== files.length;
};

export const getAttachmentTotalSize = (files, maxTotalSize = 1024 * 4) => {
  let totalSize = 0;

  for (let i = 0, length = files.length; i < length; i++) {
    if (files[i].fileSize) {
      totalSize += files[i].fileSize;
    }
  }

  return {
    totalSize: formatFileSize(totalSize),
    currentPrograss: (totalSize / 1024 / 1024 / maxTotalSize) * 100,
  };
};

export const findIndex = (res, id) => {
  let index = -1;

  for (let i = 0, length = res.length; i < length; i++) {
    if (res[i].fileID === id) {
      index = i;
      break;
    }
  }

  return index;
};

export const openMdDialog = () => {
  let closeDialog;

  closeDialog = Modal.confirm({
    width: 450,
    footer: null,
    content: (
      <div id="uploadStorageOverDialog">
        <div className="mTop20 mLeft30">
          <div className="uploadStorageOverLogo Left"></div>
          <div className="uploadStorageOverTxt Left">{_l('您已经没有足够的流量来上传该附件！')}</div>
          <div className="Clear"></div>
        </div>
        <div className="mTop20 mBottom20 TxtCenter">
          <a
            href={pathCompletion('/dashboard')}
            className="uploadStorageOverBtn btnBootstrap btnBootstrap-primary btnBootstrap-small"
            onClick={event => {
              if (_.isFunction(window.openOrganizationDrawer)) {
                event.preventDefault();
                closeDialog(false);
                window.openOrganizationDrawer();
              }
            }}
          >
            {_l('升级至专业版')}
          </a>
        </div>
      </div>
    ),
  }).destroy;
};

export const findIsId = (id, files) => {
  let result = false;

  for (let i = 0, length = files.length; i < length; i++) {
    if (files[i].id === id) {
      result = true;
      break;
    }
  }

  return result;
};

// 文件类型验证
export const checkFileExt = (filetype = '', fileExt = '') => {
  const { type = '', values = [] } = JSON.parse(filetype || '{}');
  fileExt = fileExt.replace('.', '');
  let verifyExt = true;

  const FileExts = {
    0: values,
    1: ['JPG', 'JPEG', 'PNG', 'Gif', 'WebP', 'Tiff', 'bmp', 'HEIC', 'HEIF'],
    3: ['WAV', 'FLAC', 'APE', 'ALAC', 'WavPack', 'MP3', 'M4a', 'AAC', 'Ogg Vorbis', 'Opus', 'Au', 'MMF', 'AIF'],
    4: ['MP4', 'AVI', 'MOV', 'WMV', 'MKV', 'FLV', 'F4V', 'SWF', 'RMVB', 'MPG'],
  };

  if (_.includes(['0', '1', '3', '4'], type)) {
    verifyExt = FileExts[type].some(i => fileExt.toLowerCase() === i.toLowerCase());
  } else if (_.includes(['2'], type)) {
    const tempFileExts = Object.keys(FileExts).reduce((total, cur) => {
      if (_.includes(['0', '2'], type)) {
        return (total = total.concat(FileExts[cur]));
      }
    }, []);
    verifyExt = tempFileExts.every(i => !(fileExt.toLowerCase() === i.toLowerCase()));
  }

  const errorText =
    type === '2'
      ? _l('上传失败，请选择除图片、音频、视频以外的文件')
      : _l('上传失败，请选择%0文件', FileExts[type].join('、'));
  return { verifyExt, errorText };
};

export const checkFileAvailable = (fileSettingInfo = {}, files = [], tempCount = 0) => {
  const { maxcount, max, filetype } = fileSettingInfo;
  const count = tempCount + files.length;
  let isAvailable = true;

  // 附件数量
  if (maxcount && count > Number(maxcount)) {
    alert(_l('最多上传%0个文件', maxcount), 2);
    isAvailable = false;
  }

  if (isAvailable) {
    isAvailable = files.every(itemField => {
      // 有限制条件的校验
      if (filetype && JSON.parse(filetype || '{}').type) {
        const { verifyExt, errorText } = checkFileExt(
          filetype,
          itemField.name ? RegExpValidator.getExtOfFileName(itemField.name) : itemField.fileExt,
        );

        if (!verifyExt) {
          alert(errorText, 2);
          return false;
        }
      }

      if (max && (itemField.size || itemField.fileSize) > parseFloat(max) * 1000 * 1000) {
        alert(_l('上传失败，无法上传大于%0MB的文件', max), 2);
        return false;
      }

      return true;
    });
  }

  return isAvailable;
};
