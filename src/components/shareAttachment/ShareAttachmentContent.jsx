import React from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Divider, Input, Popover, Select, Switch } from 'ming-ui/antd-components';
import useCreateCalendar from 'src/components/createCalendar/useCreateCalendar';
import useCreateTask from 'src/components/createTask/useCreateTask';
import { formatFileSize } from 'src/utils/core/file';
import { getClassNameByExt } from 'src/utils/domain/file/classification';
import RegExpValidator from 'src/utils/domain/validation/expression';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { _getChatList, _getMyTaskList, createNewChat, createNewTask } from './ajax';
import { ATTACHMENT_TYPE, SEND_TO_TYPE } from './enum';
import './style.less';

const SHARE_TARGETS = [
  {
    className: 'chat',
    icon: 'icon-to-chat-circle',
    getLabel: () => _l('发消息%02072'),
    suite: '6',
    type: SEND_TO_TYPE.CHAT,
  },
  {
    className: 'feed',
    icon: 'icon-to-feed-circle',
    getLabel: () => _l('发动态%02073'),
    suite: '1',
    type: SEND_TO_TYPE.FEED,
  },
  {
    className: 'task',
    icon: 'icon-to-task-circle',
    getLabel: () => _l('发任务%02074'),
    suite: '2',
    type: SEND_TO_TYPE.TASK,
  },
  {
    className: 'calendar',
    icon: 'icon-calendar',
    getLabel: () => _l('发日程%02075'),
    suite: '3',
    type: SEND_TO_TYPE.CALENDAR,
  },
  {
    className: 'kc',
    icon: 'icon-to-kc-circle',
    getLabel: () => _l('存入知识%02076'),
    suite: '4',
    type: SEND_TO_TYPE.KC,
  },
];

const preventDefault = event => event.preventDefault();
const selectInputContent = event => event.currentTarget.select();
const COPY_LINK_POPOVER_CLASS_NAMES = { root: 'shareAttachmentCopyLinkPopover' };
const READ_ONLY_FILE_NAME_TYPES = [ATTACHMENT_TYPE.KC, ATTACHMENT_TYPE.WORKSHEET, ATTACHMENT_TYPE.WORKSHEETROW];
const INITIAL_UI_STATE = {
  closedTipVisible: false,
  footerVisible: false,
  sendToOtherVisible: false,
  shareSettingsVisible: false,
  targetListVisible: false,
};

const isSafeImageUrl = value =>
  /^(https?:)?\/\//i.test(value) ||
  /^\/(?!\/)/.test(value) ||
  /^blob:/i.test(value) ||
  /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(value);

const getSendToOptions = attachmentType => {
  if ([ATTACHMENT_TYPE.WORKSHEET, ATTACHMENT_TYPE.WORKSHEETROW].includes(attachmentType)) {
    return [{ value: SEND_TO_TYPE.CHAT, label: _l('消息') }];
  }

  return [
    { value: SEND_TO_TYPE.CHAT, label: _l('消息') },
    { value: SEND_TO_TYPE.FEED, label: _l('动态') },
    { value: SEND_TO_TYPE.TASK, label: _l('任务') },
    { value: SEND_TO_TYPE.CALENDAR, label: _l('日程') },
    { value: SEND_TO_TYPE.KC, label: _l('知识') },
  ];
};

const getFileIconClass = ({ attachmentType, ext, folderShared, isKcFolder }) => {
  if (attachmentType === ATTACHMENT_TYPE.WORKSHEET) {
    return 'worksheetIcon';
  }

  if (attachmentType === ATTACHMENT_TYPE.WORKSHEETROW) {
    return 'worksheetRecordIcon';
  }

  if (isKcFolder) {
    return folderShared ? 'fileIcon-folderShared' : 'fileIcon-folder';
  }

  return getClassNameByExt(`.${ext}`);
};

const getDestinationConfig = (type, openCreateTask) => {
  if (type === SEND_TO_TYPE.TASK) {
    return {
      create: () => createNewTask(openCreateTask),
      createLabel: _l('创建新任务'),
      fetch: _getMyTaskList,
      getLabel: item => item.taskName,
      getValue: item => item.taskID,
    };
  }

  return {
    create: createNewChat,
    createLabel: _l('创建新聊天'),
    fetch: _getChatList,
    getLabel: item => item.name,
    getValue: item => item.value,
  };
};

function DestinationSelect({ onChange, type }) {
  const { open: openCreateTask, holder: createTaskHolder } = useCreateTask();
  const config = React.useMemo(() => getDestinationConfig(type, openCreateTask), [openCreateTask, type]);
  const [loading, setLoading] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [options, setOptions] = React.useState([]);
  const [value, setValue] = React.useState();
  const creatingRef = React.useRef(false);
  const debouncedSearchRef = React.useRef();
  const hasLoadedRef = React.useRef(false);
  const mountedRef = React.useRef(true);
  const requestIdRef = React.useRef(0);

  const formatOptions = React.useCallback(
    list =>
      list.map((item, index) => ({
        data: item,
        label: String(config.getLabel(item) ?? ''),
        value: config.getValue(item) ?? `${type}-${index}`,
      })),
    [config, type],
  );

  const fetchOptions = React.useCallback(
    async keywords => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      setLoading(true);
      try {
        const list = await config.fetch({
          keywords: _.trim(keywords),
          projectId: type === SEND_TO_TYPE.CHAT ? undefined : 'all',
          size: 20,
        });

        if (mountedRef.current && requestId === requestIdRef.current) {
          const destinations = type === SEND_TO_TYPE.CHAT ? list.filter(item => item.value !== 'file-transfer') : list;
          setOptions(formatOptions(destinations));
        }
      } catch (error) {
        if (mountedRef.current && requestId === requestIdRef.current) {
          hasLoadedRef.current = false;
          console.error(error);
          alertIfNotUnauthorized(error, _l('获取数据失败'), 2);
        }
      } finally {
        if (mountedRef.current && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [config, formatOptions, type],
  );

  React.useEffect(() => {
    const debouncedSearch = _.debounce(fetchOptions, 300);
    mountedRef.current = true;
    debouncedSearchRef.current = debouncedSearch;

    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
      debouncedSearch.cancel();
      debouncedSearchRef.current = undefined;
    };
  }, [fetchOptions]);

  const handleSearch = keywords => {
    requestIdRef.current += 1;
    debouncedSearchRef.current?.(keywords);
  };

  const handleOpenChange = open => {
    if (open && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchOptions('');
    }
  };

  const handleChange = (nextValue, option) => {
    requestIdRef.current += 1;
    debouncedSearchRef.current?.cancel();
    setLoading(false);
    setValue(nextValue);
    onChange(type, option.data);
  };

  const handleCreate = async () => {
    if (creatingRef.current) return;

    creatingRef.current = true;
    requestIdRef.current += 1;
    debouncedSearchRef.current?.cancel();
    setLoading(false);
    setCreating(true);
    try {
      const item = await config.create();
      if (!mountedRef.current || !item) return;

      const [option] = formatOptions([item]);
      setOptions([option]);
      setValue(option.value);
      onChange(type, item);
    } catch (error) {
      if (mountedRef.current && !error?.canceled) {
        console.error(error);
        alertIfNotUnauthorized(error, _l('创建失败'), 2);
      }
    } finally {
      creatingRef.current = false;
      if (mountedRef.current) {
        setCreating(false);
      }
    }
  };

  return (
    <>
      {createTaskHolder}
      <Select
        className="shareAttachmentDestinationSelect"
        classNames={{ popup: { root: 'shareAttachmentDestinationPopup' } }}
        filterOption={false}
        loading={loading}
        notFoundContent={loading ? _l('加载中...') : _l('无搜索结果')}
        optionRender={({ data }) => (
          <div className="destinationOption flexRow alignItemsCenter">
            {type === SEND_TO_TYPE.CHAT && data.data.logo && isSafeImageUrl(data.data.logo) && (
              <img src={data.data.logo} alt="" />
            )}
            <span className="ellipsis">{data.label}</span>
          </div>
        )}
        options={options}
        placeholder={_l('请选择')}
        popupRender={menu => (
          <div>
            {menu}
            <Divider className="mTop0 mBottom0" />
            <div
              className={cx('destinationCreate colorPrimary', { disabled: creating })}
              onClick={handleCreate}
              onMouseDown={preventDefault}
            >
              <i className="icon icon-add_circle" />
              <span>{creating ? _l('创建中...') : config.createLabel}</span>
            </div>
          </div>
        )}
        showSearch
        value={value}
        onChange={handleChange}
        onOpenChange={handleOpenChange}
        onSearch={handleSearch}
      />
    </>
  );
}

DestinationSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  type: PropTypes.number.isRequired,
};

function KnowledgePath({ onClick, pathParts }) {
  return (
    <span className="kcPath colorPrimary" onClick={onClick}>
      {pathParts
        ? pathParts.map((part, index) => (
            <React.Fragment key={pathParts.slice(0, index + 1).join('/') || `root-${index}`}>
              <span className="pathStr ellipsis">{part}</span>
              {index < pathParts.length - 1 && '/'}
            </React.Fragment>
          ))
        : _l('请选择文件夹')}
    </span>
  );
}

KnowledgePath.propTypes = {
  onClick: PropTypes.func.isRequired,
  pathParts: PropTypes.arrayOf(PropTypes.string),
};

function ShareTargetList({ forbidSuites, onSelect }) {
  const contentRef = React.useRef(null);
  const listBoxRef = React.useRef(null);
  const [controls, setControls] = React.useState({ next: false, prev: false });
  const targets = React.useMemo(() => SHARE_TARGETS.filter(item => !forbidSuites.includes(item.suite)), [forbidSuites]);

  const updateControls = React.useCallback(() => {
    const listBox = listBoxRef.current;
    if (!listBox) return;

    const nextControls = {
      next: listBox.scrollLeft + listBox.clientWidth < listBox.scrollWidth - 1,
      prev: listBox.scrollLeft > 1,
    };
    setControls(current =>
      current.next === nextControls.next && current.prev === nextControls.prev ? current : nextControls,
    );
  }, []);

  React.useEffect(() => {
    const listBox = listBoxRef.current;
    if (!listBox) return undefined;

    updateControls();
    const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(updateControls);
    resizeObserver?.observe(listBox);
    if (contentRef.current) {
      resizeObserver?.observe(contentRef.current);
    }

    window.addEventListener('resize', updateControls);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateControls);
    };
  }, [targets, updateControls]);

  const scroll = direction => {
    const listBox = listBoxRef.current;
    if (!listBox) return;

    listBox.scrollBy({ behavior: 'smooth', left: direction * listBox.clientWidth });
  };

  return (
    <div className="selectTargetBtnList">
      {controls.prev && (
        <span className="prev icon icon-arrow-left-border hoverColorPrimary Hand" onClick={() => scroll(-1)} />
      )}
      {controls.next && (
        <span className="next icon icon-arrow-right-border hoverColorPrimary Hand" onClick={() => scroll(1)} />
      )}
      <div className="listBox" ref={listBoxRef} onScroll={updateControls}>
        <div className="contentCon" ref={contentRef}>
          {targets.map(item => (
            <div className={cx('targetBtn', item.className)} key={item.type} onClick={() => onSelect(item.type)}>
              <span className={cx('icon', item.icon)} />
              <p>{item.getLabel()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

ShareTargetList.propTypes = {
  forbidSuites: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export const ShareAttachmentContent = React.forwardRef(function ShareAttachmentContent(
  {
    attachmentType,
    defaultSendToType,
    file,
    forbidSuites,
    initialNode,
    isKcFolder,
    onCancel,
    onDestinationChange,
    onKnowledgePathClick,
    onMount,
    onPermissionChange,
    onShare,
    onSendToTypeChange,
    showChangeDownload,
    showChangeShare,
  },
  ref,
) {
  const { open: openCalendar, holder: createCalendarHolder } = useCreateCalendar();
  const [allowDownload, setAllowDownload] = React.useState(true);
  const [allowDownloadDisabled, setAllowDownloadDisabled] = React.useState(false);
  const [description, setDescription] = React.useState('');
  const [descriptionVisible, setDescriptionVisible] = React.useState(false);
  const [fileName, setFileName] = React.useState(file.name);
  const [folderShared, setFolderShared] = React.useState(Boolean(initialNode?.isOpenShare));
  const [imageFailed, setImageFailed] = React.useState(false);
  const [knowledgePathParts, setKnowledgePathParts] = React.useState();
  const [copyLinkVisible, setCopyLinkVisible] = React.useState(false);
  const [permissionConfig, setPermissionConfig] = React.useState({ disabled: false, options: [], value: undefined });
  const [sendToType, setSendToType] = React.useState(defaultSendToType);
  const [shareUrl, setShareUrl] = React.useState('');
  const [uiState, setUiState] = React.useState(INITIAL_UI_STATE);
  const fileNameReadOnly = READ_ONLY_FILE_NAME_TYPES.includes(attachmentType);
  const showImagePreview = !imageFailed && RegExpValidator.fileIsPicture(`.${file.ext}`) && file.imgSrc;
  const sendToOptions = React.useMemo(() => getSendToOptions(attachmentType), [attachmentType]);

  React.useImperativeHandle(
    ref,
    () => ({
      getFormData: () => ({ allowDownload, description: description.trim(), fileName }),
      openCalendar,
      setAllowDownload,
      setAllowDownloadDisabled,
      setCopyLinkVisible,
      setFolderShared,
      setKnowledgePath: setKnowledgePathParts,
      setPermissionConfig,
      setPermissionValue: value => setPermissionConfig(current => ({ ...current, value })),
      setSendToType,
      setShareUrl: value => setShareUrl(value || ''),
      updateUiState: value => setUiState(current => ({ ...current, ...value })),
    }),
    [allowDownload, description, fileName, openCalendar],
  );

  React.useEffect(() => {
    const timer = setTimeout(onMount, 0);

    return () => clearTimeout(timer);
  }, [onMount]);

  const handleSendToTypeChange = value => {
    const nextType = Number(value);
    setSendToType(nextType);
    setKnowledgePathParts(undefined);
    onSendToTypeChange(nextType);
  };

  const handlePermissionChange = value => {
    setPermissionConfig(current => ({ ...current, value }));
    onPermissionChange(value);
  };

  const handlePermissionClick = () => {
    if (permissionConfig.disabled) {
      alert(_l('无权修改，请联系管理员'), 3);
    }
  };

  const handleCopyLink = React.useCallback(() => {
    copy(shareUrl);
    alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方'));
  }, [shareUrl]);

  const handleTargetClick = type => {
    setKnowledgePathParts(undefined);
    onSendToTypeChange(type);
  };

  return (
    <div
      className={cx('shareAttachmentDialogContainer', {
        isWorksheet: attachmentType === ATTACHMENT_TYPE.WORKSHEET,
        isWorksheetRow: attachmentType === ATTACHMENT_TYPE.WORKSHEETROW,
      })}
    >
      {createCalendarHolder}
      <div className="filePreview">
        {showImagePreview ? (
          <div className="thumbnailCon">
            <div className="thumbnail">
              <img src={file.imgSrc} alt={file.name} onError={() => setImageFailed(true)} />
            </div>
          </div>
        ) : (
          <div
            className={cx('fileIcon', getFileIconClass({ attachmentType, ext: file.ext, folderShared, isKcFolder }))}
          >
            <span className="fileSize">{formatFileSize(file.size).replace(/ /g, '')}</span>
          </div>
        )}
      </div>
      <div className="dList">
        <div className="dItem">
          <div className="itemLabel">{_l('名称')}</div>
          <div className="itemContent">
            {fileNameReadOnly ? (
              <span className="fileNameText ellipsis">{file.name}</span>
            ) : (
              <Input value={fileName} placeholder={_l('名称')} onChange={event => setFileName(event.target.value)} />
            )}
          </div>
        </div>
        {showChangeDownload && (
          <div className="dItem">
            <div className="itemLabel">{_l('允许下载%02071')}</div>
            <div className="itemContent">
              <div className="downloadableCon">
                <Switch checked={allowDownload} disabled={allowDownloadDisabled} onChange={setAllowDownload} />
                <span
                  className="canDownloadTip"
                  title={_l('可在此配置分享后的文件是否允许用户下载（分享到“消息”的将自动设为可下载）')}
                >
                  <i className="icon icon-help hoverColorPrimary Hand" />
                </span>
              </div>
            </div>
          </div>
        )}
        {showChangeShare && uiState.shareSettingsVisible && (
          <>
            <div className="dItem changeShare">
              <div className="itemLabel">{_l('分享链接')}</div>
              <div className="itemContent">
                <div className="selectSharePermission" onClickCapture={handlePermissionClick}>
                  <Select
                    className="w100"
                    disabled={permissionConfig.disabled}
                    options={permissionConfig.options}
                    value={permissionConfig.value}
                    onChange={handlePermissionChange}
                  />
                </div>
                {copyLinkVisible && (
                  <Popover
                    classNames={COPY_LINK_POPOVER_CLASS_NAMES}
                    content={
                      <div className="copyLinkContent">
                        <div className="linkContentInput">
                          <Input id="linkContent" readOnly value={shareUrl} onClick={selectInputContent} />
                        </div>
                        <Button className="copyLinkBtn" type="primary" onClick={handleCopyLink}>
                          {_l('复制链接')}
                        </Button>
                      </div>
                    }
                    placement="bottomRight"
                  >
                    <Button className="copyLinkCon" icon={<i className="icon icon-link" />}>
                      {_l('复制链接')}
                    </Button>
                  </Popover>
                )}
              </div>
            </div>
            {uiState.closedTipVisible && (
              <div className="dItem closedTip">
                <div className="itemLabel" />
                <div className="itemContent">{_l('链接已关闭，开启后可进行共享')}</div>
              </div>
            )}
          </>
        )}
        {uiState.targetListVisible && (
          <div className="selectTargetCon dItem">
            <div className="itemLabel" />
            <div className="itemContent">
              <ShareTargetList forbidSuites={forbidSuites} onSelect={handleTargetClick} />
            </div>
          </div>
        )}
        {uiState.sendToOtherVisible && (
          <div className="sendToOther">
            <div className="dItem">
              <div className="itemLabel">{_l('分享到')}</div>
              <div className="itemContent flexRow alignItemsCenter">
                <div className="sendToTarget mRight10">
                  <Select
                    className="w100"
                    options={sendToOptions}
                    value={sendToType}
                    onChange={handleSendToTypeChange}
                  />
                </div>
                <div className="sendToContent InlineBlock">
                  {[SEND_TO_TYPE.CHAT, SEND_TO_TYPE.TASK].includes(sendToType) && (
                    <DestinationSelect key={sendToType} type={sendToType} onChange={onDestinationChange} />
                  )}
                  {sendToType === SEND_TO_TYPE.KC && (
                    <KnowledgePath pathParts={knowledgePathParts} onClick={onKnowledgePathClick} />
                  )}
                </div>
              </div>
            </div>
            {descriptionVisible ? (
              <div className="dItem descCon">
                <div className="itemLabel">{_l('添加说明')}</div>
                <div className="itemContent">
                  <Input.TextArea
                    autoFocus
                    rows={4}
                    value={description}
                    placeholder={_l('添加文件说明')}
                    onChange={event => setDescription(event.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="dItem">
                <div className="itemLabel" />
                <div className="itemContent addDescBtn" onClick={() => setDescriptionVisible(true)}>
                  {_l('添加说明')}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {uiState.footerVisible && (
        <div className="shareAttachmentFooter">
          <Button className="textTertiary" color="default" variant="text" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={onShare}>
            {_l('分享')}
          </Button>
        </div>
      )}
    </div>
  );
});

ShareAttachmentContent.propTypes = {
  attachmentType: PropTypes.number.isRequired,
  defaultSendToType: PropTypes.number.isRequired,
  file: PropTypes.shape({
    ext: PropTypes.string,
    imgSrc: PropTypes.string,
    name: PropTypes.string.isRequired,
    size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  forbidSuites: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
  initialNode: PropTypes.shape({ isOpenShare: PropTypes.bool }),
  isKcFolder: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onDestinationChange: PropTypes.func.isRequired,
  onKnowledgePathClick: PropTypes.func.isRequired,
  onMount: PropTypes.func.isRequired,
  onPermissionChange: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  onSendToTypeChange: PropTypes.func.isRequired,
  showChangeDownload: PropTypes.bool.isRequired,
  showChangeShare: PropTypes.bool.isRequired,
};
