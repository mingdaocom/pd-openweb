import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, UserHead } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { openControlAttachmentInNewTab } from 'worksheet/controllers/record';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import emptyCover from 'src/pages/worksheet/assets/emptyCover.png';
import { isSameType } from 'src/pages/worksheet/common/ViewConfig/util.js';
import CellControl from 'src/pages/worksheet/components/CellControls/index.jsx';
import { browserIsMobile, getClassNameByExt, getIconNameByExt } from 'src/utils/common';
import { sortControlByIds } from 'src/utils/control';
import RegExpValidator from 'src/utils/expression';
import { addBehaviorLog } from 'src/utils/project';
import { lineBottomHeight, minControlWidth, types } from '../config';

const Wrap = styled.div`
  .flexShrink0 {
    flex-shrink: 0;
    min-width: 0;
  }
  overflow: hidden;
  .LineHeight48 {
    line-height: 48px;
  }
  .groupTable {
    overflow-x: auto;
    overflow-y: hidden;
    .tableCon {
      scrollbar-gutter: stable;
      width: 0;
      overflow-x: ${props => (props.oneControl ? 'hidden' : 'auto')};
      overflow-y: overlay;
    }
    .head {
      overflow-x: ${props => (props.oneControl ? 'hidden' : 'auto')};
      /* 隐藏Chrome、Safari和Opera的滚动条 */
      &::-webkit-scrollbar {
        display: none;
      }
      /* 隐藏Internet Explorer和Edge的滚动条 */
      -ms-overflow-style: none; /* Internet Explorer和Edge */
      scrollbar-width: none; /* Firefox */
      border-bottom: 1px solid rgba(0, 0, 0, 0.09);
      .tb {
        border-bottom: none;
      }
    }
  }
  &.isMobile {
    .groupTable .tableCon {
      /* 隐藏Chrome、Safari和Opera的滚动条 */
      &::-webkit-scrollbar {
        display: none;
      }
      /* 隐藏Internet Explorer和Edge的滚动条 */
      -ms-overflow-style: none; /* Internet Explorer和Edge */
      scrollbar-width: none; /* Firefox */
    }
    .groupTableCon {
      &::after {
        height: 50px;
        content: ' ';
        display: block;
      }
    }
  }
  .dragLine {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    height: 100%;
    width: 2px;
    cursor: ew-resize;
    background-color: #0f8df2;
  }
`;

const WrapTableCon = styled.div`
  // scrollbar-width: thin;
  .roleAvatar {
    img {
      vertical-align: top;
    }
  }
  .th {
    border-bottom: 1px solid rgba(0, 0, 0, 0.09);
    .add {
      position: sticky;
      width: 0;
      height: 36px;
      line-height: 36px;
      right: 0;
      left: 100%;
    }
    .addCoin,
    .totalNum {
      position: absolute;
      right: 4px;
      width: 24px;
      min-width: 24px;
      height: 36px;
      line-height: 36px;
      color: #9e9e9e;
      display: none;
      background-color: #fff;
      transform: translateX(5px);
      &.totalNum {
        display: block;
      }
    }
    &:hover {
      .addCoin {
        display: block;
        &:hover {
          color: #1677ff;
        }
      }
      .totalNum {
        display: none;
      }
    }
    .icon-add {
      opacity: 0;
      transform: translateX(-3px);
    }
    &:hover .icon-add {
      opacity: 1;
    }
  }
`;
const TbWrap = styled.div`
  border-left: 1px solid rgba(0, 0, 0, 0.04);
  padding: 0 6px;
  flex-shrink: 0;
  .drag {
    position: absolute;
    right: -1px;
    top: 0;
    z-index: 1;
    height: 100%;
    width: 2px;
    cursor: ew-resize;
  }
  .cover {
    border: 1px solid rgba(0, 0, 0, 0.05);
    width: 44px;
    height: 44px;
    border-radius: 3px;
    background-repeat: no-repeat;
    background-position: center;
    background-color: #fff;
    .fileIcon {
      width: 24px;
      height: 29px;
      margin: 0 auto;
    }
  }
`;
export default function GroupCon(props) {
  const headContainer = useRef(null);
  const tbodyContainer = useRef(null);
  const { resourceview, view, controls, viewId, appId, worksheetInfo, base = {} } = props;
  const { resourceDataByKey, keywords } = resourceview;
  const viewControlInfo = controls.find(o => o.controlId === _.get(view, 'viewControl')) || {};
  const { dataSource } = viewControlInfo;
  const isM = browserIsMobile();
  const getControls = props => {
    if (isM) {
      return [];
    }
    const { view, resourceview } = props;
    const { resourceRelationControls } = resourceview;
    const { displayControls, controlsSorts } = view;
    const displayControlsInfo = resourceRelationControls.filter(o => displayControls.includes(o.controlId));
    return sortControlByIds(displayControlsInfo, controlsSorts);
  };
  const [{ widthConfig, dragValue, displayControlsInfo, isScrollHead }, setState] = useSetState({
    dragValue: 0,
    widthConfig: localStorage.getItem(`viewColumnWidthConfig-${props.viewId}`)
      ? JSON.parse(localStorage.getItem(`viewColumnWidthConfig-${props.viewId}`))
      : { 0: minControlWidth },
    displayControlsInfo: getControls(props),
    allWidth: 0,
    isScrollHead: false,
  });

  useEffect(() => {
    let w = widthConfig[0] || minControlWidth;
    const controlList = getControls(props);
    controlList.map((o, i) => {
      w = w + (widthConfig[i + 1] || minControlWidth);
    });
    setState({
      displayControlsInfo: controlList,
      allWidth: w,
    });
  }, [props.view, _.get(props, 'resourceview.resourceRelationControls')]);

  const type =
    localStorage.getItem(`${view.viewId}_resource_type`) || types[_.get(view, 'advancedSetting.calendarType') || 0];
  const handleMouseDown = (event, index) => {
    const { target } = event;
    const startClientX = event.clientX;
    const startDragValue = target.parentElement.offsetLeft + target.parentElement.clientWidth;

    setState({
      dragValue: startDragValue,
    });
    const setColumnWidth = width => {
      const data = {
        ...widthConfig,
        [index]: width,
      };
      let w = widthConfig[0] || minControlWidth;
      displayControlsInfo.map((o, i) => {
        w = w + (widthConfig[i + 1] || minControlWidth);
      });
      setState({
        widthConfig: data,
        allWidth: w,
      });
      localStorage.setItem(`viewColumnWidthConfig-${view.viewId}`, JSON.stringify(data));
    };
    document.onmousemove = event => {
      const x = event.clientX - startClientX;
      const width = target.parentElement.clientWidth + x;
      if (width >= minControlWidth) {
        setState({
          dragValue: startDragValue + x,
        });
      }
    };
    document.onmouseup = event => {
      const x = event.clientX - startClientX;
      const width = target.parentElement.clientWidth + x;
      setColumnWidth(width >= minControlWidth ? width : minControlWidth);
      setState({
        dragValue: 0,
      });
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };
  const renderDrag = index => {
    return (
      <div
        onMouseDown={event => {
          handleMouseDown(event, index);
        }}
        className="drag"
      />
    );
  };
  const bodyScroll = () => {
    let scrollLeftNum = tbodyContainer.current && tbodyContainer.current.scrollLeft;
    if (headContainer.current) {
      headContainer.current.scrollLeft = scrollLeftNum;
      headContainer.current.style.marginRight = 10;
    }
    const scrollTop = tbodyContainer.current && tbodyContainer.current.scrollTop;
    document.getElementById(`rightCon_${viewId}`).scrollTop = scrollTop;
    document.getElementById(`scrollDiv_${viewId}`).scrollTop = scrollTop;
    if (
      Math.floor($(`#resourceGroup_${viewId}_0`).width()) > props.directoryWidth &&
      Math.floor($(`#resourceRow_${viewId}_0`).width()) <= props.width - props.directoryWidth
    ) {
      $(`#rightCon_${viewId}`).css({
        paddingBottom: 10,
      });
    }
  };
  const headScroll = () => {
    let scrollLeftNum = headContainer.current && headContainer.current.scrollLeft;
    if (headContainer.current) {
      tbodyContainer.current.scrollLeft = scrollLeftNum;
    }
  };
  const addRecordInfo = defaultFormData => {
    const { base = {}, refresh, isCharge } = props;
    const { worksheetId } = base;
    addRecord({
      worksheetId: worksheetId,
      defaultFormData,
      defaultFormDataEditable: true,
      directAdd: true,
      isCharge: isCharge,
      onAdd: () => {
        refresh();
      },
    });
  };

  const previewAttachment = (e, allAttachments, rowId) => {
    // 不允许预览
    if (_.get(view, 'advancedSetting.opencover') === '2' || isM) {
      return;
    }
    e.stopPropagation();
    const viewControlInfo = controls.find(o => o.controlId === _.get(view, 'viewControl')) || {};
    const { viewId, dataSource } = viewControlInfo;
    sheetAjax
      .getWorksheetInfo({
        worksheetId: dataSource,
        getSwitchPermit: true,
        resultType: 2,
        relationWorksheetId: base.worksheetId,
      })
      .then(res => {
        const { switches, worksheetId, appId } = res;
        const recordAttachmentSwitch = !viewId
          ? true
          : isOpenPermit(permitList.recordAttachmentSwitch, switches, viewId);
        let hideFunctions = ['editFileName'];
        if (!recordAttachmentSwitch) {
          /* 是否不可下载 且 不可保存到知识和分享 */
          hideFunctions.push('download', 'share', 'saveToKnowlege');
        }
        addBehaviorLog('previewFile', worksheetId, {
          fileId: _.get(allAttachments, `[${0}].fileID`),
          rowId,
        });
        const { coverCid } = view;
        previewAttachments(
          {
            index: 0,
            attachments: allAttachments.map(attachment =>
              Object.assign({}, attachment, {
                previewAttachmentType: attachment.refId ? 'KC_ID' : 'COMMON_ID',
              }),
            ),
            showThumbnail: true,
            hideFunctions: hideFunctions,
            recordId: rowId,
            worksheetId,
            controlId: coverCid,
          },
          {
            openControlAttachmentInNewTab: recordAttachmentSwitch
              ? (fileId, options = {}) => {
                  openControlAttachmentInNewTab({
                    controlId: coverCid,
                    fileId,
                    appId,
                    recordId: rowId,
                    viewId,
                    worksheetId,
                    ...options,
                  });
                }
              : undefined,
          },
        );
      });
  };
  let scrollLeftNum = headContainer.current && headContainer.current.scrollLeft;
  const allW = _.sum([
    displayControlsInfo.length <= 0 ? props.directoryWidth : widthConfig[0] || minControlWidth,
    ...displayControlsInfo.map((o, index) => widthConfig[index + 1] || minControlWidth),
  ]);
  return (
    <Wrap
      width={props.directoryWidth}
      oneControl={displayControlsInfo.length <= 0}
      className={cx('w100 flex Relative', { isMobile: isM })}
    >
      <div className="groupTable flexColumn w100 h100 Relative">
        <div
          className={cx('head w100 flexRow alignItemsCenter titleCon Bold Font13 Gray_75 TxtMiddle')}
          style={{
            height: type === 'Day' ? 28 + 2 : 28,
            lineHeight: `28px`,
          }}
          onScroll={headScroll}
          ref={headContainer}
          onMouseEnter={() => {
            setState({
              isScrollHead: true,
            });
          }}
        >
          <div className="headCon flexRow alignItemsCenter h100">
            <TbWrap
              className="tb Relative flexRow alignItemsCenter h100"
              style={{
                width: isM
                  ? '100%'
                  : displayControlsInfo.length <= 0
                    ? props.directoryWidth
                    : widthConfig[0] || minControlWidth,
                background: '#fff',
              }}
            >
              <span className="overflow_ellipsis WordBreak flex w100">
                {(controls.find(o => o.controlId === _.get(view, 'viewControl')) || {}).controlName}
              </span>
              {displayControlsInfo.length > 0 && renderDrag(0)}
            </TbWrap>
            {displayControlsInfo.map((o, index) => {
              return (
                <TbWrap
                  className="tb Relative flexRow alignItemsCenter h100"
                  style={{ width: isM ? '100%' : widthConfig[index + 1] || minControlWidth }}
                >
                  <span className="overflow_ellipsis WordBreak flex w100">{o.controlName}</span>
                  {renderDrag(index + 1)}
                </TbWrap>
              );
            })}
            {displayControlsInfo.length > 0 && !isScrollHead && (
              <div className="h100 tb forScroll" style={{ minWidth: 11, width: 11, marginLeft: -1 }}></div>
            )}
            {dragValue - scrollLeftNum > 0 && (
              <div style={{ left: dragValue - scrollLeftNum, height: $('.tableCon').height }} className="dragLine" />
            )}
          </div>
        </div>
        <WrapTableCon
          className={cx('groupTableCon flex tableCon w100')}
          id={`leftCon_${viewId}`}
          style={{
            overflowX: allW - 10 > props.directoryWidth ? 'auto' : 'hidden',
            height: _.sum(resourceDataByKey.map(o => o.height)),
          }}
          onScroll={bodyScroll}
          ref={tbodyContainer}
          onMouseEnter={() => {
            setState({
              isScrollHead: false,
            });
          }}
        >
          {resourceDataByKey.length <= 0 && (
            <div className="TxtCenter mTop20 Gray_9e">{keywords ? _l('没有搜索结果') : _l('无数据')}</div>
          )}
          {resourceDataByKey.map((o, i) => {
            const height = o.height + lineBottomHeight + 1; //底部有lineBottomHeight间距,
            const viewControlData = controls.find(o => o.controlId === _.get(view, 'viewControl')) || {};
            const renderAccount = name => {
              const data = safeParse(name);
              return (
                <div className="flexRow alignItemsCenter">
                  <UserHead
                    key={data.accountId}
                    projectId={worksheetInfo.projectId}
                    size={24}
                    user={{
                      ...data,
                      accountId: data.accountId,
                      userHead: data.avatar,
                    }}
                    className={'roleAvatar flexShrink0'}
                    appId={appId}
                  />
                  <span className={cx('mLeft6 flexShrink0', { 'flex WordBreak overflow_ellipsis': isM })}>
                    {data.fullname}
                  </span>
                </div>
              );
            };
            const renderRelate = o => {
              const { coverCid } = view;
              const row = safeParse(o.data || '{}');
              const coverData = safeParse(row[coverCid] || '{}')[0] || {};
              const { previewUrl, ext } = coverData;
              const isImg =
                ext &&
                getIconNameByExt(
                  /^\w+$/.test(ext) ? ext.toLowerCase() : RegExpValidator.getExtOfFileName(ext).toLowerCase(),
                ) === 'img';
              return coverCid ? (
                <div className="flexRow alignItemsCenter flex">
                  {!isImg ? (
                    <div
                      className="cover flexShrink0 flexRow alignItemsCenter TxtCenter"
                      onClick={e => (ext ? previewAttachment(e, [coverData], row.rowid) : null)}
                    >
                      {ext ? (
                        <div className={cx('fileIcon', getClassNameByExt(ext))} />
                      ) : (
                        <img width={24} src={emptyCover} style={{ margin: '0 auto' }} />
                      )}
                    </div>
                  ) : (
                    <div
                      className="cover flexShrink0"
                      style={{
                        backgroundImage: `url(${previewUrl.replace(
                          /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
                          `imageView2/0`,
                        )})`,
                        backgroundSize: _.get(view, 'coverType') !== 1 ? 'cover' : 'contain',
                      }}
                      onClick={e => previewAttachment(e, [coverData], row.rowid)}
                    ></div>
                  )}
                  <span className={cx('mLeft6 flexShrink0', { 'flex WordBreak overflow_ellipsis': isM })}>
                    {o.name}
                  </span>
                </div>
              ) : (
                o.name
              );
            };
            const renderName = () => {
              const row = safeParse(o.name || '{}');
              return row[isSameType([27], viewControlData) ? 'departmentName' : 'organizeName'];
            };
            return (
              <div
                className="th flexRow alignItemsCenter Relative"
                id={`resourceGroup_${viewId}_${i}`}
                style={{
                  // height: $(`#resourceRow_${viewId}_${i}`).height(),
                  height,
                  minWidth: isM ? 'unset' : props.directoryWidth,
                  width: isM ? '100%' : allW,
                }}
                onMouseEnter={() => {
                  $(`#resourceRow_${viewId}_${i}`).css({
                    background: 'rgba(0,0,0,0.04)',
                  });
                  $(`#resourceGroup_${viewId}_${i}`).css({
                    background: 'rgba(0,0,0,0.04)',
                  });
                  $(`#resourceGroup_${viewId}_${i}`).find('.totalNum,.addCoin').css({
                    background: '#F4F4F4',
                  });
                }}
                onMouseLeave={() => {
                  $(`#resourceRow_${viewId}_${i}`).css({
                    background: 'transparent',
                  });
                  $(`#resourceGroup_${viewId}_${i}`).css({
                    background: 'transparent',
                  });
                  $(`#resourceGroup_${viewId}_${i}`).find('.totalNum,.addCoin').css({
                    background: '#fff',
                  });
                }}
              >
                <TbWrap
                  className="tb TxtMiddle h100 flexRow alignItemsCenter"
                  style={{
                    width: isM
                      ? '100%'
                      : displayControlsInfo.length <= 0
                        ? props.directoryWidth
                        : widthConfig[0] || minControlWidth,
                  }}
                >
                  <span className="overflow_ellipsis WordBreak flex w100">
                    {isSameType([26], viewControlData)
                      ? renderAccount(o.name)
                      : isSameType([27, 48], viewControlData)
                        ? renderName()
                        : isSameType([29], viewControlData)
                          ? renderRelate(o)
                          : o.name}
                  </span>
                </TbWrap>
                {displayControlsInfo.map((it, index) => {
                  const row = safeParse(o.data || '{}');
                  const value = row[it.controlId];
                  const tbW =
                    index === displayControlsInfo.length - 1
                      ? (props.directoryWidth - allW > 0
                          ? (widthConfig[index + 1] || minControlWidth) + (props.directoryWidth - allW)
                          : widthConfig[index + 1] || minControlWidth) - 25
                      : widthConfig[index + 1] || minControlWidth;
                  return (
                    <TbWrap
                      className={cx('tb overflow_ellipsis WordBreak h100 flexRow alignItemsCenter')}
                      style={{
                        width: tbW,
                      }}
                    >
                      <CellControl
                        row={row}
                        cell={{
                          ...it,
                          value,
                          ...(it.type === 30 && [9, 10, 11].includes(it.sourceControlType)
                            ? { options: _.get(it, 'sourceControl.options') }
                            : {}),
                        }}
                        isCharge={props.isCharge}
                        from={4}
                        // appId={appId}
                        projectId={worksheetInfo.projectId}
                        rowFormData={() =>
                          _.get(props, 'resourceview.resourceRelationControls').map(c => ({
                            ...c,
                            value: row[c.controlId],
                          }))
                        }
                        worksheetId={dataSource}
                        className={'w100 overflow_ellipsis WordBreak flex w100'}
                      />
                    </TbWrap>
                  );
                })}

                {worksheetInfo.allowAdd &&
                  ((controls.find(o => o.controlId === view.viewControl) || {}).fieldPermission || '111')[1] === '1' &&
                  isOpenPermit(permitList.createButtonSwitch, worksheetInfo.switches, viewId) && //功能开关，是否允许创建
                  !(_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage') || isM) && (
                    <div
                      className="add"
                      onClick={() => {
                        let value = o.key;
                        const info = controls.find(o => o.controlId === view.viewControl) || {};
                        if (isSameType([26], info)) {
                          const { name = '' } = o;
                          if (name) {
                            const user = JSON.parse(name);
                            value = JSON.stringify(Array.isArray(user) ? user : [user]);
                          } else {
                            value = '[]';
                          }
                        }
                        if (isSameType([27, 48], info)) {
                          const { key } = o;
                          const row = safeParse(o.name || '{}');
                          if (key) {
                            value = JSON.stringify([row]);
                          } else {
                            value = '[]';
                          }
                        }
                        if (isSameType([29], info)) {
                          value = JSON.stringify([{ sid: o.key, name: o.name }]);
                        }
                        if (isSameType([9, 10, 11, 28], info)) {
                          value = isSameType([28], info) ? value : JSON.stringify([value]);
                        }
                        if (o.key === '-1') {
                          value = '';
                        }
                        addRecordInfo({
                          [_.get(view, 'viewControl')]: value,
                        });
                      }}
                    >
                      {o.rows.length > 0 && (
                        <div className="Gray_9e totalNum w100 TxtCenter TxtMiddle">{o.rows.length}</div>
                      )}
                      <Icon className="addCoin Font18 Hand" icon="add_circle" />
                    </div>
                  )}
              </div>
            );
          })}
        </WrapTableCon>
      </div>
    </Wrap>
  );
}
