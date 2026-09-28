import React, { forwardRef, Fragment, useRef, useState } from 'react';
import Divider from 'antd/es/divider';
import Input from 'antd/es/input';
import AntdSelect from 'antd/es/select';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { transformSemanticConfig } from '../utils';
import './index.less';

const DEFAULT_POPUP_ROOT_STYLE = { paddingInline: 0 };
const DEFAULT_POPUP_LIST_ITEM_STYLE = { borderRadius: 0 };
// Ant Design 默认禁止选择已选项文字；分别为默认多选项、单选内容和自定义多选标签放开文本选择。
const DEFAULT_ITEM_STYLE = { userSelect: 'text' };
const DEFAULT_SINGLE_CONTENT_STYLE = { userSelect: 'text', WebkitUserSelect: 'text' };
const DEFAULT_MULTIPLE_TAG_STYLE = { userSelect: 'text', WebkitUserSelect: 'text' };
// content 标记复制区域，action 标记区域内需要保留原生交互的元素，例如自定义标签的关闭按钮。
const COPYABLE_ITEM_CONTENT_CLASS_NAME = 'hap-select-copyable-item-content';
const COPYABLE_ITEM_ACTION_CLASS_NAME = 'hap-select-copyable-item-action';
// 单选模式的内容、搜索输入和可见标签需要分别标记，以协调文字选择和下拉切换。
const COPYABLE_SINGLE_CONTENT_CLASS_NAME = 'hap-select-copyable-single-content';
const COPYABLE_SINGLE_INPUT_CLASS_NAME = 'hap-select-copyable-single-input';
const COPYABLE_SINGLE_LABEL_CLASS_NAME = 'hap-select-copyable-single-label';
const DEFAULT_SINGLE_ROOT_STYLE = { height: 'var(--hap-select-height)' };
const DEFAULT_SUFFIX_ICON = <Icon icon="expand_more" className="Font18" />;
const DEFAULT_REMOVE_ICON = <Icon icon="close" className="Font16" />;

export const mergePopupStyles = (styles, popupRootStyle, rootStyle, contentStyle) => {
  const mergeStyles = currentStyles => {
    const nextStyles = currentStyles || {};
    const popup = nextStyles.popup || {};

    return {
      ...nextStyles,
      root: {
        ...rootStyle,
        ...nextStyles.root,
      },
      item: {
        ...DEFAULT_ITEM_STYLE,
        ...nextStyles.item,
      },
      ...(contentStyle || nextStyles.content
        ? {
            content: {
              ...contentStyle,
              ...nextStyles.content,
            },
          }
        : {}),
      popup: {
        ...popup,
        listItem: {
          ...DEFAULT_POPUP_LIST_ITEM_STYLE,
          ...popup.listItem,
        },
        root: {
          ...DEFAULT_POPUP_ROOT_STYLE,
          ...popup.root,
          ...popupRootStyle,
        },
      },
    };
  };

  return transformSemanticConfig(styles, mergeStyles);
};

export const mergeSelectClassNames = (classNames, isCopyableSingle) =>
  transformSemanticConfig(classNames, currentClassNames => ({
    ...currentClassNames,
    // 单选只有显式开启 copyable 时才改变内容区；否则保持 Ant Design 默认点击交互。
    ...(isCopyableSingle
      ? {
          content: cx(currentClassNames?.content, COPYABLE_SINGLE_CONTENT_CLASS_NAME),
          input: cx(currentClassNames?.input, COPYABLE_SINGLE_INPUT_CLASS_NAME),
        }
      : {}),
    // 默认多选标签由 rc-select 渲染，可直接通过公开的 itemContent 语义槽位标记复制区域。
    itemContent: cx(currentClassNames?.itemContent, COPYABLE_ITEM_CONTENT_CLASS_NAME),
  }));

export const stopCopyableItemMouseDownPropagation = event => {
  const isCopyableItemAction = event.target.closest?.(`.${COPYABLE_ITEM_ACTION_CLASS_NAME}`);

  // rc-select 会在标签外层的 mousedown 中执行 preventDefault 并切换下拉状态，
  // 浏览器因此无法从标签文字开始拖出选区。这里需要在捕获阶段提前截断文字区域的事件；
  // 关闭按钮等操作区域必须放行，否则它们自己的防失焦和点击回调都没有机会执行。
  if (event.button === 0 && !isCopyableItemAction && event.target.closest?.(`.${COPYABLE_ITEM_CONTENT_CLASS_NAME}`)) {
    event.stopPropagation();
  }
};

export const stopCopyableSingleLabelMouseDownPropagation = event => {
  // 单选内容区上方存在透明搜索输入，rc-select 收到 mousedown 后会立即抢焦点并打开下拉；
  // 在标签自身的捕获阶段截断左键事件，浏览器才能建立文字选区。
  if (event.button === 0) {
    event.stopPropagation();
  }
};

// 使用事件所属 document 获取 Selection，兼容组件渲染在 iframe 等非主文档环境中的情况。
const getSelection = event => event.currentTarget.ownerDocument?.getSelection?.();

export const stopCopyableSingleLabelClickPropagation = event => {
  // 拖选文字完成后不应继续触发标签点击，否则刚建立的选区会被打开下拉的交互打断。
  if (getSelection(event)?.isCollapsed === false) {
    event.stopPropagation();
  }
};

export const replayCopyableSingleLabelMouseDown = event => {
  // 没有选区表示用户只是单击标签。此前为支持拖选截断了真实 mousedown，
  // 此处向 Select 内容容器重放事件，让单击仍能聚焦并打开下拉。
  if (getSelection(event)?.isCollapsed === false) {
    return;
  }

  const content = event.currentTarget.closest(`.${COPYABLE_SINGLE_CONTENT_CLASS_NAME}`);
  const MouseEventConstructor = event.currentTarget.ownerDocument?.defaultView?.MouseEvent;

  if (content && MouseEventConstructor) {
    content.dispatchEvent(new MouseEventConstructor('mousedown', { bubbles: true, cancelable: true }));
  }
};

export const stopCopyableMultipleTagClickPropagation = event => {
  // 拖选文字结束后浏览器仍会派发 click。此时保留选区并截断 click，
  // 防止后续的普通点击兼容逻辑误把一次文本选择识别成打开下拉。
  if (getSelection(event)?.isCollapsed === false) {
    event.stopPropagation();
  }
};

export const replayCopyableMultipleTagMouseDown = event => {
  // 没有文本选区说明这是一次普通点击。由于真实 mousedown 已为支持拖选而被截断，
  // 需要向自定义标签的 rc-select 父容器补发 mousedown，恢复原本的下拉切换行为。
  if (getSelection(event)?.isCollapsed === false) {
    return;
  }

  const content = event.currentTarget.closest(`.${COPYABLE_ITEM_CONTENT_CLASS_NAME}`);
  const selector = content?.parentElement;
  const MouseEventConstructor = event.currentTarget.ownerDocument?.defaultView?.MouseEvent;

  // 必须发给复制标记之外的父节点；若发给标签自身，会再次被捕获阶段的逻辑截断。
  if (selector && MouseEventConstructor) {
    selector.dispatchEvent(new MouseEventConstructor('mousedown', { bubbles: true, cancelable: true }));
  }
};

const getLabelTitle = (labelInfo, label) => {
  if (['string', 'number'].includes(typeof labelInfo.title)) {
    return String(labelInfo.title);
  }

  return ['string', 'number'].includes(typeof label) ? String(label) : undefined;
};

export const getCopyableSingleLabelRender = labelRender => labelInfo => {
  // 保留调用方 labelRender 的结果，只增加一层负责协调复制和点击的交互容器。
  const label = (labelRender ? labelRender(labelInfo) : labelInfo.label) ?? labelInfo.value;

  return (
    <div
      className={COPYABLE_SINGLE_LABEL_CLASS_NAME}
      title={getLabelTitle(labelInfo, label)}
      onMouseDownCapture={stopCopyableSingleLabelMouseDownPropagation}
      onClickCapture={stopCopyableSingleLabelClickPropagation}
      onClick={replayCopyableSingleLabelMouseDown}
    >
      {label}
    </div>
  );
};

export const getCopyableMultipleTagRender = tagRender => {
  if (!tagRender) return tagRender;

  return tagInfo => {
    const tag = tagRender(tagInfo);

    if (!React.isValidElement(tag)) return tag;

    // 自定义标签的关闭元素没有稳定的 DOM 结构或类名，不能依赖 icon-close 等实现细节。
    // rc-select 会把同一个 onClose 引用交给 tagRender，因此通过回调引用识别操作元素，
    // 并递归处理嵌套结构，使关闭区域可以绕过文字选择的 mousedown 拦截。
    const markCloseAction = child => {
      if (Array.isArray(child)) return child.map(markCloseAction);
      if (!React.isValidElement(child)) return child;

      if (tagInfo.onClose && child.props.onClick === tagInfo.onClose) {
        return React.cloneElement(child, {
          className: cx(child.props.className, COPYABLE_ITEM_ACTION_CLASS_NAME),
        });
      }

      if (child.props.children) {
        return React.cloneElement(child, {
          children: markCloseAction(child.props.children),
        });
      }

      return child;
    };

    // 使用 tagRender 后，rc-select 不再应用默认 item/itemContent 的语义样式和类名；
    // 在不增加额外 DOM 层级的前提下克隆原标签，补齐复制能力并保留调用方样式与事件。
    return React.cloneElement(tag, {
      className: cx(tag.props.className, COPYABLE_ITEM_CONTENT_CLASS_NAME),
      style: {
        ...DEFAULT_MULTIPLE_TAG_STYLE,
        ...tag.props.style,
      },
      onClickCapture: event => {
        tag.props.onClickCapture?.(event);
        stopCopyableMultipleTagClickPropagation(event);
      },
      onClick: event => {
        replayCopyableMultipleTagMouseDown(event);
        tag.props.onClick?.(event);
      },
      children: markCloseAction(tag.props.children),
    });
  };
};

export const getSelectProps = props => {
  const {
    className,
    classNames,
    styles,
    suffixIcon = DEFAULT_SUFFIX_ICON,
    removeIcon,
    hideRemoveIconOnBlur = false,
    copyable = false,
    placeholder = _l('请选择'),
    mode,
    labelRender,
    tagRender,
    onMouseDownCapture,
    ...restProps
  } = props;
  const isMultiple = mode === 'multiple' || mode === 'tags';
  const isSingle = !mode;
  // copyable 默认关闭；只包装当前模式实际使用的渲染入口，避免影响未开启复制的 Select。
  const isCopyableSingle = isSingle && copyable;
  const isCopyableMultiple = isMultiple && copyable;

  return {
    ...restProps,
    className:
      cx(className, {
        'hap-select-hide-remove-icon-on-blur': isMultiple && hideRemoveIconOnBlur,
      }) || undefined,
    mode,
    placeholder,
    suffixIcon,
    removeIcon: isMultiple && removeIcon === undefined ? DEFAULT_REMOVE_ICON : removeIcon,
    labelRender: isCopyableSingle ? getCopyableSingleLabelRender(labelRender) : labelRender,
    tagRender: isCopyableMultiple ? getCopyableMultipleTagRender(tagRender) : tagRender,
    classNames: mergeSelectClassNames(classNames, isCopyableSingle),
    styles: mergePopupStyles(
      styles,
      undefined,
      isSingle ? DEFAULT_SINGLE_ROOT_STYLE : undefined,
      isCopyableSingle ? DEFAULT_SINGLE_CONTENT_STYLE : undefined,
    ),
    onMouseDownCapture: event => {
      // 默认多选标签和 copyable 自定义标签共用此入口，先判断是否位于可复制文字区域。
      stopCopyableItemMouseDownPropagation(event);

      // 单选标签的事件已由内部包装层处理，避免再次调用业务侧 capture handler；
      // 其余区域继续保持调用方原有的 onMouseDownCapture 行为。
      if (!isCopyableSingle || !event.target.closest?.(`.${COPYABLE_SINGLE_LABEL_CLASS_NAME}`)) {
        onMouseDownCapture?.(event);
      }
    },
  };
};

const Select = forwardRef((props, ref) => {
  const { showPopupSearch, popupRender, searchValue, showSearch, onSearch, onOpenChange, ...restProps } = props;
  const [innerSearchValue, setInnerSearchValue] = useState('');
  const popupSearchInputRef = useRef(null);
  const mergedSearchValue = searchValue === undefined ? innerSearchValue : searchValue;

  const handlePopupSearch = value => {
    if (searchValue === undefined) {
      setInnerSearchValue(value);
    }

    onSearch?.(value);
  };

  const handleOpenChange = open => {
    if (open) {
      requestAnimationFrame(() => popupSearchInputRef.current?.focus());
    } else {
      handlePopupSearch('');
    }

    onOpenChange?.(open);
  };

  const renderPopup = menu => {
    const popup = popupRender ? popupRender(menu) : menu;

    if (!showPopupSearch) {
      return popup;
    }

    return (
      <Fragment>
        <Input
          ref={popupSearchInputRef}
          variant="borderless"
          placeholder={_l('搜索')}
          prefix={<Icon icon="search" className="Font16 textTertiary" />}
          value={mergedSearchValue}
          onChange={event => handlePopupSearch(event.target.value)}
          onKeyDown={event => event.stopPropagation()}
        />
        <Divider className="mTop2 mBottom5" />
        {popup}
      </Fragment>
    );
  };

  return (
    <AntdSelect
      ref={ref}
      {...getSelectProps({
        ...restProps,
        showSearch: showPopupSearch ? false : showSearch,
        searchValue: showPopupSearch ? mergedSearchValue : searchValue,
        onSearch: showPopupSearch ? undefined : onSearch,
        onOpenChange: showPopupSearch ? handleOpenChange : onOpenChange,
        popupRender: showPopupSearch ? renderPopup : popupRender,
      })}
    />
  );
});

Select.SECRET_COMBOBOX_MODE_DO_NOT_USE = AntdSelect.SECRET_COMBOBOX_MODE_DO_NOT_USE;

export default Select;
