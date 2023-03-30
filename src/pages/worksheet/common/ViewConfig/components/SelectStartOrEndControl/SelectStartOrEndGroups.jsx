import React, { useState, useEffect, useRef } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { getIconByType } from 'src/pages/widgetConfig/util';
import SelectStartOrEnd from './SelectStartOrEnd';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import AddControlDiaLog from './AddControlDiaLog';
import { getStringBytes } from 'src/util';
import { getStrBytesLength } from 'src/pages/Role/PortalCon/tabCon/util-pure.js';
import _ from 'lodash';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util.js';
const WrapFragment = styled.div`
  .addMarkInput,
  .addMark {
    width: 96px;
    margin-top: 16px;
    height: 36px;
    line-height: 36px;
    margin-left: 10px;
  }
  .addMarkInput {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    opacity: 1;
    border-radius: 3px;
    padding: 0 12px;
    &:focus {
      border: 1px solid #2196f3;
    }
  }
  .addMark {
    &:hover {
      color: #2196f3 !important;
    }
  }
  .addCalendarcids {
    &:hover {
      color: #2196f3 !important;
      i {
        color: #2196f3 !important;
      }
    }
  }
`;
const WrapCon = styled.div`
  display: flex;
  .settingContent {
    flex: 1;
    max-width: 330px;
  }

  .deleted {
    opacity: 0;
    margin-top: 16px;
    height: 36px;
    line-height: 36px;
    margin-left: 10px;
    &.option0 {
      opacity: 0 !important;
    }
    color: #9e9e9e;
    &:hover {
      color: #f44336;
    }
  }
  &:hover {
    .deleted {
      opacity: 1;
    }
  }
`;
const Wrap = styled.div`
  width: 200px;
  background: #ffffff;
  padding: 6px 0;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.24);
  border-radius: 2px;
  div {
    height: 36px;
    padding: 0 16px;
    line-height: 36px;
    .icon-event:before {
      vertical-align: middle;
    }
    &:hover {
      background: #2196f3;
      color: #fff !important;
      i {
        color: #fff !important;
      }
    }
  }
`;
export default function SelectStartOrEndGroups(props) {
  let {
    view = {},
    handleChange,
    timeControls = [],
    begindateOrFirst, //begindate为空时可以以第一个控件为begindate
    controls = [],
    begindate,
    enddate,
    updateWorksheetControls,
    worksheetId,
    sheetSwitchPermit = [],
  } = props;
  timeControls = setSysWorkflowTimeControlFormat(timeControls, sheetSwitchPermit);
  let $ref = useRef(null);
  const { advancedSetting = {} } = view;
  const [calendarcids, setCalendarcids] = useState([]);
  const [visible, setVisible] = useState(false);
  const [showInput, setShowInput] = useState();
  const [calendarIds, setCalendarIds] = useState([]);
  const [visibleAddControlDiaLog, setVisibleAddControlDiaLog] = useState(false);

  const getData = () => {
    let calendarcids = [];
    try {
      calendarcids = JSON.parse(_.get(view, ['advancedSetting', 'calendarcids']));
    } catch (error) {
      calendarcids = [];
    }
    if (calendarcids.length <= 0 && begindateOrFirst) {
      calendarcids = begindate
        ? [{ begin: begindate, end: enddate }]
        : [
            {
              begin: (timeControls[0] || {}).controlId,
            },
          ];
    }
    return calendarcids;
  };
  useEffect(() => {
    let data = getData();
    setCalendarcids(data);
    setCalendarIds(
      data
        .map(o => o.begin)
        .concat(data.map(o => o.end))
        .filter(o => !!o),
    );
  }, [_.get(view, ['advancedSetting', 'calendarcids'])]);

  return (
    <WrapFragment>
      {calendarcids.map((o, i) => {
        return (
          <WrapCon key={i}>
            <SelectStartOrEnd
              {...props}
              allowClear
              classNames="groupSelectStartOrEnd"
              canAddTimeControl
              i={i}
              begindate={o.begin}
              enddate={o.end}
              timeControls={timeControls.filter(
                item =>
                  !(calendarIds.includes(item.controlId) && item.controlId !== o.begin && item.controlId !== o.end),
              )}
              beginIsDel={o.begin && !controls.find(a => a.controlId === o.begin)}
              endIsDel={o.end && !controls.find(a => a.controlId === o.end)}
              handleChange={data => {
                // begindate ,enddate
                if (!data.begindate && !data.enddate) {
                  handleChange({
                    calendarcids: JSON.stringify(calendarcids.filter(item => o.begin !== item.begin)),
                  });
                } else {
                  handleChange({
                    calendarcids: JSON.stringify(
                      calendarcids.map((item, n) => {
                        if (n === i) {
                          return {
                            mark: item.mark,
                            begin: data.begindate,
                            end: data.enddate,
                          };
                        } else {
                          return item;
                        }
                      }),
                    ),
                  });
                }
              }}
            />
            {o.mark || showInput === i ? (
              <input
                className="addMarkInput"
                value={o.mark}
                key={i + 'input'}
                ref={showInput === i ? $ref : null}
                onChange={e => {
                  setShowInput(i);
                  setCalendarcids(
                    calendarcids.map(item => {
                      if (item.begin === o.begin && item.end === o.end) {
                        return {
                          ...item,
                          mark: e.target.value.trim(),
                        };
                      } else {
                        return item;
                      }
                    }),
                  );
                }}
                onBlur={e => {
                  setShowInput(undefined);
                  let str =
                    getStringBytes(e.target.value.trim()) <= 20 //10个中文字符
                      ? e.target.value.trim()
                      : getStrBytesLength(e.target.value.trim(), 20);
                  // if (getStringBytes(e.target.value.trim()) > 20) {
                  //   alert(_l('最多只能输入20个字节'));
                  // }
                  handleChange({
                    calendarcids: JSON.stringify(
                      calendarcids.map(item => {
                        if (item.begin === o.begin && item.end === o.end) {
                          return {
                            ...item,
                            mark: str,
                          };
                        } else {
                          return item;
                        }
                      }),
                    ),
                  });
                }}
              />
            ) : (
              <span
                className="addMark Hand Gray_75 InlineBlock"
                onClick={() => {
                  setShowInput(i);
                  setTimeout(() => {
                    $ref.current && $ref.current.focus();
                  }, 300);
                }}
              >
                <i className="icon icon-add Font16 mRight5"></i>
                {_l('标签')}
              </span>
            )}
            <Icon
              icon="delete2"
              className={cx('Font16 mRight5 deleted Hand InlineBlock', { option0: calendarcids.length <= 1 })}
              onClick={() => {
                if (calendarcids.length <= 1) {
                  return;
                }
                handleChange({
                  calendarcids: JSON.stringify(calendarcids.filter((item, n) => n !== i)),
                });
              }}
            />
          </WrapCon>
        );
      })}
      {/* 最多只能添加10组 */}
      {calendarcids.length < 10 && (
        <Trigger
          action={['click']}
          popupVisible={visible}
          onPopupVisibleChange={visible => {
            setVisible(visible);
          }}
          popup={
            <Wrap>
              {timeControls
                .filter(o => !calendarIds.includes(o.controlId))
                .map(o => {
                  return (
                    <div
                      className="Hand"
                      onClick={() => {
                        handleChange({
                          calendarcids: JSON.stringify(
                            calendarcids.concat({
                              begin: o.controlId,
                            }),
                          ),
                        });
                        setVisible(false);
                      }}
                    >
                      <i className={cx('icon Gray_9e mRight12 Font16', 'icon-' + getIconByType(o.type))}></i>
                      {o.controlName}
                    </div>
                  );
                })}

              <div
                className="ThemeColor3 Hand"
                onClick={() => {
                  setVisibleAddControlDiaLog(true);
                  setVisible(false);
                }}
              >
                <i className={cx('icon mRight12 Font16 icon-plus')}></i>
                {_l('添加日期字段')}
              </div>
            </Wrap>
          }
          getPopupContainer={() => document.body}
          popupAlign={{
            points: ['tl', 'bl'],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          }}
        >
          <span className="addCalendarcids Hand Gray_75 pBottom5 mTop24 InlineBlock bold">
            <i className="icon icon-add Font16 mRight5"></i>
            {_l('添加一组日期字段')}
          </span>
        </Trigger>
      )}

      {visibleAddControlDiaLog && (
        <AddControlDiaLog
          visible={visibleAddControlDiaLog}
          setVisible={visibleAddControlDiaLog => setVisibleAddControlDiaLog(visibleAddControlDiaLog)}
          // type={15} //默认日期
          addName={_l('日期')} //默认新建日期
          controls={controls}
          onAdd={data => {
            updateWorksheetControls(data);
          }}
          onChange={value => {
            handleChange({
              calendarcids: JSON.stringify(
                calendarcids.concat({
                  begin: value,
                }),
              ),
            });
          }}
          title={_l('添加日期字段')}
          withoutIntro={true}
          enumType={'DATE'}
          worksheetId={worksheetId}
        />
      )}
    </WrapFragment>
  );
}
