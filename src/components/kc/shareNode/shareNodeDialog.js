import './shareNodeDialog.css';
import '../layerMain.css';
var Clipboard = require('clipboard');

var NODE_VISIBLE_TYPE = {
  CLOSE: 1, //关闭分享
  PROJECT: 2, // 本网络可见
  MDUSER: 3, // 登录后可见
  PUBLIC: 4, // 允许任何人查看
};

module.exports = function shareNodeDialog(node, isBelongAccount) {
  var resultDfd = $.Deferred();
  var dfd = $.Deferred();
  require(['mdDialog', 'dot'], function(mdDialog, doT) {
    mdDialog.index({
      dialogBoxID: 'k2ShareNode_' + node.id,
      className: 'kcDialogBox',
      width: 496,
      container: {
        header: _l('分享'),
        content: doT.template(
                 '<div class="k2ShareNodeDialog Font14">' +
                 '{{var nodeItem = it.node;}}' +
                 '  <div class="nodeName Bold Font18"><span class="ellipsis name">{{! nodeItem.name}}</span>.<span class="ellipsis ext">{{= nodeItem.ext}}</span></div>' +
                 '  <div class="statusFlag"><i class="icon-task-responsible"></i><span>' + (_l('成功创建分享链接')) + '</span></div>' +
                 '  <div class="sharedLinks"><span>' + (_l('分享链接:')) + '</span><input readonly id="linkUrl_{{= nodeItem.id}}" class="linkUrl" value="{{= nodeItem.shareUrl || ""}}"/><span data-clipboard-action="copy" data-clipboard-target="#linkUrl_{{= nodeItem.id}}" class="btnBootstrap ThemeBGColor3 btnCopy">{{!_l("复制")}}</span></div>' +
                 '  <div class="sharedSetting"><div class="Left">{{!_l("链接浏览限制:")}} </div><ul class="settingUL">' +
                 '    {{var arr = [{name: _l("关闭文件的分享")}, {name: it.isBelongAccount ? _l("允许所有联系人查看") : _l("允许本组织的成员查看")}, {name: _l("允许任何人查看")}];}}' +
                 '    {{~arr :v:i}}' +
                 '    <li><label {{? !nodeItem.canChangeSharable}}class="Gray_9"{{?}}><input data-type="{{= i+1}}" type="radio" name="shareType_{{= nodeItem.id}}" value="{{= i+1}}" {{? !nodeItem.canChangeSharable}}disabled = "true"{{?}}/>{{= v.name}}</label></li>' +
                 '    {{~}}' +
                 '  </ul></div>' +
                 '</div>'
                 )({node: node, isBelongAccount : isBelongAccount}),
        yesFn: function () {
          var shareType = $('#k2ShareNode_' + node.id).find('[name=shareType_' + node.id + ']:checked').data('type');
          shareType = shareType === NODE_VISIBLE_TYPE.MDUSER ? NODE_VISIBLE_TYPE.PUBLIC : shareType;//对应后台枚举值
          if(shareType === node.visibleType) {
            return resultDfd.resolve();
          }
          dfd.resolve(shareType);
        },
      },
      readyFn: function () {
        var $shareNode = $('#k2ShareNode_' + node.id);
        var $inputs = $shareNode.find('input[value=' + (node.visibleType === NODE_VISIBLE_TYPE.MDUSER ||  node.visibleType === NODE_VISIBLE_TYPE.PUBLIC ? 3 : node.visibleType) + ']');
        $inputs.prop('checked', true);
        if (!node.canChangeSharable) { $inputs.prop('disabled', true); }

        var clipboard = new Clipboard('.btnCopy');
        clipboard.on('success', function () {
          alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
        });
      }
    });
  });
  dfd.then(function (shareType) {
      require(['src/api/kc'], function (ajax) {
      ajax.updateNode({id: node.id, visibleType: shareType}).then(function (result) {
        return result ? resultDfd.resolve(shareType) : resultDfd.reject(result);
      }, function(result) {
        resultDfd.reject(result);
      });
    });
  });
  return resultDfd.promise();
};
