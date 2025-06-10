import React from 'react';
import { renderToString } from 'react-dom/server';
import doT from 'dot';
import _ from 'lodash';
import { Dialog, LoadDiv } from 'ming-ui';
import ajax from 'src/api/kc';
import { expireDialogAsync } from 'src/components/upgradeVersion';
import { getClassNameByExt, htmlEncodeReg } from 'src/utils/common';
import nodeTpl from './tpl/nodeTpl.html';
import rootTpl from './tpl/rootTpl.html';
import '../layerMain.css';
import './folderSelectStyle.css';

const loading = renderToString(<LoadDiv />);

var PICK_TYPE = {
    MYFILE: 1,
    ROOT: 2,
    CHILDNODE: 3,
  },
  NODE_STATUS = {
    DELETED: -1,
    ALL: 0, // 所有
    NORMAL: 1, // 正常
    RECYCLED: 2, // 回收站
  },
  NODE_TYPE = {
    ALL: 0,
    FOLDER: 1,
    FILE: 2,
  },
  PERMISSION_TYPE = {
    NONE: -1,
    ALL: 0,
    OWNER: 1, // 拥有者
    ADMIN: 2, // 管理员
    NORMAL: 3, // 可编辑（原普通成员）
    READONLY: 4, // 只读
  };
var ROOT_TYPE = {
  MY: 0,
  PROJECT: 1,
  PERSON: 2,
};

var SELECT_TYPE = {
  ALL: 0,
  FOLDER: 1,
  FILE: 2,
};

var FolderSelect = function (param) {
  var dafaults = {
    dialogTitle: _l('选择文件'), //弹层title
    btnName: _l('确定'), // 弹层确定按钮的文字
    isFolderNode: 2, //是否仅选择文件夹 0--所有 1--选择文件夹  2--选择文件
    selectedItems: null, //被选择的节点ID数组
    appointRoot: null, //指定的Root
    reRootName: false, //当返回子节点时 是否返回根节点名称
    callback: null, //确定选择的文件的回调
  };
  var options = {
    visibleType: [
      {
        name: _l('关闭该文件的分享'),
        desc: _l('不可通过链接预览此文件'),
        id: 1,
      },
      {
        name: _l('允许本组织的成员查看'),
        desc: {
          account: _l('共享文件夹拥有者的联系人通过链接预览此文件'),
          project: _l('文件所属的组织，其成员可预览'),
        },
        id: 2,
      },
      {
        name: _l('允许任何人查看'),
        desc: _l('无需登录，任何人可预览'),
        id: 4,
      },
    ],
    folderNode: null, //所需选择节点的数据
    rootType: null, //文件节点  所属跟节点的分类类型  myFile  Root
    parentId: null, //当前列表的父节点ID
    keywords: null,
    parentCount: null,
    skip: 0,
    limit: 10,
  };

  this.settings = $.extend(true, dafaults, param, options);
  this.init();
};
var $folderContent = null;
$.extend(FolderSelect.prototype, {
  init: function () {
    var folderSelect = this;
    var settings = folderSelect.settings;

    settings.dialog = null;
    Dialog.confirm({
      dialogClasses: 'folderSelectDialog',
      width: 500,
      zIndex: settings.zIndex,
      title: settings.dialogTitle,
      children: (
        <div className="folderContent">
          <div className="folderUrl flexRow">
            <div className="positionUrl flexRow flex" style={{ minWidth: 0 }}>
              <span className="levelName ThemeColor3 startTag">{_l('全部文件')}</span>
            </div>
            <div className="operation">
              <span className="folderSearch">
                <input className="searchFolder animated" placeholder={_l('请输入文件名称并回车')} />
                <i className="icon-search"></i>
              </span>
              <span className="createFolder icon-createFolder"></span>
            </div>
          </div>
          <div className="folderNode" dangerouslySetInnerHTML={{ __html: loading }}></div>
          <div className="selectedHint">
            <div className="selectedItem Hidden">
              已选中<span className="selectedNum"></span>个文件
            </div>
            <div className="radioItem Hidden ellipsis"></div>
          </div>
          <div className="nodeVisibleType"></div>
        </div>
      ),
      okText: settings.btnName,
      onOk: async () => {
        var $nodeItem = $folderContent.find('.folderNode .nodeItem');
        var selectedNode = [];
        var isRoot = null;
        var resultType = null;
        var resultNode = null;
        var getNodeAjax = false;
        settings.rootFolder = $('.shareRoot, .myRoot').data() ? $('.shareRoot, .myRoot').data().root : '';
        //有选择当前目录下的文件夹
        $nodeItem.each(function () {
          var $this = $(this);
          if ($this.hasClass('ThemeBGColor5')) {
            if ($this.data('rootType')) {
              isRoot = $this.data('rootType');
              selectedNode.push({
                id: $this.data('rootId'),
                name: $this.data('name'),
                projectId: $this.data('projectId') || $this.closest('.project').data('projectId'),
              });
            } else {
              selectedNode.push($this.data('node'));
            }
          }
        });

        if (selectedNode && selectedNode.length) {
          if (settings.isFolderNode == SELECT_TYPE.FOLDER) {
            //是否是根目录文件
            if (isRoot) {
              if (isRoot == PICK_TYPE.MYFILE) {
                resultType = PICK_TYPE.MYFILE;
                resultNode = { id: null, name: '我的文件' };
              } else {
                resultType = PICK_TYPE.ROOT;
                resultNode = selectedNode[0];
                expireDialogAsync(resultNode.projectId).catch(function () {
                  var msg = '网络已过期';
                  throw msg;
                });
              }
              settings.rootFolder = {
                id: selectedNode[0].id,
                projectId: selectedNode[0].projectId,
              };
            } else {
              resultType = PICK_TYPE.CHILDNODE;
              resultNode = selectedNode[0];
            }
            folderSelect.settings.currentFolder = {
              node: {
                id: resultNode.id,
                parendId: resultNode.parendId,
                projectId: resultNode.projectId,
                name: resultNode.name,
                position: resultNode.position,
              },
            };
          } else if (settings.isFolderNode == SELECT_TYPE.FILE) {
            if (isRoot) {
              isRoot == PICK_TYPE.MYFILE
                ? folderSelect.getNodeList(PICK_TYPE.MYFILE, { id: null, name: _l('我的文件') })
                : folderSelect.getNodeList(PICK_TYPE.ROOT, selectedNode[0]);
              return true;
            } else {
              resultNode = selectedNode.filter(function (node) {
                return node && node.type == NODE_TYPE.FILE;
              });

              if (resultNode && resultNode.length > 0) {
                resultType = PICK_TYPE.CHILDNODE;
              } else {
                if (selectedNode[0].type == 1) {
                  folderSelect.getNodeList(PICK_TYPE.CHILDNODE, selectedNode[0]);
                  return true;
                }
              }
            }
          }

          if (resultType && !getNodeAjax) {
            var resObj = { type: parseInt(resultType), node: resultNode };
            if (resultType === PICK_TYPE.CHILDNODE && settings.reRootName) {
              var currentRoot = $folderContent.find('.folderUrl .shareRoot, .folderUrl .myRoot').data('root');
              resObj = $.extend(resObj, {
                rootName: currentRoot.name,
              });
            }
            folderSelect.savePos(resObj);
            folderSelect.savePos(resObj, true);
            settings.resolve(resObj);
            return false;
          } else {
            var num = 0;
            var setTime = setInterval(function () {
              $folderContent.find('.folderNode').toggleClass('noItemBox');
              if (num++ > 3) {
                $folderContent.find('.folderNode').removeClass('noItemBox');
                clearInterval(setTime);
              }
            }, 300);
            return true;
          }
        } else {
          //无选择项时 是否要返回当前路径
          var $lastNode = $folderContent.find('.folderUrl .levelName:last');
          var appointRootId = settings.appointRoot ? settings.appointRoot.id : '';
          var lastNodeId = $lastNode.data('root') ? $lastNode.data('root').id : '';

          if (
            settings.isFolderNode == SELECT_TYPE.FOLDER &&
            ((!$lastNode.hasClass('startTag') && !settings.appointRoot) || (settings.appointRoot && appointRootId))
          ) {
            if ($lastNode.hasClass('childNode')) {
              var currentRoot = $folderContent.find('.folderUrl .shareRoot, .folderUrl .myRoot').data('root');
              resultType = PICK_TYPE.CHILDNODE;
              getNodeAjax = true;
              var nodeData = await ajax.getNodeDetail({ path: $lastNode.data('path') });
              if (!nodeData) {
                return Promise.reject();
              }
              var resObj = { type: parseInt(resultType), node: nodeData };
              if (resultType === PICK_TYPE.CHILDNODE && settings.reRootName) {
                resObj = $.extend(resObj, {
                  rootName: currentRoot.name,
                });
              }
              folderSelect.savePos(resObj);
              folderSelect.savePos(resObj, true);
              settings.resolve(resObj);
              return false;
            } else {
              resultType = settings.rootType;
              resultNode = $lastNode.hasClass('myRoot') ? { id: null, name: _l('我的文件') } : $lastNode.data('root');
              folderSelect.savePos(resObj);
              folderSelect.savePos(resObj, true);
              settings.resolve({ type: parseInt(resultType), node: resultNode });
              return false;
            }
          } else {
            var num = 0;
            var setTime = setInterval(function () {
              $folderContent.find('.folderNode').toggleClass('noItemBox');
              if (num++ > 3) {
                $folderContent.find('.folderNode').removeClass('noItemBox');
                clearInterval(setTime);
              }
            }, 300);
            return true;
          }
        }
      },
      onCancel: () => {
        settings.reject();
        return true;
      },
      handleClose: () => {
        $(window).unbind('click.folderSelectDialog_sharePermision');
        $('.folderSelectDialog').parent().remove();
      },
    });

    setTimeout(() => {
      $folderContent = $('body').find('.folderSelectDialog .folderContent');
      if (settings.appointRoot && settings.appointRoot.id) {
        settings.rootType = PICK_TYPE.ROOT;
        folderSelect.getNodeList(
          PICK_TYPE.ROOT,
          {
            id: settings.appointRoot.id,
            name: settings.appointRoot.name,
            projectId: (settings.appointRoot.project && settings.appointRoot.project.projectId) || '',
          },
          false,
          false,
        );
      } else if (settings.isFolderNode === SELECT_TYPE.FILE && 1) {
        var lastPos = localStorage.getItem('last_select_pos_' + md.global.Account.accountId);
        if (lastPos) {
          lastPos = JSON.parse(lastPos);
          settings.rootType = lastPos.rootFolder.id ? PICK_TYPE.ROOT : PICK_TYPE.MYFILE;
          settings.currentRoot = lastPos.currentRoot;
          folderSelect.getRootList(function () {
            folderSelect.getNodeList(lastPos.node.position ? null : settings.rootType, lastPos.node, false, false, {
              forceRenderNet: true,
              rootFolder: lastPos.rootFolder,
            });
          });
        } else {
          folderSelect.getRootList();
        }
      } else if (settings.isFolderNode === SELECT_TYPE.FOLDER) {
        var lastPos = localStorage.getItem('last_select_folder_pos_' + md.global.Account.accountId);
        var defaultData = lastPos ? JSON.parse(lastPos) : settings.appointFolder;
        if (defaultData && !_.includes(settings.selectedItems, defaultData.node.id)) {
          settings.rootType = defaultData.rootFolder.id ? PICK_TYPE.ROOT : PICK_TYPE.MYFILE;
          folderSelect.getRootList(function () {
            folderSelect.getNodeList(
              defaultData.node.position ? null : settings.rootType,
              defaultData.node,
              false,
              false,
              {
                forceRenderNet: true,
                rootFolder: defaultData.rootFolder,
              },
            );
          });
        } else {
          folderSelect.getRootList();
        }
      } else {
        folderSelect.getRootList();
      }

      var $nodeVisibleType = $folderContent.find('.nodeVisibleType');
      //搜索节点事件
      var $folderSearch = $folderContent.find('.folderUrl .operation .folderSearch'),
        $searchFolder = $folderSearch.find('.searchFolder'),
        $positionUrl = $folderContent.find('.folderUrl .positionUrl');

      $folderSearch.find('.icon-search').on({
        click: function (evt) {
          evt.stopPropagation();
          var searchName = $.trim($searchFolder.val());
          if (!searchName && $searchFolder.width() > 160) {
            $searchFolder.blur();
            return;
          }
          if (searchName && searchName.length && searchName != '请输入文件名称并回车') {
            settings.keywords = searchName;
            settings.skip = 0;
            folderSelect.getNodeList(null, null, true);
            return;
          }
          $searchFolder.val('').css({ width: 180, 'padding-right': '16px' });
          var prevWidth = 0;
          $folderContent
            .find('.folderUrl .positionUrl span.flex')
            .prevAll()
            .each(function (i, v) {
              prevWidth += $(v).width();
            });
          $positionUrl.css({ 'margin-left': '-' + eval(prevWidth) + 'px' });
          setTimeout(function () {
            $searchFolder.focus();
          }, 300);
        },
      });
      $searchFolder.on({
        blur: function () {
          var searchName = $.trim($(this).val());
          if (!searchName || searchName == '请输入文件名称并回车') {
            folderSelect.removeSearch();
          }
        },
        keydown: function (evt) {
          if (evt.keyCode == 13) {
            var searchName = $.trim($(this).val());
            if (searchName && searchName.length) {
              settings.keywords = searchName;
              settings.skip = 0;
              folderSelect.getNodeList(null, null, true);
            }
          }
        },
      });
      $folderSearch.on('click', function (evt) {
        evt.stopPropagation();
      });
      $nodeVisibleType
        .on(
          {
            click: function (evt) {
              evt.stopPropagation();
              var $this = $(this);
              var nodeData = $this.parents('.sharePermision').prev().data('node');
              var visibleId = parseInt($this.attr('visible'));

              if (!nodeData.canChangeSharable) {
                alert(_l('您无权限修改该文件的分享权限'), 3);
                return false;
              }
              if ($this.hasClass('ThemeColor3')) {
                return false;
              }
              ajax
                .updateNode({ id: nodeData.id, visibleType: visibleId })
                .then(function (result) {
                  if (!result) {
                    return Promise.reject();
                  }
                  alert(_l('修改成功'));
                  nodeData.visibleType = visibleId;
                  var $selectedNode = $folderContent
                    .find('.nodeItem')
                    .filter('.ThemeBGColor5[nodeType="' + NODE_TYPE.FILE + '"]');
                  $selectedNode
                    .find('.statusIcon i')
                    .removeClass()
                    .addClass(
                      'Font20 ' +
                        (visibleId === 1
                          ? 'icon-task-new-locked'
                          : visibleId === 4
                            ? 'icon-global'
                            : 'icon-group-members'),
                    );
                  $nodeVisibleType.html(folderSelect.renderNodeVisibleType(nodeData, $this)).fadeIn();
                })
                .catch(function () {
                  alert(_l('操作失败, 请稍后重试'), 3);
                });
            },
          },
          '.sharePermision .shareItem',
        )
        .end()
        .on(
          {
            click: function (evt) {
              var $sharePermision = $(this).parent().find('.sharePermision');
              if ($sharePermision.is(':visible')) {
                $sharePermision.hide();
              } else {
                $sharePermision.show();
              }
              evt.stopPropagation();
            },
          },
          '.updateTypeBtn',
        );
      $(window).bind('click.folderSelectDialog_sharePermision', function () {
        $nodeVisibleType.find('.sharePermision').hide();
      });
    }, 200);
  },
  //获取全部根目录
  getRootList: function (callback) {
    var folderSelect = this;

    if (!$folderContent) {
      return;
    }

    $folderContent
      .find('.folderUrl .positionUrl .startTag')
      .removeClass('ThemeColor3')
      .end()
      .find('.folderUrl .operation')
      .hide()
      .end()
      .find('.folderNode')
      .html(loading);
    var projectArr = (
      (_.isArray(_.get(md, 'global.Account.projects')) && _.get(md, 'global.Account.projects')) ||
      []
    ).map(function (item) {
      return $.extend({ rootList: [] }, item);
    });
    projectArr.push({
      projectId: '',
      companyName: _l('个人'),
      rootList: [],
    });
    ajax
      .getRoots({ keywords: '', status: NODE_STATUS.NORMAL })
      .then(function (result) {
        var projectMap = {};
        var noProject = [];
        folderSelect.settings.roots = result;
        if (folderSelect.settings.isFolderNode === SELECT_TYPE.FOLDER) {
          result = result.filter(function (root) {
            return root.permission !== PERMISSION_TYPE.READONLY;
          });
        }
        var projectIds = md.global.Account.projects.map(function (project) {
          return project.projectId;
        });
        result.forEach(function (ele) {
          if (ele.project) {
            var projectId = ele.project.projectId;
            if (projectIds.indexOf(projectId) < 0) {
              noProject.push(ele);
              return;
            }
            if (!projectMap[projectId]) {
              projectMap[projectId] = [];
            }
            projectMap[projectId].push(ele);
          } else {
            noProject.push(ele);
          }
        });
        projectArr = projectArr.map(function (project) {
          project.rootList =
            project.projectId === '' ? _.union(project.rootList, noProject) : projectMap[project.projectId] || [];
          return project;
        });
        // projectArr.sort(function (a, b) {
        //   if (!a.projectId && b.projectId) {
        //     return -1;
        //   } else if ((a.rootList.length && b.rootList.length) || (a.rootList.length == b.rootList.length)) {
        //     return 0;
        //   } else {
        //   }
        //   return -(a.rootList.length - b.rootList.length);
        // });
        $folderContent.find('.folderNode').html(doT.template(rootTpl)(projectArr));
        //$folderContent.find('.selectedItem').html('');

        folderSelect.bindNodeEvent(true);
        folderSelect.bindNodeUrlEvent();
        callback && callback();
      })
      .catch(function () {
        $folderContent.find('.folderNode').html($rootHtml);
        folderSelect.bindNodeEvent(true);
      });
  },
  // 要选择的文件节点列表
  getNodeList: function (type, rootNode, isClickPath, isScroll, extra) {
    // 判断付费版是否到期
    if (this.settings.isFolderNode == SELECT_TYPE.FOLDER && type === PICK_TYPE.ROOT && !isScroll) {
      expireDialogAsync(rootNode.projectId || '').catch(function () {
        var msg = '网络已过期';
        throw msg;
      });
    }
    var folderSelect = this;
    var settings = folderSelect.settings;
    var $folderUrl = $folderContent.find('.folderUrl');
    var $folderNode = $folderContent.find('.folderNode');

    if (rootNode) {
      folderSelect.settings.currentFolder = {
        node: {
          id: rootNode.id,
          parendId: rootNode.parendId,
          projectId: rootNode.projectId,
          name: rootNode.name,
          position: rootNode.position,
        },
      };
      if (rootNode.projectId) {
        settings.rootType = 2;
      }
    }

    if (!settings.appointRoot) {
      $folderUrl.find('.positionUrl .startTag').addClass('ThemeColor3');
    }

    if (!$folderContent) {
      return;
    }

    if (rootNode) {
      settings.parentId = rootNode.id ? rootNode.id : rootNode.parendId;
      settings.skip = 0;
      settings.parentCount = 0;
    }
    //获取nodeList的父元素
    var $folderHtml;
    if (isScroll) {
      $folderHtml = $folderNode.find('.nodeList');
      $folderHtml.append(loading);
      var inputText = $.trim($folderUrl.find('.operation .searchFolder').val());
      if (settings.keywords && settings.keywords !== inputText) {
        settings.skip = 0;
      }
    } else {
      $folderNode.find('div.project').remove();
      //addNode
      if (settings.isFolderNode == SELECT_TYPE.FOLDER) {
        $folderUrl.find('.operation').show().find('.folderSearch').show();
        $folderUrl.find('.operation .createFolder').show();
      } else {
        $folderUrl.find('.operation').show().find('.createFolder').hide();
      }
      //子节点的归属网络
      if ((type && (type == PICK_TYPE.ROOT || type == PICK_TYPE.MYFILE)) || (extra && extra.forceRenderNet)) {
        var _rootNode = extra && extra.forceRenderNet ? extra.rootFolder : rootNode;
        var _type = extra && extra.forceRenderNet ? (extra.rootFolder.id ? PICK_TYPE.ROOT : PICK_TYPE.MYFILE) : type;
        var currentRoot = {};
        var project;
        if (settings.appointRoot && settings.appointRoot.id) {
          project = settings.appointRoot.project;
        } else if (_rootNode.id) {
          project = folderSelect.settings.roots.filter(function (root) {
            return root.id === _rootNode.id;
          })[0];
        }
        if (!_rootNode.id) {
          currentRoot.type = ROOT_TYPE.MY;
          currentRoot.value = '我';
        } else if (!_rootNode.projectId) {
          currentRoot.type = ROOT_TYPE.PERSON;
          currentRoot.value = '个人';
        } else {
          var root = project;
          currentRoot.type = ROOT_TYPE.PROJECT;
          currentRoot.value = root && root.project && root.project.companyName;
        }
        folderSelect.settings.currentRoot = currentRoot;
        var projectId = _rootNode.projectId || '';
        var projectName = projectId ? '' : _l('个人');
        if (_type == PICK_TYPE.MYFILE) {
          projectName = _l('我的文件');
        }
        md.global.Account.projects.forEach(function (pjt) {
          if (pjt.projectId == projectId) {
            projectName = pjt.companyName;
          }
        });
        if (projectName === '' && projectId) {
          projectName = _l('个人');
        }
        if (!$folderNode.find('span[projectId="' + projectId + '"]').length) {
          $folderNode.prepend(
            '<span style="display:none;" class="homeNetWork ellipsis" projectId="' +
              projectId +
              '">' +
              htmlEncodeReg(projectName) +
              '</span>',
          );
        }
      }
      $folderHtml = $('<ul class="nodeList">' + loading + '</ul>');
      $folderNode.find('span.homeNetWork').nextAll().remove();
      $folderNode.append($folderHtml);

      $folderContent.find('.selectedHint .selectedItem,.selectedHint .radioItem, .nodeVisibleType').fadeOut();
    }

    if (settings.rootType !== PICK_TYPE.MYFILE && !settings.parentId) {
      folderSelect.getRootList();
      return;
    }
    folderSelect.isLoading = true;
    var getNodesListAjax = (folderSelect.getNodesListAjax = ajax.getNodes(
      {
        rootType: settings.rootType,
        keywords: settings.keywords,
        parentId: settings.parentId ? settings.parentId : '',
        filterIDs: settings.selectedItems,
        nodeType: settings.isFolderNode == SELECT_TYPE.FOLDER ? 1 : 0,
        skip: settings.skip,
        limit: settings.limit,
        isFromFolderSelect: true,
      },
      {
        silent: true,
      },
    ));
    folderSelect.getNodesListAjax
      .then(function (result) {
        folderSelect.isLoading = false;
        if (getNodesListAjax !== folderSelect.getNodesListAjax) {
          return;
        }
        settings.parentCount = result.totalCount;
        $folderNode.find('.nodeList >div').remove();
        if (result.totalCount > 0) {
          result.list = result.list.filter(node => node);
          if (settings.keywords) {
            //var $shareRoot = settings.rootType == PICK_TYPE.ROOT ? $folderUrl.find('.shareRoot') : $folderUrl.find('.myRoot'),
            //    rootData = $shareRoot.data('root'),
            //    rootName = rootData.name;
            //
            // bugFix20161214当根为我的文件时 搜索的列表会把节点position里的accountId显示为parentName, 当这
            // 里root.id为null时替换为accountId  ($levelNameLast.data('root').id || md.global.Account.accountId)
            var $levelNameLast = $folderUrl.find('.positionUrl .levelName:last');
            var currentPath =
              $levelNameLast.hasClass('shareRoot') || $levelNameLast.hasClass('myRoot')
                ? '/' + ($levelNameLast.data('root').id || md.global.Account.accountId)
                : $levelNameLast.data('path');
          }
          //var interText = doT.template('<li class="nodeItem" ><div class="leftContent"><span class="nodeType" ></span><span class="nodeName ellipsis" >{{= it.name }}</span>{{? it.type == 2 && it.ext}}<span class="nodeExt">{{= "."+it.ext}}</span>{{?}}</div>{{? it.type == 2 && it.canChangeSharable}}<input class="visibleType" nodeID="{{= it.id}}" type="hidden" value="" />{{?}}</li>');
          for (var i = 0; i < result.list.length; i++) {
            var item = result.list[i];
            var $li = null;
            var visibleTypeName = null;
            var parentNameList = [];
            var firstParentName = null;
            var lastParentName = null;
            // 获取搜索状态下 父节点名称
            if (settings.keywords) {
              var parentPosition = item.position.replace(currentPath, '').split('/');
              parentPosition.length > 2 ? parentNameList.push(parentPosition[1]) : null;
              parentPosition.length > 4 ? parentNameList.push('...') : null;
              parentPosition.length > 3 ? parentNameList.push(parentPosition[parentPosition.length - 2]) : null;
            }
            //无权限修改浏览权限的节点的 浏览权限名称
            if (item.type == NODE_TYPE.FILE && !item.canChangeSharable) {
              settings.visibleType.forEach(function (visible) {
                if (visible.id == item.visibleType) {
                  visibleTypeName = visible.name;
                }
              });
            }
            var liHtml = doT.template(nodeTpl)({
              node: item,
              visibleTypeName: visibleTypeName,
              searchData: settings.keywords ? parentNameList : null,
              getClassNameByExt: getClassNameByExt,
              statusIconName:
                item.type == NODE_TYPE.FILE
                  ? item.visibleType === 1
                    ? 'icon-task-new-locked'
                    : item.visibleType === 4
                      ? 'icon-global'
                      : 'icon-group-members'
                  : '',
            });
            $li = $(liHtml);
            $folderHtml.append($li.data('node', item));
          }
        } else {
          //没有子节点
          $folderNode
            .find('.nodeList')
            .html(
              '<div class="nullData Gray_9 Font14">' +
                (folderSelect.settings.isFolderNode === SELECT_TYPE.FOLDER ? _l('没有子文件夹') : _l('没有子文件')) +
                '</div>',
            );
        }

        var $folderPath = $folderContent.find('.folderUrl .positionUrl');
        var $selectedItem = $folderContent.find('.selectedItem');
        if (!isScroll) {
          $selectedItem.hide();
        }

        if (!isClickPath) {
          var pathTmp = doT.template(
            '<span class="levelBar">/</span><span class="levelName ellipsis ThemeColor3 flex"  title="{{!it.name}}">{{!it.name}}</span>',
          );
          if (type == PICK_TYPE.MYFILE || type == PICK_TYPE.ROOT) {
            var $pathHtml = $(pathTmp(rootNode));
            $pathHtml
              .filter('.levelName')
              .addClass(type == PICK_TYPE.ROOT ? 'shareRoot' : 'myRoot')
              .data('root', rootNode);
            if ($pathHtml.eq(1)) {
              var data = $pathHtml.eq(1).data();
              var fullProjectName = projectName;
              projectName = htmlEncodeReg(projectName);
              if (projectName.length > 5) {
                projectName = projectName.slice(0, 5) + '...';
              }
              // 如果存在id就需要归属，没有id就说明是“我的文件”，不需要归属
              if (data.root && data.root.id) {
                $pathHtml.eq(1).attr('title', '(' + fullProjectName + ')' + $pathHtml.eq(1).html());
                $pathHtml.eq(1).html('(' + projectName + ')' + $pathHtml.eq(1).html());
              } else {
                $pathHtml.eq(1).html($pathHtml.eq(1).html());
              }
            }
            $folderPath.append($pathHtml);
            if (settings.appointRoot) {
              // $folderPath.find('.startTag').remove().end().find('.levelBar:first').remove();
              $folderPath.find('.startTag').addClass('disable').removeClass('ThemeColor3');
            }
            if (settings.isFolderNode === SELECT_TYPE.FOLDER) {
              $selectedItem.html(rootNode.name);
            }
          } else {
            //获取子节点的 position
            var position = rootNode.position;
            var positionArr = position.split('/');
            var path = null,
              isOmit = false;
            var pathItmeTpl = doT.template(
              '<span class="levelBar">/</span><span class="levelName childNode ellipsis ThemeColor3 {{!it.flex}}" title="{{!it.name}}">{{!it.name}}</span>',
            );
            positionArr.forEach(function (part, i) {
              if (i > 1) {
                if (i > positionArr.length - 4) {
                  var href = positionArr.slice(0, i + 1).join('/');
                  var flex = i == positionArr.length - 1 ? 'flex' : '';
                  //使用$.data(path,'xx/xx') 避免路径中带有 &#39;  获取路径值时为 ’ 问题
                  var $pathItem = $(pathItmeTpl({ flex: flex, name: part }));
                  $pathItem.filter('.levelName').data('path', href);
                  if (!path) {
                    path = $pathItem;
                  } else {
                    path = path.add($pathItem);
                  }
                } else {
                  if (!isOmit) {
                    var befor = positionArr.slice(0, i + 1).join('/');
                    var $pathBefor = $(pathItmeTpl({ flex: '', name: '...' }));
                    $pathBefor.filter('.levelName').data('path', befor);
                    if (!path) {
                      path = $pathBefor;
                    } else {
                      path = path.add($pathBefor);
                    }
                    isOmit = true;
                  }
                }
              }
            });
            if (!$folderPath.find('.myRoot, .shareRoot').length) {
              var rootFolder = Object.assign({}, extra.rootFolder);
              var originalName = rootFolder.name;
              if (settings.currentRoot && settings.currentRoot.type !== ROOT_TYPE.MY) {
                rootFolder.name =
                  '(' +
                  (settings.currentRoot.value.length > 5
                    ? settings.currentRoot.value.slice(0, 5) + '...'
                    : settings.currentRoot.value) +
                  ')' +
                  originalName;
              }
              var $pathHtml = $(pathTmp(rootFolder));
              $pathHtml
                .filter('.levelName')
                .addClass(rootFolder.id ? 'shareRoot' : 'myRoot')
                .data('root', extra.rootFolder)
                .attr('title', '(' + settings.currentRoot.value + ')' + originalName);
              $folderPath.append($pathHtml);
            }
            $folderPath.find('.myRoot, .shareRoot').removeClass('flex').nextAll().remove().end().after(path);
            //$folderPath.find('.myRoot, .shareRoot').after(path);
            if (settings.isFolderNode === SELECT_TYPE.FOLDER) {
              $selectedItem.html(rootNode.name);
            }
          }

          //绑定文件路径的操作事件
          folderSelect.bindNodeUrlEvent();
        } else {
          settings.isFolderNode === SELECT_TYPE.FOLDER && rootNode ? $selectedItem.hide() : null; //$selectedItem.html(rootNode.name) : null;
        }
        //绑定列表操作事件
        folderSelect.bindNodeEvent(false);

        // 添加 title (tips)
        let html = '';
        $folderPath.children().each(function (i, el) {
          el = $(el);
          html += el.attr('title') ? el.attr('title') : $(el).html();
        });
        $folderPath.addClass('tip-top').attr('title', html);

        if (settings.appointRoot) {
          $folderPath.find('.startTag').removeClass('ThemeColor3');
        }
      })
      .catch(function (err) {
        localStorage.removeItem('last_select_folder_pos_' + md.global.Account.accountId);
        localStorage.removeItem('last_select_pos_' + md.global.Account.accountId);
        if (settings.appointFolder) {
          var defaultData = settings.appointFolder;
          settings.rootType = defaultData.rootFolder.id ? PICK_TYPE.ROOT : PICK_TYPE.MYFILE;
          folderSelect.getRootList(function () {
            folderSelect.getNodeList(
              defaultData.node.position ? null : settings.rootType,
              defaultData.node,
              false,
              false,
              {
                forceRenderNet: true,
                rootFolder: defaultData.rootFolder,
              },
            );
          });
        } else {
          folderSelect.getRootList();
        }
      });
  },
  //绑定节点事件
  bindNodeEvent: function (isRoot) {
    var folderSelect = this;
    var settings = folderSelect.settings;
    var $arrowTips = $folderContent.find('.folderNode .project .arrowTips');
    var $nodeList = $folderContent.find('.folderNode .nodeList');
    var $nodeItem = $nodeList.find('.nodeItem');
    var $folderUrl = $folderContent.find('.folderUrl');
    var $selectedItem = $folderContent.find('.selectedItem');
    var $selectedNum = $selectedItem.find('.selectedNum');
    var $radioItem = $folderContent.find('.selectedHint .radioItem');
    var $nodeVisibleType = $folderContent.find('.nodeVisibleType');

    $arrowTips.on('click', function () {
      var $this = $(this);
      $this.toggleClass('initFlop');
      $this.next('ul').animate({ height: 'toggle' });
    });
    $nodeList
      .off()
      .on(
        {
          click: function (evt) {
            evt.stopPropagation();
            if ($(evt.target).is('.nodeName') && !evt.ctrlKey) {
              var $nodeItemName = $(evt.target).closest('.nodeItem'),
                isFolder = isRoot
                  ? NODE_TYPE.FOLDER
                  : $nodeItemName.data('node')
                    ? $nodeItemName.data('node').type
                    : null;
              if (isFolder == NODE_TYPE.FOLDER) {
                $nodeItemName.dblclick();
                return;
              }
            }

            var $this = $(this);
            var nodeData = $this.data('node');
            var nodeName = $this.find('.nodeName').html();
            //是根目录节点时
            if (isRoot) {
              //获取根目录列表的类型
              settings.rootType = $this.data('rootType') || null;
              nodeData = $this.data('rootId');
              nodeName = $this.data('name');
            }
            //新建node时 重新获取
            $nodeItem = $nodeList.find('.nodeItem');
            if (settings.isFolderNode === SELECT_TYPE.FILE) {
              // ctrl + click
              if ((evt.ctrlKey || evt.metaKey) && !isRoot) {
                $nodeVisibleType.fadeOut();
                $this.hasClass('ThemeBGColor5') ? $this.removeClass('ThemeBGColor5') : $this.addClass('ThemeBGColor5');
                var $selectedNode = $nodeItem.filter('.ThemeBGColor5[nodeType="' + NODE_TYPE.FILE + '"]');
                if ($selectedNode.length == 1) {
                  $selectedItem.fadeOut();
                  $radioItem.html($selectedNode.find('.nodeName').html()).fadeIn();
                } else if ($selectedNode.length > 1) {
                  $radioItem.fadeOut();
                  $selectedNum.html($selectedNode.length);
                  $selectedItem.fadeIn();
                } else {
                  $radioItem.fadeOut();
                  $selectedItem.fadeOut();
                }
              } else {
                $nodeItem.each(function () {
                  $(this).removeClass('ThemeBGColor5').find('.sharePer > i.icon-shareLink').addClass('ThemeColor3');
                });
                $this.addClass('ThemeBGColor5');
                $selectedItem.fadeOut();
                if ($this.attr('nodetype') == NODE_TYPE.FILE) {
                  $radioItem.html(nodeName).fadeIn();
                  $nodeVisibleType.html(folderSelect.renderNodeVisibleType(nodeData, $this)).fadeIn();
                  //$selectedNum.html('1');
                  //$selectedItem.show();
                  //$selectedItem.html('<span class="item" nodeId="' + (nodeData ? nodeData.id : null) + '" title = "' + nodeData.name + '"><span class="itemName ellipsis">' + nodeData.name + '</span><span class="itemExt">.' + nodeData.ext + '</span></span>');
                } else {
                  $radioItem.fadeOut();
                  $nodeVisibleType.fadeOut();
                  $selectedItem.fadeOut();
                }
              }
            } else if (settings.isFolderNode === SELECT_TYPE.FOLDER) {
              $nodeItem.each(function () {
                $(this).removeClass('ThemeBGColor5').find('.sharePer > i').addClass('ThemeColor3');
              });
              $this.addClass('ThemeBGColor5');
              $selectedItem.html(nodeName);
            }

            //分享Icon
            $this.hasClass('ThemeBGColor5')
              ? $this.find('.sharePer > i').removeClass('ThemeColor3')
              : $this.find('.sharePer > i').addClass('ThemeColor3');
          },
          dblclick: function () {
            var $this = $(this);
            settings.rootFolder = $('.shareRoot, .myRoot').data() ? $('.shareRoot, .myRoot').data().root : '';
            //移除搜索的内容
            folderSelect.removeSearch();
            //是根目录节点时
            if (isRoot) {
              //获取根目录列表的类型
              settings.rootType = $this.data('rootType') ? $this.data('rootType') : null;
            }
            //根目录下双击 我的文件
            if (isRoot && settings.rootType && settings.rootType == PICK_TYPE.MYFILE) {
              folderSelect.getNodeList(PICK_TYPE.MYFILE, { id: null, name: _l('我的文件'), parendId: null });
            } else if (isRoot && settings.rootType && settings.rootType == PICK_TYPE.ROOT) {
              //根目录下双击 共享文件夹
              var rootId = $this.data('rootId');
              if (rootId) {
                folderSelect.getNodeList(PICK_TYPE.ROOT, {
                  id: rootId,
                  name: $this.data('name'),
                  projectId: $this.data('projectId') || $this.closest('div.project').data('projectId'),
                });
              }
            } else {
              var rootData = $this.data('node');
              //如果选择的是文件
              if (rootData && rootData.type == NODE_TYPE.FILE && settings.isFolderNode == SELECT_TYPE.FILE) {
                settings.resolve({ type: parseInt(PICK_TYPE.CHILDNODE), node: [rootData] });
                folderSelect.savePos();
                $('.folderSelectDialog').parent().remove();
              } else {
                folderSelect.getNodeList(null, rootData);
              }
            }
          },
        },
        '.nodeItem',
      )
      .on(
        {
          //新建文件夹
          blur: function () {
            var $this = $(this);
            var name = $.trim($this.val());
            if (!name) {
              $this.closest('.addNewFolder').remove();
              //alert('文件名不能为空', 2);
              //$this.val('').focus();
              return false;
            }
            if (name && name.length > 255) {
              alert(_l('文件名称过长,请保持名称在255个字符以内'), 2, 3000);
              $this.select();
              return false;
            }
            var illegalChars = /[\/\\\:\*\?\"\<\>\|]/g,
              valid = illegalChars.test(name);
            if (valid) {
              alert(_l('名称不能包含以下字符：') + '\\ / : * ? " < > |', 3);
              name = name.replace(illegalChars, '');
              $this.val(name).select();
              return false;
            }
            var $folderPath = $folderContent.find('.folderUrl .positionUrl');
            var $root = $folderPath.find('.myRoot, .shareRoot');
            var rootData = $root.data('root');
            var parentId = settings.parentId;
            var rootId = rootData ? rootData.id : '';
            folderSelect.handleAddFolder($this, name, parentId, rootId);
          },
          keydown: function (evt) {
            if (evt.keyCode == 13) {
              $(this).blur();
              evt.preventDefault();
              evt.stopPropagation();
            }
          },
        },
        '.addNewFolder .editBox',
      );

    //新建文件夹图标
    $folderUrl
      .find('.operation .createFolder')
      .off()
      .on({
        click: function () {
          var $this = $(this);
          var $folderNode = $folderContent.find('.folderNode');
          var $addNewFolder = $(
            '<li class="addNewFolder" ><div class="leftContent"><span class="nodeType fileIcon-folder" ></span><span class="nodeName ellipsis Hidden" ></span><input class="editBox" placeholder="请输入文件夹名称"/></div></li>',
          );

          $folderNode.find('div.nullData').remove();
          if ($folderNode.find('.nodeList').length) {
            $folderNode.find('.nodeList').prepend($addNewFolder);
            setTimeout(() => {
              $addNewFolder.find('.editBox').focus();
            }, 100);
          }
        },
      });

    //滚动加载
    $folderContent
      .find('.folderNode')
      .off()
      .on('scroll', function () {
        if (folderSelect.isLoading) {
          return;
        }
        var listCount;
        var $nodeList = $('.folderSelectDialog .folderContent .folderNode');
        if (isRoot) {
          listCount = $nodeList.find('.sharedItem').length;
        } else {
          listCount = $nodeList.find('.nodeItem').length;
        }
        if (!isRoot && !$nodeList.find('.project').length) {
          if (
            listCount < settings.parentCount &&
            $nodeList[0].scrollTop + $nodeList.height() + 20 > $nodeList[0].scrollHeight
          ) {
            folderSelect.settings.skip = folderSelect.settings.skip + folderSelect.settings.limit;
            folderSelect.getNodeList(settings.rootType, null, true, true);
          }
        }
      });
  },
  // 创建文件夹方法
  handleAddFolder: _.debounce(function ($this, name, parentId, rootId) {
    ajax
      .addNode({
        name: name,
        type: NODE_TYPE.FOLDER,
        parentId: parentId,
        rootId: rootId,
      })
      .then(function (result) {
        if (!result) {
          return Promise.reject();
        }
        $this
          .closest('li.addNewFolder')
          .addClass('nodeItem')
          .removeClass('addNewFolder')
          .data('node', result)
          .find('.nodeName')
          .html(result.name)
          .show();
        $this.remove();
      })
      .catch(function () {
        alert(_l('创建失败'), 2);
        $this.closest('li.addNewFolder').fadeOut();
      });
  }, 1000),
  //绑定文件路径事件
  bindNodeUrlEvent: function () {
    var folderSelect = this;
    var $folderPath = $('.folderSelectDialog .folderContent .folderUrl');
    $folderPath
      .find('.startTag')
      .off()
      .on('click', function () {
        if (!$(this).hasClass('ThemeColor3')) {
          return;
        }
        folderSelect.removeSearch();
        folderSelect.getRootList();
        $(this).nextAll('span').remove();
      });
    $folderPath
      .find('.myRoot')
      .off()
      .on('click', function () {
        folderSelect.removeSearch();
        folderSelect.getNodeList(PICK_TYPE.MYFILE, { id: null, parendId: null, name: _l('我的文件') }, true);
        $(this).nextAll('span').remove();
      });

    $folderPath
      .find('.shareRoot')
      .off()
      .on('click', function () {
        var rootData = $(this).data('root');
        folderSelect.removeSearch();
        folderSelect.getNodeList(PICK_TYPE.ROOT, rootData, true);
        $(this).nextAll('span').remove();
      });

    $folderPath
      .find('.childNode')
      .off()
      .on('click', function () {
        var $this = $(this),
          nodeHref = $(this).data('path');
        ajax.getNodeDetail({ path: nodeHref }).then(function (nodeData) {
          folderSelect.removeSearch();
          folderSelect.getNodeList(PICK_TYPE.CHILDNODE, nodeData);
          $this.nextAll('span').remove();
        });
      });
  },
  //保存位置
  savePos: function (resObj, isFolder) {
    var folderSelect = this;
    var settings = folderSelect.settings;
    if (isFolder) {
      safeLocalStorageSetItem(
        'last_select_folder_pos_' + md.global.Account.accountId,
        JSON.stringify(
          _.assign({}, settings.currentFolder, {
            rootFolder: settings.rootFolder,
          }),
        ),
      );
    } else if (settings.currentFolder) {
      safeLocalStorageSetItem(
        'last_select_pos_' + md.global.Account.accountId,
        JSON.stringify(
          _.assign({}, settings.currentFolder, {
            currentRoot: settings.currentRoot,
            rootFolder: settings.rootFolder,
          }),
        ),
      );
    }
  },
  //移除搜索
  removeSearch: function () {
    var $folderSearch = $folderContent.find('.folderUrl .operation .folderSearch');
    var $searchFolder = $folderSearch.find('.searchFolder');
    var $positionUrl = $folderContent.find('.folderUrl .positionUrl');
    $folderContent.find('.selectedItem').fadeOut();
    $folderContent.find('.selectedHint .radioItem').fadeOut();
    $folderContent.find('.nodeVisibleType').fadeOut();
    $searchFolder.val('').css({ width: 0, 'padding-right': '0px' });
    $positionUrl.css({ 'margin-left': '0' });
    this.settings.keywords = null;
    this.settings.skip = 0;

    $folderContent.find('.folderNode').off('scroll');
  },
  // 渲染修改类型
  renderNodeVisibleType: function (node, $node) {
    var folderSelect = this;
    var $folderNode = $node.closest('.folderNode');
    var currentProjectId = $folderNode.find('span.homeNetWork').attr('projectid');
    var isBelongAccount = !currentProjectId;
    var shareHtml = '';
    shareHtml +=
      '<span class="visibleTypeIcon ' +
      (node.visibleType === 1 ? 'danger' : '') +
      '"><i class="icon ' +
      (node.type == NODE_TYPE.FILE
        ? node.visibleType === 1
          ? 'icon-task-new-locked'
          : node.visibleType === 4
            ? 'icon-global'
            : 'icon-group-members'
        : '') +
      '"></i></span>';
    shareHtml +=
      '<span class="' +
      (node.visibleType === 1 ? 'danger' : '') +
      '">' +
      this.getNodeVisibleTypeText(node, isBelongAccount) +
      '</span>';
    if (node.canChangeSharable) {
      shareHtml +=
        '<a class="updateTypeBtn ThemeColor3">' + (node.visibleType === 1 ? _l('开启') : _l('更改')) + '</a>';
      shareHtml += this.renderSharePermisionItem(node.visibleType, isBelongAccount);
    }
    var $node = $('<div>' + shareHtml + '</div>');
    $node.find('.updateTypeBtn').data('node', node);
    return $node;
  },
  getNodeVisibleTypeText: function (node, isAccount) {
    var folderSelect = this;
    switch (node.visibleType) {
      case 1:
        return '文件未开启分享，他人无法查看';
        break;
      case 4:
        return '任何人可查看';
        break;
      default:
        return isAccount
          ? _l('%0的联系人可预览', folderSelect.settings.currentRoot.value)
          : _l('%0成员可预览', folderSelect.settings.currentRoot.value);
    }
  },
  renderSharePermisionItem: function (active, isAccount) {
    var folderSelect = this;
    var shareHtml = '';
    shareHtml += '<div class="sharePermision">';
    shareHtml += '<ul class="shareList">';
    folderSelect.settings.visibleType
      .filter(function (visible) {
        return visible.id !== active;
      })
      .forEach(function (visible) {
        shareHtml += '<li class="shareItem" visible="' + visible.id + '">';
        shareHtml += '<div>';
        shareHtml +=
          '<span class="visibleName">' +
          (visible.id == 2
            ? isAccount
              ? '<span class="ownerName ellipsis" title="' +
                folderSelect.settings.currentRoot.value +
                '">' +
                folderSelect.settings.currentRoot.value +
                '</span> ' +
                _l('%0的联系人可预览', '')
              : '<span class="companyName ellipsis" title="' +
                folderSelect.settings.currentRoot.value +
                '">' +
                folderSelect.settings.currentRoot.value +
                '</span> ' +
                _l('%0成员可预览', '')
            : visible.name) +
          '</span>';
        shareHtml += '</div>';
        shareHtml +=
          '<p class="desc">' +
          (typeof visible.desc === 'string' ? visible.desc : isAccount ? visible.desc.account : visible.desc.project) +
          '</p>';
        shareHtml += '</li>';
      });
    shareHtml += '</ul>';
    shareHtml += '</div>';
    return shareHtml;
  },
});

function select(param) {
  return new Promise((resolve, reject) => {
    param = $.extend({ resolve, reject }, param);
    /**
     * 文件或路径选择层
     * @function external:
     * @param {object} param 初始化数据
     * @param {string} param.dialogTitle 弹层title
     * @param {btnName} param.btnName 弹层确定按钮的文字
     * @param {number}  param.isFolderNode 操作类型 0--所有 1--选择文件夹路径  2--选择文件
     * @param {array}   param.selectedItems  被选择的节点ID数组
     * @param {object}  param.appointRoot  指定的Root
     * @param {boolean} param.reRootName  当返回子节点时 是否返回根节点名称
     * @param {function} param.callback 确定选择的文件的回调
     */
    new FolderSelect(param);
  });
}

export default select;
