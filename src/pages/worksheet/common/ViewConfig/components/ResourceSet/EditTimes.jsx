import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { TimePicker } from 'antd';
import localeEn from 'antd/es/date-picker/locale/en_US';
import localeJaJp from 'antd/es/date-picker/locale/ja_JP';
import localeZhCn from 'antd/es/date-picker/locale/zh_CN';
import localeZhTw from 'antd/es/date-picker/locale/zh_TW';
import cx from 'classnames';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';

const locales = { 'zh-Hans': localeZhCn, 'zh-Hant': localeZhTw, en: localeEn, ja: localeJaJp };
const locale = locales[md.global.Account.lang];

const Wrap = styled.div`
  .add {
    line-height: 36px;
    padding: 0 16px;
    background: #f8f8f8;
    border-radius: 3px;
    color: #1677ff;
    &:hover {
      background: #f5f5f5;
    }
    &.disable {
      cursor: not-allowed;
      &:hover {
        background: #f8f8f8;
      }
    }
  }
  .timeCon {
    .delete {
      opacity: 0;
    }

    &:hover {
      .delete {
        opacity: 1;
        color: #757575;
        &:hover {
          color: red;
        }
      }
    }
  }
  .rangePicker.ant-picker {
    height: 36px;
    line-height: 36px;
  }
`;
export default function (props) {
  const { onClose, onChange } = props;
  const [{ showtime }, setState] = useSetState({
    showtime: [],
  });

  useEffect(() => {
    setState({
      showtime: (props.showtime || '').split('|'),
    });
  }, [props]);

  return (
    <Dialog
      visible
      title={<span className="Bold">{_l('设置工作时间')}</span>}
      width={480}
      onCancel={onClose}
      className="subListSortDialog"
      onOk={() => {
        onChange(showtime.filter(o => o).join('|'));
        onClose();
      }}
    >
      <Wrap className="flexColumn h100">
        {showtime.map((o, n) => {
          return (
            <div className="flexRow timeCon alignItemsCenter">
              <TimePicker.RangePicker
                className={cx('rangePicker w100 borderAll3 flex', { mTop12: n !== 0 })}
                format="HH:mm"
                value={o ? o.split('-').map(item => dayjs(item, 'HH:mm')) : []}
                hourStep={1}
                minuteStep={60}
                popupClassName={`filterDateRangeInputPopup_${n}`}
                onClick={() => {
                  const $arrow = $(`.filterDateRangeInputPopup_${n} .ant-picker-range-arrow`);
                  if ($arrow) {
                    setTimeout(() => {
                      const $arrows = $(`.filterDateRangeInputPopup_${n} .ant-picker-range-arrow`);
                      const arrowLeft = $arrows.css('left');
                      $(`.filterDateRangeInputPopup_${n} .ant-picker-panel-container`).css({
                        marginLeft: arrowLeft,
                      });
                    }, 200);
                  }
                }}
                onChange={(data, timeString) => {
                  if (data && data[0] && data[1] && dayjs(data[1]).diff(dayjs(data[0])) <= 0) {
                    alert(_l('结束时间不能早于或等于开始时间'), 3);
                    return;
                  }
                  setState({
                    showtime: showtime.map((a, i) => {
                      return i === n ? `${timeString[0]}-${timeString[1]}` : a;
                    }),
                  });
                }}
                locale={locale}
                showNow={true}
                allowClear={false}
              />
              <span
                className={cx('delete Hand InlineBlock mTop6 Bold TxtCenter mLeft10')}
                onClick={() => {
                  setState({
                    showtime: showtime.filter((o, i) => i !== n),
                  });
                }}
              >
                <i className="icon icon-trash Font16"></i>
              </span>
            </div>
          );
        })}
        <div className="">
          <span
            className={cx('add Hand InlineBlock mTop12 Bold TxtCenter')}
            onClick={() => {
              setState({
                showtime: showtime.concat(''),
              });
            }}
          >
            <i className="icon icon-plus Font16 mRight5"></i>
            {props.addTxt || _l('时间段')}
          </span>
        </div>
      </Wrap>
    </Dialog>
  );
}
