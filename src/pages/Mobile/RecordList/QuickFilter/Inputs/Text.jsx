import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { FILTER_CONDITION_TYPE } from 'worksheet/common/WorkSheetFilter/enum';
import TextScanQRCode from './components/TextScanQrCode';

const InputCon = styled.input`
  width: 100%;
  border: none;
  background-color: #f5f5f5;
  height: 36px;
  border-radius: 3px;
  padding: 0 12px;
  font-size: 14px;
`;

const SearchTypeWrap = styled.div`
  margin-top: 10px;
  .searchType {
    border-radius: 13px;
    background: #f5f5f5;
    padding: 0px 16px;
    line-height: 26px;
    .icon {
      margin-right: 2px;
      color: #757575;
    }
    .icon-case {
      font-weight: 600;
    }
    &.active {
      background: #1677ff;
      color: #fff;
      .icon {
        color: #fff;
      }
    }
  }
`;

export default function Text(props) {
  const { viewId, values = [], control, filterType, advancedSetting, onChange } = props;
  const [isExact, setIsExact] = useState(false);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);

  const handleChange = ({ values, newIsExact, newIsCaseSensitive }, options = {}) => {
    onChange(
      {
        values,
        advancedSetting: {
          ...advancedSetting,
          completematch: (_.isUndefined(newIsExact) ? isExact : newIsExact) ? '1' : '0',
          ignorecase: (_.isUndefined(newIsCaseSensitive) ? isCaseSensitive : newIsCaseSensitive) ? '0' : '1',
        },
      },
      options,
    );
  };

  useEffect(() => {
    setIsExact(false);
    setIsCaseSensitive(false);
  }, [viewId]);

  return (
    <div className="controlWrapper">
      <div className="Font14 bold mBottom15 controlName">{control.controlName}</div>
      <div className="flex">
        <div className="flexRow">
          <InputCon
            placeholder={_l('请输入')}
            value={values.join(' ')}
            onChange={e => {
              const value = e.target.value;
              if (filterType === FILTER_CONDITION_TYPE.TEXT_ALLCONTAIN) {
                handleChange({ values: value.split(' ') });
              } else {
                handleChange({ values: [value] });
              }
            }}
          />
          {advancedSetting.allowscan === '1' && (
            <div className="Reative">
              <TextScanQRCode
                projectId={props.projectId}
                scantype="0"
                control={props.control || {}}
                onChange={value => handleChange({ values: [value] })}
              />
            </div>
          )}
        </div>
        <SearchTypeWrap className="flexRow">
          <div
            className={cx('searchType valignWrapper', { active: isExact })}
            onClick={() => {
              setIsExact(!isExact);
              handleChange({ values, newIsExact: !isExact });
            }}
          >
            <i className="icon icon-quote-left Font20" />
            <span className="Font12">{_l('精确匹配')}</span>
          </div>
          <div
            className={cx('searchType valignWrapper mLeft10', { active: isCaseSensitive })}
            onClick={() => {
              setIsCaseSensitive(!isCaseSensitive);
              handleChange({ values, newIsCaseSensitive: !isCaseSensitive });
            }}
          >
            <i className="icon icon-case Font20" />
            <span className="Font12">{_l('区分大小写')}</span>
          </div>
        </SearchTypeWrap>
      </div>
    </div>
  );
}
