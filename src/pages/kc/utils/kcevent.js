import { Set } from 'immutable';
import { assign, max, min, trim } from 'lodash';
import _ from 'lodash';
import kcService from '../api/service';
import { navigateTo } from 'src/router/navigateTo';
import { NODE_OPERATOR_TYPE, NODE_STATUS, NODE_TYPE } from '../constant/enum';
import { validateFileName } from '../utils';

export function bindEvent(jqns, fns, datafn) {
  $(document).on('keydown.' + jqns, evt => handleShortCut(evt, fns, datafn));
}

function handleShortCut(evt, fns, datafn) {
  const {
    selectAllItems,
    selectAll,
    list,
    showDetail,
    moveOrCopyClick,
    changeFolder,
    handlePreview,
    removeNode,
    getRootNameAndLink,
  } = fns;
  const { selectedItems, isRecycle, currentRoot, currentFolder, previewFile, baseUrl } = datafn();
  const $target = $(evt.target);
  if ($target.is('input') || $target.is('textarea') || $target.is('[contenteditable]')) {
    return;
  }
  if (evt.ctrlKey || evt.metaKey) {
    /* Ctrl + a */
    if (evt.which === 65) {
      selectAllItems(true);
      evt.preventDefault();
    }
    /* Ctrl + c */
    if (evt.which === 67 && !window.getSelection().toString() && selectedItems.size !== 0) {
      moveOrCopyClick(NODE_OPERATOR_TYPE.COPY);
      evt.preventDefault();
    }
    /* Ctrl + x */
    if (evt.which === 88 && selectedItems.size !== 0) {
      moveOrCopyClick(NODE_OPERATOR_TYPE.MOVE, typeof currentRoot === 'object' ? currentRoot.id : null);
      evt.preventDefault();
    }
  } else if (evt.altKey) {
    /* Alt + Enter */
    if (evt.which === 13 && previewFile) {
      showDetail();
    }
    /* Alt + UpArrow */
    if (evt.which === 38 && !_.isEmpty(currentFolder)) {
      if (currentFolder.parentId === currentFolder.rootId) {
        navigateTo(getRootNameAndLink(baseUrl, currentRoot));
      } else {
        kcService.getNodeById({ id: currentFolder.parentId }).then(parentNode => {
          if (parentNode && parentNode.type === NODE_TYPE.FOLDER) {
            changeFolder(parentNode);
          }
        });
      }
    }
  } else if (!evt.shiftKey && !evt.metaKey && !evt.altKey) {
    /* Delete */
    if (evt.which === 46) {
      removeNode(isRecycle ? NODE_STATUS.DELETED : NODE_STATUS.RECYCLED);
    }
    /* Enter */
    if (evt.which === 13 && hasOnlyOneSelectedItem(selectAll, selectedItems, list) && !previewFile) {
      const item = selectedItems.first();
      if (item.type !== NODE_TYPE.FOLDER) {
        handlePreview(item);
      } else {
        changeFolder(item);
      }
    }
    /* F2 */
    if (evt.which === 113 && !previewFile && hasOnlyOneSelectedItem(selectAll, selectedItems, list)) {
      const item = selectedItems.first();
      if (item.canEdit) {
        // updateNodeName(item);
      }
    }
  }
}

export function registerNodeItemEvent(element, args) {
  const $element = $(element);
  const { findItemById, handlePreview, selectItem, updateNodeItem, baseUrl } = args;
  let updating = false;
  $element.on(
    {
      // mouseenter: function() {
      //   setHoveredItem(findItemById($(this).attr('data-id')), PICK_TYPE.NODE);
      // },
      // mouseleave: function() {
      //   setHoveredItem(null, null);
      // },
      mousedown(evt) {
        handleItemMouseDown(
          assign(
            {},
            {
              item: findItemById($(this).attr('data-id')),
              evt,
            },
            args,
          ),
        );
      },
      dblclick(evt) {
        if ($(evt.target).hasClass('actions')) return false;
        const item = findItemById($(this).attr('data-id'));
        if (item.type === NODE_TYPE.FOLDER) {
          navigateTo(`${baseUrl}${item.position.replace(md.global.Account.accountId, 'my')}`);
        } else {
          handlePreview(item, evt);
        }
      },
    },
    '.nodeItem',
  );

  $element.on(
    {
      click(evt) {
        const item = findItemById($(this).closest('.nodeItem').attr('data-id'));
        selectItem(item);
        evt.stopPropagation();
      },
      mousedown(evt) {
        evt.stopPropagation();
      },
      dblclick(evt) {
        evt.stopPropagation();
      },
    },
    '.nodeItem .selectBox',
  );

  // 修改名称
  $element.on(
    {
      blur(evt) {
        if (updating) {
          return;
        }
        updating = true;
        const $target = $(this);
        const item = findItemById($target.closest('.nodeItem').attr('data-id'));
        if (!item) {
          return;
        }

        const originName = item.name;
        const newName = trim($target.val());
        const showListName = function () {
          $target.hide().siblings('.listName,.itemExt,.thumbnailName').show();
        };

        if (newName && newName !== originName) {
          const validateOut = {};
          if (!validateFileName(newName, true, validateOut, { extLength: item.ext.length })) {
            setTimeout(() => {
              $target.val(validateOut.validName || originName).select();
            }, 0);
            evt.preventDefault();
            updating = false;
            return false;
          }

          const name = newName + (item.ext ? '.' + item.ext : '');
          updateNodeItem(
            Object.assign({}, item, {
              name: newName,
            }),
          );
          kcService
            .updateNode({ id: item.id, name })
            .then(result => {
              if (!result) {
                throw new Error();
              }
              alert(_l('修改成功'));
              kcService.getNodeById(item.id).then(node => {
                updateNodeItem(node);
              });
            })
            .catch(() => {
              updateNodeItem(item);
              alert(_l('操作失败，请核实您的权限稍后重试'), 3);
            })
            .finally(() => {
              showListName();
              updating = false;
            });
        } else {
          $('.nodeItem[data-id=' + item.id + ']')
            .find('.listNameEdit')
            .val(originName);
          showListName();
          updating = false;
        }
      },
      keydown(evt) {
        if (evt.keyCode === 13 /* Enter*/) {
          $(evt.target).blur();
          evt.preventDefault();
          evt.stopPropagation();
        } else if (evt.keyCode === 27 /* Esc*/) {
          $(evt.target).val('').blur();
          evt.preventDefault();
          evt.stopPropagation();
        }
      },
    },
    '.nodeItem .listNameEdit',
  );

  // 缩略图视图点击打开或者预览
  $element.on(
    {
      click(evt) {
        const item = findItemById($(this).closest('.nodeItem').attr('data-id'));
        if (!(evt.ctrlKey || evt.metaKey) && !evt.shiftKey) {
          if (item.type === NODE_TYPE.FOLDER) {
            navigateTo(`${baseUrl}${item.position.replace(md.global.Account.accountId, 'my')}`);
          } else {
            handlePreview(item, evt);
          }
          evt.stopPropagation();
        }
      },
    },
    '.nodeItem .thumbnailImg',
  );

  document.oncontextmenu = function (evt) {
    const $target = $(evt.target);
    if ($target.is('.rightMenu,.noContextMenu') || $target.closest('.rightMenu,.noContextMenu').length) {
      return false;
    }
  };
}

function hasOnlyOneSelectedItem(selectAll, selectedItems, list) {
  return selectedItems.size === 1 || (selectAll && list.size === 1);
}

/** 每个 item 元素的 mousedown 事件 */
function handleItemMouseDown(args) {
  const { item, evt, selectSingleItem, startDragItems, getLatestData, changeRightMenuOption } = args;
  const { isRecycle, list, selectAll, dragSelectEle, selectedItems } = getLatestData();
  const selected = (selectAll && list.size === selectedItems.size) || selectedItems.contains(item);
  const $target = $(evt.target);
  if (
    $target.closest('.flexRow') ||
    $target.hasClass('flexRow') ||
    $target.closest('.thumbnailItem') ||
    $target.hasClass('thumbnailItem')
  ) {
    /* 左键点击列表，除checkbox以外*/
    if (evt.button === 0 && !$target.hasClass('selectBox')) {
      if (!selected || evt.ctrlKey || evt.metaKey || evt.shiftKey) {
        // 框选
        startDragSelect(evt, dragSelectEle);
      } else if (!isRecycle) {
        // 拖拽
        startDragItems(evt);
      } else {
        selectSingleItem(item);
      }
    }
    /* 右键*/
    if (evt.button === 2) {
      const rightMenuOption = {
        clientX: evt.clientX,
        clientY: evt.clientY,
        item,
      };
      if (!selected || hasOnlyOneSelectedItem(selectAll, selectedItems, list)) {
        rightMenuOption.isMulti = false;
        selectSingleItem(item);
        changeRightMenuOption(rightMenuOption);
      } else {
        rightMenuOption.isMulti = true;
        changeRightMenuOption(rightMenuOption);
      }
    } else {
      changeRightMenuOption(null);
    }
  }
}

/**
 * 单击 item 元素时的操作
 * @param  {ReactElement}     child 点击的元素
 * @param  {MouseEvent} evt   mouseup 事件
 */
export function handleDragSelectClickOnly(args) {
  const { child, evt, selectedItems, list, selectItem, selectItems, selectSingleItem } = args;
  const clickedItem = child.props.item;
  if (evt.ctrlKey || evt.metaKey) {
    selectItem(clickedItem);
  } else if (evt.shiftKey) {
    if (selectedItems.size) {
      const indexes = selectedItems.map(item => list.indexOf(item)).toArray();
      let ends = [min(indexes), max(indexes)];
      const clickedIndex = list.indexOf(clickedItem);
      if (clickedIndex < ends[0]) {
        ends = [clickedIndex, ends[0]];
      } else if (clickedIndex > ends[1]) {
        ends = [ends[1], clickedIndex];
      } else {
        ends = [ends[0], clickedIndex];
      }
      const newSelectedItems = list.slice(ends[0], ends[1] + 1);
      selectItems(newSelectedItems);
    } else {
      selectSingleItem(clickedItem);
    }
  } else {
    selectSingleItem(clickedItem);
  }
}

export function handleDragSelect(args) {
  const { children, evt, selectItems } = args;
  let { selectedItems, selectedItemsBeforeDragSelect } = args;
  const newSelectedItems = Set(children)
    .filter(child => child.props && child.props.item)
    .map(child => child.props.item);

  if (evt && (evt.ctrlKey || evt.metaKey)) {
    selectedItemsBeforeDragSelect = selectedItemsBeforeDragSelect || selectedItems;
    selectedItems = selectedItemsBeforeDragSelect
      .union(newSelectedItems)
      .subtract(selectedItemsBeforeDragSelect.intersect(newSelectedItems));
  } else {
    selectedItems = newSelectedItems;
  }
  selectItems(selectedItems);
}

/** 在 item 元素节点间隙开始拖拽 */
export function handleDragSelectFromGap(evt, dragSelectEle) {
  if ($(evt.target).is('ul') && evt.button === 0) {
    startDragSelect(evt, dragSelectEle);
  }
}

/** 开始框选 */
export function startDragSelect(evt, dragSelectEle) {
  if (dragSelectEle) {
    dragSelectEle.startDragSelect(evt);
  }
}
