import kcCtrl from 'src/api/kc';
import React from 'react';
import 'src/pages/PageHeader/components/NetState/index.less';
import { formatFileSize } from 'src/util';
import _ from 'lodash';
import { Dialog } from 'ming-ui';

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
    if (File.isValid('.' + File.GetExt(files[i].name)))
      count++;
  }
  return count !== files.length;
};

export const formatTemporaryData = res => {
  return res.map(item => {
    if (item.accountId) {
      return {
        fileExt: item.ext,
        filePath: item.filepath,
        fileName: item.filename,
        fileID: item.fileID,
        fileSize: item.filesize,
        originalFileName: item.originalFilename,
        oldOriginalFileName: item.originalFilename,
        commentID: item.commentID,
        sourceID: item.sourceID,
        twice: item,
      };
    } else {
      if (!item.key) {
        item.key = `${item.filePath}${item.fileName}${item.fileExt}`;
      }
      if (!item.fileID) {
        item.fileID = Date.now();
      }
      return item;
    }
  });
};

export const formatKcAttachmentData = res => {
  return res.map(item => {
    if (!item.isUpload && !item.twice) {
      return {
        refId: item.refId || item.id,
        fileExt: item.ext && item.ext.indexOf('.') >= 0 ? item.ext : `.${item.ext}`,
        filePath: item.filepath,
        fileName: item.filename,
        fileID: item.fileID || item.id,
        fileSize: item.filesize || item.size,
        originalFileName: item.originalFilename || item.name,
        commentID: item.commentID,
        sourceID: item.sourceID,
        allowDown: item.isDownloadable,
        viewUrl: File.isPicture('.' + item.ext) ? item.viewUrl : null,
        type: item.type,
        twice: item,
      };
    } else {
      return item;
    }
  });
};

export const formatResponseData = (file, response) => {
  /*
  // 将七牛返回的数据临时转成该系统的数据，便于给组件显示

  const item = {};
  const data = JSON.parse(response);

  item.fileID = file.id;
  item.filesize = Number(data.fsize);
  item.ext = data.fileExt;
  item.originalFilename = data.originalFileName;
  item.oldOriginalFilename = data.originalFileName;
  item.filepath = `${ data.serverName }${ data.filePath }`;
  item.filename = `${ data.fileName }${ data.fileExt }`;

  return item;
  */

  const item = {};
  const data = _.isString(response) ? JSON.parse(response) : response;

  item.fileID = file.id;
  item.fileSize = file.size || 0;
  item.serverName = data.serverName;
  item.filePath = data.filePath;
  item.fileName = data.fileName;
  item.fileExt = data.fileExt;
  item.originalFileName = data.originalFileName;
  item.key = data.key;
  item.url = file.url;
  item.oldOriginalFileName = item.originalFileName;
  if (!File.isPicture(item.fileExt)) {
    item.allowDown = true;
    item.docVersionID = '';
  }
  return item;
};

export const getFilesSize = files => {
  let totalSize = 0;

  for (let i = 0, length = files.length; i < length; i++) {
    if (files[i].size) {
      totalSize += files[i].size;
    }
  }
  return totalSize;
};

export const getAttachmentTotalSize = files => {
  let totalSize = 0;
  let currentPrograss = 0;

  for (let i = 0, length = files.length; i < length; i++) {
    if (files[i].fileSize) {
      totalSize += files[i].fileSize;
    }
  }

  return {
    totalSize: formatFileSize(totalSize),
    currentPrograss: (totalSize / 1024 / 1024 / 2048) * 100,
  };
};

export const getFileExtends = fileName => {
  return fileName.substring(fileName.lastIndexOf('.') + 1);
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

export const checkAccountUploadLimit = (size, params = {}) => {
  return kcCtrl.getUsage(params).then(function (usage) {
    return usage.used + size < usage.total;
  });
};

export const openMdDialog = () => {
  Dialog.confirm({
    width: 450,
    noFooter: true,
    children: (
      <div id="uploadStorageOverDialog">
        <div className="mTop20 mLeft30">
          <div className="uploadStorageOverLogo Left"></div>
          <div className="uploadStorageOverTxt Left">{_l('您已经没有足够的流量来上传该附件！')}</div>
          <div className="Clear"></div>
        </div>
        <div className="mTop20 mBottom20 TxtCenter">
          <a
            href="/personal?type=enterprise"
            className="uploadStorageOverBtn btnBootstrap btnBootstrap-primary btnBootstrap-small"
          >
            {_l('升级至专业版')}
          </a>
        </div>
      </div>
    ),
  });
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

export const isDocument = fileExt => {
  var fileExts = [
    '.doc',
    '.docx',
    '.dotx',
    '.dot',
    '.dotm',
    '.xls',
    '.xlsx',
    '.xlsm',
    '.xlm',
    '.xlsb',
    '.ppt',
    '.pptx',
    '.pps',
    '.ppsx',
    '.potx',
    '.pot',
    '.pptm',
    '.potm',
    '.ppsm',
    '.pdf',
  ];
  if (fileExt) {
    fileExt = fileExt.toLowerCase();
    return fileExts.indexOf(fileExt) >= 0;
  }
  return false;
};

export const formatTime = (seconds = 0) => {
  let minute = parseInt((seconds / 60) % 60);
  let hour = parseInt(seconds / 60 / 60);
  let second = parseInt(seconds % 60);

  minute = minute >= 10 ? minute : `0${minute}`;
  second = second >= 10 ? second : `0${second}`;

  return hour ? `${hour}:${minute}:${second}` : `${minute}:${second}`;
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
          itemField.name ? File.GetExt(itemField.name) : itemField.fileExt,
        );
        if (!verifyExt) {
          alert(errorText, 2);
          return false;
        }
      }
      if (max && (itemField.size || itemField.fileSize) > parseFloat(max) * 1024 * 1024) {
        alert(_l('上传失败，无法上传大于%0MB的文件', max), 2);
        return false;
      }
      return true;
    });
  }
  return isAvailable;
};
