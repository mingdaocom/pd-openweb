import preall from 'src/common/preall';
import './css/style.less';
import shareajax from 'src/api/share';
import qs from 'query-string';
import doT from 'dot';
import { downloadFile } from 'src/util';
import frameTplHtml from './tpl/frame.html';
import fileItemHtml from './tpl/fileItem.html';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
var frameTpl = doT.template(frameTplHtml);
var fileItemTpl = doT.template(fileItemHtml);
import MobileSharePreview from '../shareMobile/shareMobile';
import shareFolderAjax from 'src/api/shareFolder';
import saveToKnowledge from 'src/components/saveToKnowledge/saveToKnowledge';
import { browserIsMobile, getClassNameByExt } from 'src/util';
import _ from 'lodash';

var ShareFolder = function (options) {
  var SF = this;
  var DEFAULTS = {
    isMobile: browserIsMobile(),
  };
  this.data = {
    currentFolderId: '',
    isLoadingMore: false,
    page: 0,
    pageNum: 20,
    list: [],
    listCount: 0,
  };
  let urlsearch = location.search;
  if (!urlsearch && /^#\?token(.*)/.test(location.hash)) {
    urlsearch = location.hash.match(/^#(\?token.*)/)[1];
  }
  this.urlParams = qs.parse(unescape(unescape(urlsearch.slice(1))));
  this.options = _.assign({}, DEFAULTS, options);
  this.$container = $('#app');
  var shareId;
  try {
    shareId = location.pathname.match(/.*\/apps\/kcshareFolder\/(\w+)/)[1];
  } catch (err) {}
  if (shareId) {
    shareajax.getShareFolder({ shareId, token: this.urlParams.token }).then(data => {
      if (data.node) {
        SF.sourceData = data;
        if (data.accountInfo && md.global.Account) {
          md.global.Account = data.accountInfo;
        }
        SF.init();
      } else if (data.position) {
        location.href = '/apps/kc' + data.position;
      } else {
        SF.$container.text(_l('当前文件不存在或您没有查看权限'));
      }
    });
  }
};

ShareFolder.prototype = {
  init: function () {
    var SF = this;
    this.renderFrame();
    if (this.sourceData.active) {
      this.rootNode = this.sourceData.node;
      this.data.currentFolderId = this.rootNode.id;
      var hashParams = this.getHashParams();
      var hashId = hashParams.folderId;
      if (hashId) {
        if (hashParams.preview) {
          shareFolderAjax
            .getNodeDetail({
              id: hashParams.preview,
              shareFolderId: SF.data.currentFolderId,
            })
            .then(node => {
              if (SF.options.isMobile) {
                SF.preview();
              } else {
                previewAttachments({
                  callFrom: 'kc',
                  attachments: [node],
                  showThumbnail: true,
                  shareFolderId: SF.rootNode.id,
                });
              }
            });
        }
        this.openFolder(hashId);
      } else {
        this.renderList([this.rootNode]);
        this.$container.find('.path').text(_l('全部文件'));
      }
      $('title').text(this.rootNode.name);
    } else {
      this.renderStatus('closed');
    }
    this.bindEvent();
  },
  bindEvent: function () {
    var SF = this;
    this.$container.on('click', '.fileItem', function () {
      var isFolder = $(this).data('type') == 1;
      var id = $(this).data('id');
      var index = parseInt($(this).data('index'), 10);
      var node = SF.data.list[index];
      if (isFolder) {
        SF.navigateByHash({
          folderId: id,
        });
      } else if (SF.options.isMobile) {
        SF.navigateByHash({
          folderId: SF.data.currentFolderId,
          preview: node.id,
        });
      } else {
        previewAttachments(
          {
            callFrom: 'kc',
            attachments: [node],
            showThumbnail: true,
          },
          {
            shareFolderId: SF.rootNode.id,
          },
        );
      }
    });
    $('.shareFolderCon .main').on('scroll', function (e) {
      var conHeight = $(this).height();
      var scrollTop = $(this).scrollTop();
      var contentHeight = $('.shareFolderCon .main .fileList').height();
      var listCount = SF.data.listCount;
      var renderedCount = SF.data.list.length;
      console.log(contentHeight - scrollTop - conHeight);
      if (contentHeight - scrollTop - conHeight < 30) {
        if (!SF.data.isLoadingMore && renderedCount < listCount) {
          SF.loadMoreNodes();
          var $loadingCon = $(
            '<div id="loadingCon"><div class="scaleBox"></div>' + LoadDiv() + '<div class="scaleBox"></div></div>',
          );
          SF.$fileList.append($loadingCon);
        }
      }
    });
    this.$container.find('.main').on('touchmove', function (e) {
      if (SF.data.isTouching && SF.data.isLoadingMore) {
        var deltaY = Math.abs(e.touches[0].clientY - SF.data.startPos.y);
        $('.scaleBox').height((30 * deltaY) / 300);
      }
    });
    this.$container.find('.main').on('touchstart', function (e) {
      SF.data.isTouching = true;
      if (e.touches) {
        SF.data.startPos = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    });
    this.$container.find('.main').on('touchend', function (e) {
      SF.data.isTouching = false;
      $('.scaleBox').animate({ height: 0 }, 'fast');
    });
    this.$container.find('.btnLogin').on('click', function () {
      SF.login();
    });
    this.$container.find('.saveToMingDao').on('click', function () {
      if (!md.global.Account || !md.global.Account.accountId) {
        SF.alert(_l('请先登录'));
        setTimeout(function () {
          SF.login();
        }, 1000);
      } else {
        SF.saveToKnowledge();
      }
    });
    window.addEventListener(
      'hashchange',
      function () {
        console.log(window.location.hash);
        var hashParams = SF.getHashParams();
        var id = hashParams.folderId;
        SF.$container.show();
        SF.$container.find('.footer').show();
        if (SF.$previewCon) {
          SF.$previewCon.remove();
        }
        if (hashParams.preview) {
          SF.preview();
        }
        if (id) {
          SF.openFolder(id);
        } else if (id === '') {
          SF.renderList([SF.rootNode]);
          SF.$container.find('.path').text(_l('全部文件'));
        }
      },
      false,
    );
    if (!SF.options.isMobile) {
      this.$container.find('.download').on('click', function () {
        if (SF.rootNode.canDownload) {
          window.open(downloadFile(SF.rootNode.downloadUrl + '&shareFolderId=' + SF.rootNode.id));
        } else {
          alert(_l('您权限不足，无法下载或保存。请联系文件夹管理员或文件上传者'), 3);
        }
      });
      this.$container.find('.share').on('click', function () {
        if (!md.global.Account || !md.global.Account.accountId) {
          SF.handleLogin();
          return;
        }
        var attachment = SF.rootNode;
        import('src/components/shareAttachment/shareAttachment').then(share => {
          var params = {
            attachmentType: 2,
            isKcFolder: true,
          };
          var isPicture = File.isPicture('.' + attachment.ext.slice(attachment.ext.indexOf('.') + 1));
          params.id = attachment.id;
          params.name = attachment.name;
          params.ext = '.' + attachment.ext;
          params.size = attachment.size;
          params.imgSrc = isPicture
            ? attachment.previewUrl.indexOf('imageView2') > -1
              ? attachment.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/w/490')
              : `${attachment.previewUrl}&imageView2/2/w/490`
            : undefined;
          params.node = attachment;
          share.default(params, {
            performUpdateItem: visibleType => {
              if (visibleType) {
                SF.rootNode.visibleType = visibleType;
              }
            },
          });
        });
      });
      this.$container.find('.saveToKc').on('click', function () {
        if (!md.global.Account || !md.global.Account.accountId) {
          SF.handleLogin();
          return;
        }
        SF.saveToKnowledge();
      });
    }
  },
  preview: function () {
    var SF = this;
    var hashParams = SF.getHashParams();
    SF.$previewCon = $('<div id="previewCon"></div>');
    $('body').append(SF.$previewCon);
    SF.$container.hide();
    new MobileSharePreview({
      node: SF.data.list.filter(function (node) {
        return node.id === hashParams.preview;
      })[0],
      container: '#previewCon',
      shareFolderId: SF.rootNode.id,
    });
  },
  loadMoreNodes: function () {
    var SF = this;
    var page = SF.data.page;
    var currentId = this.data.currentFolderId;
    page++;
    SF.data.isLoadingMore = true;
    SF.getNodes(currentId, page, 20)
      .then(function (data) {
        SF.$container.find('#loadingCon').remove;
        SF.data.list = SF.data.list.concat(data.list);
        SF.renderList(SF.data.list);
        SF.data.isLoadingMore = false;
        SF.data.page = page;
      })
      .fail(function () {});
  },
  renderFrame() {
    var SF = this;
    this.$container.html(
      frameTpl({
        isMobile: SF.options.isMobile,
        active: this.sourceData.active,
      }),
    );
    this.$fileList = this.$container.find('.fileList');
    const $logo = this.$container.find('.header .logo');
    $logo.html(`<img src="${_.get(md, 'global.SysSettings.brandLogoUrl') || _.get(md, 'global.Config.Logo')}" />`);
  },
  renderList: function (nodes) {
    var SF = this;
    if (nodes.length) {
      SF.$fileList.html(SF.getListHtml(nodes));
    } else {
      SF.renderStatus('empty');
    }
  },
  renderPath: function (pathArray) {
    var SF = this;
    pathArray.unshift({
      pathNodeId: '',
      pathNodeName: _l('全部文件'),
    });
    var $path;
    render(pathArray);
    if (getPathWidth() > getPathConWidth()) {
      SF.$container.find('.path').addClass('over');
      if (getPathWidth() > getPathConWidth()) {
        render(pathArray, true);
      }
    }
    function getPathConWidth() {
      return SF.$container.find('.path').width() - 32;
    }
    function getPathWidth() {
      return _.sum(
        $path.map(function (index, ele) {
          return $(ele).width();
        }),
      );
    }
    function render(pathArray, cut) {
      $path = $(
        _.compact(
          pathArray.map(function (path, index) {
            if (cut && index === 1) {
              return '<span class="ellipsis">...</span>';
            }
            if (cut && index > 1 && index < pathArray.length - 2) {
              return '';
            }
            return '<a class="ellipsis" href="' + '#folderId=' + path.pathNodeId + '">' + path.pathNodeName + '</a>';
          }),
        ).join('<span class="spliter">></span>'),
      );
      SF.$container.find('.path').html($path);
    }
  },
  getListHtml: function (nodes) {
    return nodes
      .map(function (node, index) {
        return fileItemTpl({
          index: index.toString(),
          isPicture: File.isPicture('.' + node.ext),
          className: node.type === 1 ? 'fileIcon-folder' : getClassNameByExt('.' + node.ext),
          node: node,
        });
      })
      .join('');
  },
  openFolder: function (id) {
    var SF = this;
    this.data.currentFolderId = id;
    SF.globalLoading();
    SF.getNodes(id, 0, 20)
      .then(function (data) {
        SF.data.list = data.list;
        SF.renderList(SF.data.list);
        SF.renderPath(data.position);
      })
      .fail(function () {});
  },
  getNodes: function (id, page, pageNum) {
    var SF = this;
    return shareFolderAjax
      .getNodesByShareFolderId({
        shareFolderId: SF.rootNode.id,
        rootType: 3,
        parentId: id,
        skip: page * pageNum,
        limit: pageNum,
      })
      .then(function (data) {
        SF.data.listCount = data.totalCount;
        return data;
      });
  },
  globalLoading: function () {
    var SF = this;
    if (SF.$globalLoading) {
      SF.$globalLoading.remove();
    }
    SF.$globalLoading = $('<div class="globalLoading">' + LoadDiv() + '</div>');
    SF.$fileList.append(SF.$globalLoading);
  },
  renderStatus: function (status) {
    var SF = this;
    SF.$container.find('.footer').hide();
    SF.$fileList.html(
      '<div class="statusCon">' +
        '<span class="icon icon-' +
        (status || 'closed') +
        '"></span>' +
        '<p>' +
        {
          closed: _l('已删除或分享已关闭，无法预览'),
          error: _l('出错'),
          empty: _l('没有文件'),
        }[status] +
        '</p>' +
        '</div>',
    );
  },
  navigateByHash(data) {
    window.location =
      window.location.origin + window.location.pathname + window.location.search + '#' + qs.stringify(data);
  },
  getHashParams: function () {
    return Object.assign(qs.parse(window.location.hash.slice(1)));
  },
  saveToKnowledge: function () {
    var SF = this;
    var sourceData = {};
    var kcPath = {
      type: 1,
      node: {
        id: null,
        name: _l('我的文件'),
      },
    };
    sourceData.nodeId = SF.rootNode.id;
    sourceData.isShareFolder = true;
    saveToKnowledge(2, sourceData, {
      createShare: !SF.options.isMobile,
    })
      .save(kcPath)
      .then(function (message) {
        if (SF.options.isMobile) {
          SF.alert(message || _l('已存入 知识“我的文件” 中'));
        }
      })
      .fail(function (message) {
        SF.alert(message || _l('保存失败'));
      });
  },
  handleLogin() {
    import('src/components/mdDialog/dialog').then(() => {
      const dialog = $.DialogLayer({
        container: {
          header: _l('保存到'),
          content: _l('请先登录'),
          yesText: _l('登录'),
          yesFn: () => {
            if (location.href.indexOf('.mingdao.net') > -1) {
              var newUrl =
                'https://www.mingdao.com/login?ReturnUrl=' +
                encodeURIComponent(window.location.href.replace(window.location.origin, 'https://www.mingdao.com'));
              window.location = newUrl;
            } else {
              window.location = '/login?ReturnUrl=' + encodeURIComponent(window.location.href);
            }
          },
        },
      });
    });
  },
  login() {
    if (location.href.indexOf('.mingdao.net') > -1) {
      var newUrl =
        'https://www.mingdao.com/login?ReturnUrl=' +
        encodeURIComponent(window.location.href.replace(window.location.origin, 'https://www.mingdao.com'));
      window.location = newUrl;
    } else {
      window.location = '/login?ReturnUrl=' + encodeURIComponent(window.location.href);
    }
  },
  alert: function (str, time) {
    var SF = this;
    if (!SF.options.isMobile) {
      alert(str);
      return;
    }
    clearTimeout(SF.timer);
    if (SF.$alert) {
      SF.$alert.remove();
    }
    SF.$alert = $('<div class="mobileAlertDialog" ><div class="alertDialog">' + str + '</div></div>');
    $('body').append(SF.$alert);
    SF.alertTimer = setTimeout(function () {
      SF.$alert.remove();
    }, time || 3000);
  },
};

preall({ type: 'function' }, { allownotlogin: true });
window.hello = new ShareFolder();
md.global.Config.disableKf5 = true;
