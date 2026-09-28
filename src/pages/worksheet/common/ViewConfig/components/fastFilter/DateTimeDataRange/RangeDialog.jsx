import React, { useState } from 'react';
import { useKey, useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Modal } from 'ming-ui/antd-components';
import { getDefaultDateRange, getShowtypeByDateRangeType } from 'src/utils/domain/worksheet/fastFilter';
import {
  DATE_TYPE,
  DATE_TYPE_ALL,
  DATE_TYPE_FUTURE,
  DATE_TYPE_PASS,
} from 'src/utils/domain/worksheet/fastFilterConfig';

export default function (props) {
  const { onClose, showType, dateRangeType, onChange = () => {} } = props;

  const [{ daterange }, setState] = useSetState({
    daterange: props.daterange,
  });
  const [startIndex, setStartIndex] = useState(null);

  const defaultRange = getDefaultDateRange(
    dateRangeType === 0 || !dateRangeType ? showType : getShowtypeByDateRangeType(dateRangeType),
  );
  let isAllRange = daterange.length >= defaultRange.length;

  useKey(
    'Shift',
    () => {
      setStartIndex(null); // 当释放 Shift 键时，重置起始索引
    },
    { event: 'keyup' },
    [],
  );
  return (
    <Modal
      open
      title={_l('选择动态时间范围')}
      width={860}
      onCancel={onClose}
      className="subListSortDialog"
      onOk={() => {
        onChange({ daterange: JSON.stringify(daterange) });
        onClose();
      }}
    >
      <div className="h100">
        <React.Fragment key={'all'}>
          <Checkbox
            className="checkBox mBottom10"
            checked={isAllRange}
            onChange={() => {
              let newValue = daterange;
              newValue = !isAllRange ? defaultRange : [];
              setState({
                daterange: newValue,
              });
            }}
          >
            {_l('全选')}
          </Checkbox>
          <span
            className={cx(
              ' mLeft20 TxtTop',
              DATE_TYPE_PASS.filter(o => defaultRange.includes(o)).length > 0
                ? 'Hand colorPrimary'
                : 'textDisabled disabledBtn',
            )}
            onClick={() => {
              setState({ daterange: DATE_TYPE_PASS.filter(o => defaultRange.includes(o)) });
            }}
          >
            {_l('选择所有过去时间')}
          </span>
          <span
            className={cx(
              'mLeft20 TxtTop',
              DATE_TYPE_FUTURE.filter(o => defaultRange.includes(o)).length > 0
                ? 'Hand colorPrimary'
                : 'textDisabled disabledBtn',
            )}
            onClick={() => {
              setState({ daterange: DATE_TYPE_FUTURE.filter(o => defaultRange.includes(o)) });
            }}
          >
            {_l('选择所有将来时间')}
          </span>
        </React.Fragment>
        <div className="flexRow">
          {DATE_TYPE.map((it, i) => {
            // const aa = it.filter(o => defaultRange.includes(o.value));
            // if (aa.length <= 0) return '';
            return (
              <div className="flex flexColumn" key={`${i}_rangeC`}>
                {it.map(item => {
                  // if (!defaultRange.includes(item.value)) return '';
                  return (
                    <React.Fragment>
                      <Checkbox
                        className="checkBox mBottom10 noSelect"
                        disabled={!defaultRange.includes(item.value)}
                        key={`${i}_rangeItem`}
                        checked={(isAllRange || daterange.includes(item.value)) && defaultRange.includes(item.value)}
                        onChange={event => {
                          if (event.nativeEvent.shiftKey && startIndex !== null) {
                            // 计算选中范围
                            function sliceBetweenValues(arr, startValue, endValue) {
                              const startIndex = _.findIndex(arr, value => value === startValue);
                              const endIndex = _.findLastIndex(arr, value => value === endValue);
                              return arr.slice(startIndex, endIndex + 1);
                            }

                            const newList = sliceBetweenValues(DATE_TYPE_ALL, startIndex, item.value);
                            setState({
                              daterange: _.uniq([...daterange, ...newList].filter(o => defaultRange.includes(o))),
                            });
                            setStartIndex(null); // 重置起始索引
                          } else {
                            setStartIndex(item.value);
                            let newValue = daterange;

                            if (newValue.includes(item.value)) {
                              newValue = newValue.filter(o => o !== item.value);
                            } else {
                              newValue = newValue.concat(item.value);
                            }

                            setState({
                              daterange: newValue,
                            });
                          }
                        }}
                      >
                        {item.text}
                      </Checkbox>
                    </React.Fragment>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
