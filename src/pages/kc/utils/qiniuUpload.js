/* eslint-disable prefer-arrow-callback,no-bitwise */
/* global plupload $ mOxie*/
import { assign, endsWith, forEach, find } from 'lodash';
import { validateFileName } from '../utils';
import { UPLOAD_ERROR } from '../constant/enum';
import { getToken } from 'src/util';
import { Base64 } from 'js-base64';
let bucketTokenMap = {};
function clearUpTokenCache() {
  bucketTokenMap = {};
}

function createUploader(option) {
  option = assign(
    {
      ext_blacklist: ['exe', 'bat', 'vbs', 'cmd', 'com', 'url'],
      max_file_count: 100,
      auto_start: true,
      url: md.global.FileStoreConfig.uploadHost,
      multipart_params: { token: '' },
      max_retries: 3,
      swf_url: '/src/library/plupload/Moxie.swf',
      xap_url: '/src/library/plupload/Moxie.xap',
      dragdrop: true,
      chunk_size: '4mb',
      // max_file_size: '2g',
      bucket: 0,
    },
    option,
  );

  // 验证文件有效性
  function validateFile(file) {
    if (!validateFileName(file.name)) {
      return false;
    }
    return !find(option.ext_blacklist, ext => endsWith(file.name.toLowerCase(), ext.toLowerCase()));
  }

  (function resetChunkSize() {
    const ie = (function detectIEVersion() {
      let v = 4;
      const div = document.createElement('div');
      const all = div.getElementsByTagName('i');
      while (((div.innerHTML = '<!--[if gt IE ' + v + ']><i></i><![endif]-->'), all[0])) {
        // eslint-disable-line no-cond-assign
        v++;
      }
      return v > 4 ? v : false;
    })();
    let BLOCK_BITS, MAX_CHUNK_SIZE, chunkSize;
    const isSpecialSafari =
      (mOxie.Env.browser === 'Safari' &&
        mOxie.Env.version <= 5 &&
        mOxie.Env.os === 'Windows' &&
        mOxie.Env.osVersion === '7') ||
      (mOxie.Env.browser === 'Safari' && mOxie.Env.os === 'iOS' && mOxie.Env.osVersion === '7');
    if (ie && ie <= 9 && option.chunk_size && option.runtimes.indexOf('flash') >= 0) {
      //  link: http://www.plupload.com/docs/Frequently-Asked-Questions#when-to-use-chunking-and-when-not
      //  when plupload chunk_size setting is't null ,it cause bug in ie8/9  which runs  flash runtimes (not support html5) .
      option.chunk_size = 0;
    } else if (isSpecialSafari) {
      // win7 safari / iOS7 safari have bug when in chunk upload mode
      // reset chunk_size to 0
      // disable chunk in special version safari
      option.chunk_size = 0;
    } else {
      BLOCK_BITS = 20;
      MAX_CHUNK_SIZE = 4 << BLOCK_BITS; // 4M

      chunkSize = plupload.parseSize(option.chunk_size);
      if (chunkSize > MAX_CHUNK_SIZE) {
        option.chunk_size = MAX_CHUNK_SIZE;
      }
      // qiniu service  max_chunk_size is 4m
      // reset chunk_size to max_chunk_size(4m) when chunk_size > 4m
    }
  })();

  const initFunc = assign({}, option.init);
  delete option.init.Error;
  delete option.init.FileUploaded;
  delete option.init.FilesAdded;
  const uploader = new plupload.Uploader(option);

  uploader.init();

  uploader.bind('FilesAdded', function FilesAdded(up, files) {
    const validFiles = [];
    const invalidFiles = [];
    const tokenFiles = [];
    forEach(files, file => {
      if (validateFile(file)) {
        validFiles.push(file);
      } else {
        // file.name += '_重命名';
        // validFiles.push(file);
        invalidFiles.push(file);
      }
      let fileExt = `.${File.GetExt(file.name)}`;
      let isPic = File.isPicture(fileExt);
      tokenFiles.push({ bucket: isPic ? 4 : 3, ext: fileExt });
    });

    if (validFiles.length > option.max_file_count) {
      option.error_callback(UPLOAD_ERROR.TOO_MANY_FILES, files);
      forEach(files, file => up.removeFile(file));
      return;
    }

    if (invalidFiles.length) {
      forEach(invalidFiles, invalidFile => (invalidFile.mdUploadErrorType = UPLOAD_ERROR.INVALID_FILES));
      option.error_callback(UPLOAD_ERROR.INVALID_FILES, invalidFiles);
      forEach(invalidFiles, file => up.removeFile(file));
    }
    if (!validFiles.length) {
      return;
    }

    if (initFunc.FilesAdded) {
      initFunc.FilesAdded(up, validFiles);
    }

    let autoStart = up.getOption && up.getOption('auto_start');
    autoStart = autoStart || (up.settings && up.settings.auto_start);
    let beforeUploadCheck;
    if (option.before_upload_check) {
      beforeUploadCheck = option.before_upload_check(up, validFiles);
      if (beforeUploadCheck === false) {
        beforeUploadCheck = $.Deferred().reject();
      }
    }
    getToken(tokenFiles).then(res => {
      files.forEach((item, i) => {
        item.token = res[i].uptoken;
        item.key = res[i].key;
        item.serverName = res[i].serverName;
        item.fileName = res[i].fileName;
        item.url = res[i].url;
      });
      if (autoStart) {
        plupload.each(validFiles, file => {
          $.when(beforeUploadCheck)
            .then(() => up.start())
            .fail(failResult => {
              file.status = window.plupload.FAILED;
              up.trigger('Error', {
                file,
                code: undefined,
                message: failResult || '上传前检查失败',
              });
              up.removeFile(file);
            });
        });
      }
    });
    up.refresh();
  });

  uploader.bind('Retry', function ClearStoredProgress(up, file = {}) {
    up.stop();
    localStorage.removeItem(file.name);
    file.loaded = 0;
    file.status = window.plupload.UPLOADING;
    up.state = window.plupload.STARTED;
    up.trigger('StateChanged');
    up.trigger('BeforeUpload', file);
    up.trigger('UploadFile', file);
  });

  uploader.bind('BeforeUpload', function BeforeUpload(up, file = {}) {
    try {
      const native = file.getNative();
      if (file.size && !native.size) {
        file.notExists = true;
      }
    } catch (e) {}

    const fileExt = `.${File.GetExt(file.name)}`;

    const token = file.token;

    const directUpload = function (up, file) {
      /* eslint no-shadow:0*/
      let multipartParamsObj;
      if (option.save_key) {
        multipartParamsObj = { token };
      } else {
        multipartParamsObj = {
          token,
          key: file.key,
        };
      }

      const xVars = option.x_vars;
      if (xVars !== undefined && typeof xVars === 'object') {
        multipartParamsObj['x:serverName'] = file.serverName;
        multipartParamsObj['x:filePath'] = file.key.replace(file.fileName, '');
        multipartParamsObj['x:fileName'] = file.fileName.replace(/\.[^\.]*$/, '');
        multipartParamsObj['x:originalFileName'] = encodeURIComponent(
          file.name.indexOf('.') > -1 ? file.name.split('.').slice(0, -1).join('.') : file.name,
        );
        multipartParamsObj['x:fileExt'] = fileExt;
      }

      up.setOption({
        url: option.url,
        multipart: true,
        chunk_size: undefined,
        multipart_params: multipartParamsObj,
      });
    };

    let chunkSize = up.getOption && up.getOption('chunk_size');
    chunkSize = chunkSize || (up.settings && up.settings.chunk_size);
    if (uploader.runtime === 'html5' && chunkSize) {
      if (file.size < chunkSize) {
        directUpload(up, file);
      } else {
        let localFileInfo = localStorage.getItem(file.name);
        let blockSize = chunkSize;
        if (localFileInfo) {
          localFileInfo = JSON.parse(localFileInfo);
          const now = new Date().getTime();
          const before = localFileInfo.time || 0;
          const aDay = 24 * 60 * 60 * 1000; //  milliseconds
          if (now - before < aDay) {
            if (localFileInfo.percent !== 100) {
              if (file.size === localFileInfo.total) {
                // 通过文件名和文件大小匹配，找到对应的 localstorage 信息，恢复进度
                file.percent = localFileInfo.percent;
                file.loaded = localFileInfo.offset;
                file.ctx = localFileInfo.ctx;
                if (localFileInfo.offset + blockSize > file.size) {
                  blockSize = file.size - localFileInfo.offset;
                }
              } else {
                localStorage.removeItem(file.name);
              }
            } else {
              // 进度100%时，删除对应的localStorage，避免 499 bug
              localStorage.removeItem(file.name);
            }
          } else {
            localStorage.removeItem(file.name);
          }
        }
        up.setOption({
          url: option.url.replace(/(\/)$/, '') + '/mkblk/' + blockSize,
          multipart: false,
          chunk_size: chunkSize,
          required_features: 'chunks',
          headers: {
            Authorization: 'UpToken ' + token,
          },
          multipart_params: {},
        });
      }
    } else {
      directUpload(up, file);
    }
  });

  uploader.bind('ChunkUploaded', function ChunkUploaded(up, file, info) {
    const res = JSON.parse(info.response);
    file.ctx = file.ctx ? file.ctx + ',' + res.ctx : res.ctx;
    const leftSize = info.total - info.offset;
    let chunkSize = up.getOption && up.getOption('chunk_size');
    chunkSize = chunkSize || (up.settings && up.settings.chunk_size);
    if (leftSize < chunkSize) {
      up.setOption({
        url: option.url.replace(/(\/)$/, '') + '/mkblk/' + leftSize,
      });
    }
    localStorage.setItem(
      file.name,
      JSON.stringify({
        ctx: file.ctx,
        percent: file.percent,
        total: info.total,
        offset: info.offset,
        time: new Date().getTime(),
      }),
    );
  });

  uploader.bind('Error', function Error(up, err) {
    let errTip = '';
    let maxFileSize, errorObj, errorText;
    switch (err.code) {
      case plupload.FAILED:
        errTip = _l('上传失败。请稍后再试。');
        break;
      case plupload.FILE_SIZE_ERROR:
        maxFileSize = up.getOption && up.getOption('max_file_size');
        maxFileSize = maxFileSize || (up.settings && up.settings.max_file_size);
        errTip = _l('单个文件大小超过%0，无法支持上传', maxFileSize.toUpperCase());
        break;
      case plupload.FILE_EXTENSION_ERROR:
        errTip = _l('无法上传，不支持该格式的文件');
        break;
      case plupload.HTTP_ERROR:
        errorObj = JSON.stringify(err.response);
        errorText = errorObj.error;
        switch (err.status) {
          case 400:
            errTip = _l('上传文件发生错误，请稍后再试。');
            break;
          case 401:
            clearUpTokenCache();
            errTip = _l('客户端认证授权失败。请重试或提交反馈。');
            break;
          case 405:
            errTip = _l('客户端请求错误。请重试或提交反馈。');
            break;
          case 579:
            errTip = _l('资源上传成功，但回调失败。');
            break;
          case 599:
            errTip = _l('网络连接异常。请重试或提交反馈。');
            break;
          case 614:
            errTip = _l('文件服务器已存在同名文件，请重新上传。');
            try {
              errorObj = JSON.parse(errorObj.error);
              errorText = errorObj.error || '';
            } catch (e) {
              errorText = errorObj.error || '';
            }
            break;
          case 631:
            errTip = _l('指定空间不存在。');
            break;
          case 701:
            errTip = _l('上传数据块校验出错。请重试或提交反馈。');
            break;
          default:
            if (err.file && !err.file.type && (err.file.size || 0) % 4096 === 0) {
              errTip = _l('此浏览器不支持上传文件夹');
            } else if (err.file && err.file.notExists) {
              errTip = _l('文件不存在，请确认本地文件位置。');
            } else {
              err.message = (err.message || '') + ' ' + errorText + ' ' + err.status;
              errTip = _l('上传失败，请检查网络或稍后再试。');
            }
            break;
        }
        if (err.status) {
          errTip = errTip + '(' + err.status + (errorText ? '：' + errorText : '') + ')';
        }
        break;
      case plupload.SECURITY_ERROR:
        errTip = _l('安全配置错误。请联系客服。');
        break;
      case plupload.GENERIC_ERROR:
        errTip = _l('上传失败。请稍后再试。');
        break;
      case plupload.IO_ERROR:
        errTip = _l('上传失败。请稍后再试。');
        break;
      case plupload.INIT_ERROR:
        errTip = _l('网站配置错误。请联系客服。');
        uploader.destroy();
        break;
      case plupload.FILE_DUPLICATE_ERROR:
        errTip = _l('文件重复。');
        break;
      default:
        errTip = (err.message || '') + (err.details || '');
        break;
    }
    if (initFunc.Error) {
      initFunc.Error(up, err, errTip);
    }
    up.refresh(); // Reposition Flash/Silverlight
  });

  uploader.bind('FileUploaded', function (up, file, info) {
    info.response = JSON.parse(info.response);
    if (!info.response.ctx) {
      if (initFunc.FileUploaded) {
        initFunc.FileUploaded(up, file, info);
      }
    } else {
      let fileExt = `.${File.GetExt(file.name)}`;
      let isPic = File.isPicture(fileExt);
      getToken([{ bucket: isPic ? 4 : 3, ext: fileExt }]).then(res => {
        $.ajax({
          url:
            option.url.replace(/(\/)$/, '') +
            '/mkfile/' +
            (file.size ? file.size : 0) +
            '/key/' +
            Base64.encode(res[0].key),
          type: 'POST',
          beforeSend: request => {
            request.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
            request.setRequestHeader('Authorization', 'UpToken ' + res[0].uptoken);
          },
          data: file.ctx,
          processData: false,
        }).then(response => {
          if (typeof response === 'string') {
            response = JSON.parse(response);
          }
          if (initFunc.FileUploaded) {
            initFunc.FileUploaded(up, file, { response });
          }
        });
      });
    }
  });

  return uploader;
}

module.exports = {
  createUploader,
};
