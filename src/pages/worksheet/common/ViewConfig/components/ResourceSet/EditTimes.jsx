import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import moment from 'moment';
import styled from 'styled-components';
import { Modal, TimePicker } from 'ming-ui/antd-components';

const Wrap = styled.div`
  .add {
    line-height: 36px;
    padding: 0 16px;
    background: var(--color-background-secondary);
    border-radius: 3px;
    color: var(--color-primary);
    &:hover {
      background: var(--color-background-hover);
    }
    &.disable {
      cursor: not-allowed;
      &:hover {
        background: var(--color-background-hover);
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
        color: var(--color-text-secondary);
        &:hover {
          color: var(--color-error);
        }
      }
    }
  }
  .rangePicker.hap-picker {
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
    <Modal
      open
      mask={{ closable: true }}
      keyboard
      title={<span className="Bold">{_l('设置工作时间')}</span>}
      width={480}
      onCancel={onClose}
      rootClassName="subListSortDialog"
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
                value={o ? o.split('-') : []}
                hourStep={1}
                minuteStep={60}
                classNames={{ popup: { root: `filterDateRangeInputPopup_${n}` } }}
                onClick={() => {
                  const $arrow = $(`.filterDateRangeInputPopup_${n} .hap-picker-range-arrow`);

                  if ($arrow) {
                    setTimeout(() => {
                      const $arrows = $(`.filterDateRangeInputPopup_${n} .hap-picker-range-arrow`);
                      const arrowLeft = $arrows.css('left');
                      $(`.filterDateRangeInputPopup_${n} .hap-picker-panel-container`).css({
                        marginLeft: arrowLeft,
                      });
                    }, 200);
                  }
                }}
                onChange={(data, timeString) => {
                  if (data && data[0] && data[1] && moment(data[1]).diff(moment(data[0])) <= 0) {
                    alert(_l('结束时间不能早于或等于开始时间'), 3);
                    return;
                  }

                  setState({
                    showtime: showtime.map((a, i) => {
                      return i === n ? `${timeString[0]}-${timeString[1]}` : a;
                    }),
                  });
                }}
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
    </Modal>
  );
}
