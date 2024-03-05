import createShare from 'src/components/createShare/createShare';
import kc from 'src/api/kc';
import kcUtil from 'src/pages/kc/util';
import attachmentAjax from 'src/api/attachment';

var copyNode = kc.copyNode;
var addNode = kc.addNode;

var NODE_TYPE = {
  QINIU: 0,
  COMMON: 1,
  KC: 2,
};

var SaveToKnowledge = function (nodeType, sourceData, options) {
  this.sourceData = sourceData;
  this.options = Object.assign(
    {
      createShare: true,
    },
    options
  );
  this.nodeType = nodeType;
};

SaveToKnowledge.prototype = {
  save: function (path, callback) {
    var promise = $.Deferred();
    var SK = this;
    var nodeType = SK.nodeType;
    var sourceData = SK.sourceData;
    var rootId = '';
    var parentId = '';
    var B_PICK_TYPE = {
      MYFILE: 1,
      ROOT: 2,
      CHILDNODE: 3,
    };
    if (nodeType === NODE_TYPE.KC) {
      copyNode({
        ids: [sourceData.nodeId],
        allowDown: sourceData.allowDown,
        des: sourceData.des,
        toId: path.node.id,
        toType: path.type,
        copySource: false,
        isShareFolder: sourceData.isShareFolder,
      })
        .then(data => {
          var successIds = data[1];
          var message = kcUtil.getKcFolderOperationTips(data, {
            success: _l('保存成功'),
          });
          if (successIds.length) {
            promise.resolve(message);
          } else {
            promise.reject(message);
          }
        })
        .fail(() => {
          promise.reject();
        });
    } else if (nodeType === NODE_TYPE.QINIU) {
      var attPath = sourceData.filePath;
      var pathSuffix = attPath.indexOf('?') > 0 ? attPath.substring(attPath.indexOf('?'), attPath.length) : '';
      var filePath = attPath.replace(pathSuffix, '');
      if (path.type === B_PICK_TYPE.ROOT) {
        parentId = rootId = path.node.id;
      } else if (path.type === B_PICK_TYPE.CHILDNODE) {
        parentId = path.node.id;
        rootId = path.node.rootId;
      }
      addNode({
        name: sourceData.name,
        filePath: filePath,
        type: 2,
        parentId: parentId,
        rootId: rootId,
        allowDown: sourceData.allowDown,
        des: sourceData.des,
        source: {
          type: 6,
          sourceContent: '',
        },
      })
        .then(data => {
          if (!data) {
            promise.reject();
          }
          promise.resolve();
        })
        .fail(() => {
          promise.reject();
        });
    } else {
      if (path.type === B_PICK_TYPE.ROOT) {
        parentId = rootId = path.node.id;
      } else if (path.type === B_PICK_TYPE.CHILDNODE) {
        parentId = path.node.id;
        rootId = path.node.rootId;
      }
      SK.ajaxAttachmentToKc(sourceData.fileID, parentId, rootId, sourceData.originalFileName, sourceData.allowDown, sourceData.des)
        .then(data => {
          if (data === true) {
            promise.resolve();
          } else {
            promise.reject();
          }
        })
        .fail(() => {
          promise.reject();
        });
    }
    return promise.then(() => {
      if (SK.options.createShare) {
        createShare({
          linkURL:
            md.global.Config.WebUrl +
            'apps/kc/' +
            (path.type === 1
              ? 'my'
              : path.type === 2 ? path.node.id : path.node.rootId ? path.node.position.slice(1) : path.node.position.replace(/\/.{8}(-.{4}){3}-.{12}/, 'my')),
          content: _l('保存成功'),
        });
      }
    });
  },
  ajaxAttachmentToKc: function (fileID, toId, toRootId, originalFileName, allowDown, des) {
    var SK = this;
    return attachmentAjax.saveToKnowledge(
      SK.filterUndefined({
        fileID: fileID,
        originalFileName: originalFileName,
        allowDown: allowDown,
        des: des,
        parentID: toId,
        rootID: toRootId,
      })
    );
  },
  filterUndefined: function (json) {
    for (var key in json) {
      if (typeof json[key] === 'undefined') {
        delete json[key];
      }
    }
    return json;
  },
};

export default function (nodeType, sourceData, options) {
  return new SaveToKnowledge(nodeType, sourceData, options);
};
