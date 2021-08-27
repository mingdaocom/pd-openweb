import kcCtrl from 'src/api/kc';
import qiniuCtrl from 'src/api/qiniu';
import { Dialog } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import React from 'react';
import 'src/pages/PageHeader/components/NetState/index.less';
import { formatFileSize } from 'src/util';
const {dialog: {netState: {buyBtn}}} = window.private;

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

export const getUploadToken2 = ({ isPublic, bucket }) => {
  return new Promise((resolve, reject) => {
    let qiniuFetch, args;
    if (isPublic) {
      qiniuFetch = qiniuCtrl.getFileUploadToken;
    } else {
      qiniuFetch = qiniuCtrl.getUploadToken;
    }
    args = { bucket };
    qiniuFetch(args)
    .then(result => {
      if (result && result.uptoken) {
        resolve(result.uptoken);
      }
    });
  });
};

const request = {
  doc({ isPublic }) {
    return QiniuUpload.Tokens.upDocToken ? Promise.resolve(QiniuUpload.Tokens.upDocToken) : getUploadToken2({ isPublic, bucket: 3 }).then();
  },
  pic({ isPublic }) {
    return QiniuUpload.Tokens.upPicToken ? Promise.resolve(QiniuUpload.Tokens.upPicToken) : getUploadToken2({ isPublic, bucket: 4 }).then();
  },
};

export const getToken2 = ({ isPublic }) => {
  if (!md.global.Account.accountId) {
    isPublic = true;
  }
  const requestList = [request.doc({ isPublic }), request.pic({ isPublic })];
  return Promise.all(requestList).then(result => {
    QiniuUpload.Tokens.upDocToken = result[0];
    QiniuUpload.Tokens.upPicToken = result[1];
    return Promise.resolve({
      doc: {
        token: QiniuUpload.Tokens.upDocToken,
        serverName: md.global.FileStoreConfig.documentHost,
      },
      pic: {
        token: QiniuUpload.Tokens.upPicToken,
        serverName: md.global.FileStoreConfig.pictureHost,
      },
    });
  });
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
  for (let i = 0, length = files.length; i < length; i++) {
    if (File.isValid('.' + File.GetExt(files[i].name))) count++;
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
  const data = JSON.parse(response);

  item.fileID = file.id;
  item.fileSize = file.size || 0;
  item.serverName = data.serverName;
  item.filePath = data.filePath;
  item.fileName = data.fileName;
  item.fileExt = data.fileExt;
  item.originalFileName = data.originalFileName;
  item.key = data.key;
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

const VERSION = {
  // 免费
  0: '免费版',
  // 正式版
  1: {
    0: '单应用版',
    1: '标准版',
    2: '专业版',
    3: '旗舰版',
  },
  // 试用
  2: '专业版',
};

const VERSION_STORAGE = {
  // 免费
  0: '2',
  // 正式版
  1: {
    0: '25',
    1: '50',
    2: '150',
    3: '300',
  },
  // 试用
  2: '150',
};

export const openNetStateDialog = projectId => {
  const {version = {}, licenseType} = _.find(md.global.Account.projects, item => item.projectId === projectId) || {}

  const displayObj = (key) => {
    const data = key === 'version' ? VERSION : VERSION_STORAGE
    return licenseType === 1 ? data[licenseType][version.versionId] : data[licenseType]
  }
  Dialog.confirm({
    className: 'upgradeVersionDialogBtn',
    title: '',
    description: (
      <div className="netStateWrap">
        <div className="imgWrap" />
        <div className="hint">{_l('您的当年应用附件上传量已到最大值')}</div>
        <div className="explain">{_l('%0每年最多 %1G，请升级以继续', displayObj('version'), displayObj)}</div>
      </div>
    ),
    noFooter: buyBtn,
    okText: licenseType ? _l('购买上传量扩展包') : _l('立即购买'),
    onOk: () =>
      licenseType
      ? navigateTo(`/admin/expansionservice/${projectId}/storage`)
      : navigateTo(`/upgrade/choose?projectId=${projectId}`),
    removeCancelBtn: true,
  });
}

export const openMdDialog = () => {
  require(['mdDialog'], function (mdDialog) {
    mdDialog.index({
      container: {
        content: `<div id="uploadStorageOverDialog">
                    <div class="mTop20 mLeft30">
                      <div class="uploadStorageOverLogo Left"></div>
                      <div class="uploadStorageOverTxt Left">您已经没有足够的流量来上传该附件！</div>
                      <div class="Clear"></div>
                    </div>
                    <div class="mTop20 mBottom20 TxtCenter">
                      <a href="/personal?type=enterprise" class="uploadStorageOverBtn btnBootstrap btnBootstrap-primary btnBootstrap-small">升级至专业版</a>
                    </div>
                  </div>`,
        width: 450,
        yesText: false,
        noText: false,
      },
    });
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
