import React, { useState } from 'react';
import { useUpdateEffect } from 'react-use';
import cx from 'classnames';
import _, { isUndefined } from 'lodash';
import { arrayOf, func, number, shape, string } from 'prop-types';
import { Button, Input, Space, Tooltip } from 'ming-ui/antd-components';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import { FILTER_CONDITION_TYPE } from 'src/utils/domain/worksheet/filterConstants';
import PasteDialog from '../PasteDialog';

function getPlaceHolder(filterType, limit) {
  if (filterType === FILTER_CONDITION_TYPE.EQ) {
    return '=';
  } else if (filterType === FILTER_CONDITION_TYPE.START) {
    return limit ? _l('输入开头%0位后搜索', limit) : _l('搜索开头');
  } else if (filterType === FILTER_CONDITION_TYPE.END) {
    return limit ? _l('输入结尾%0位后搜索', limit) : _l('搜索结尾');
  } else {
    return _l('搜索');
  }
}

export default function Text(props) {
  const {
    showTextAdvanced,
    viewId,
    control = {},
    values = [],
    filterType,
    advancedSetting,
    onChange = () => {},
    onEnterDown = () => {},
  } = props;
  const [tempValue, setTempValue] = useState();
  const [isFocusing, setIsFocusing] = useState(false);
  const [isMultiple, setIsMultiple] = useState(false);
  const [valueForMultiple, setValueForMultiple] = useState();
  const [pasteDialogVisible, setPasteDialogVisible] = useState();
  const [isExact, setIsExact] = useState(false);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [prevViewId, setPrevViewId] = useState(viewId);

  if (prevViewId !== viewId) {
    setPrevViewId(viewId);
    setIsExact(false);
    setIsCaseSensitive(false);
  }

  const limit = advancedSetting.limit && Number(advancedSetting.limit);
  const needCheckLength =
    _.includes([FILTER_CONDITION_TYPE.START, FILTER_CONDITION_TYPE.END], filterType) &&
    _.isNumber(limit) &&
    !_.isNaN(limit);

  const handleChange = ({ values, newIsExact, newIsCaseSensitive }, options = {}) => {
    onChange(
      {
        values,
        advancedSetting: {
          ...advancedSetting,
          completematch: (isUndefined(newIsExact) ? isExact : newIsExact) ? '1' : '0',
          ignorecase: (isUndefined(newIsCaseSensitive) ? isCaseSensitive : newIsCaseSensitive) ? '0' : '1',
        },
      },
      options,
    );
  };

  const handleClear = () => {
    setIsMultiple(false);
    setValueForMultiple('');
    onChange({ values: [] });
  };

  useUpdateEffect(() => {
    if (!values.length) {
      setIsMultiple(false);
      setValueForMultiple('');
      setTempValue('');
    }
  }, [values]);
  return (
    <>
      <Space.Compact block>
        <Input
          className="flex"
          allowClear
          placeholder={getPlaceHolder(filterType, advancedSetting.limit)}
          value={
            isMultiple ? _l('%0 个关键词', values.length) : needCheckLength && tempValue ? tempValue : values.join(' ')
          }
          suffix={
            showTextAdvanced && (isFocusing || isExact || isCaseSensitive || isMultiple) ? (
              <>
                <Tooltip title={_l('精确匹配')}>
                  <i
                    className={cx('icon icon-quote-left Font18 pointer hoverColorPrimary', {
                      colorPrimary: isExact,
                      textTertiary: !isExact,
                    })}
                    onMouseDown={() => {
                      setIsExact(!isExact);
                      handleChange({ values, newIsExact: !isExact });
                    }}
                  />
                </Tooltip>
                {!_.includes([FILTER_CONDITION_TYPE.EQ, FILTER_CONDITION_TYPE.NE], filterType) && (
                  <Tooltip title={_l('区分大小写')}>
                    <i
                      className={cx('icon icon-case Font18 pointer hoverColorPrimary', {
                        colorPrimary: isCaseSensitive,
                        textTertiary: !isCaseSensitive,
                      })}
                      onMouseDown={() => {
                        setIsCaseSensitive(!isCaseSensitive);
                        handleChange({ values, newIsCaseSensitive: !isCaseSensitive });
                      }}
                    />
                  </Tooltip>
                )}
              </>
            ) : null
          }
          onKeyDown={e => !isMultiple && e.keyCode === 13 && onEnterDown()}
          onClick={() => isMultiple && setPasteDialogVisible(true)}
          onFocus={() => setIsFocusing(true)}
          onBlur={() => setIsFocusing(false)}
          onClear={handleClear}
          onChange={event => {
            let newValue = event.target.value;

            if (event.type === 'click') {
              return;
            }

            if (isMultiple) {
              return;
            }

            setIsMultiple(false);
            if (needCheckLength) {
              setTempValue(newValue);
              if (newValue.length < limit && newValue.length > 0) {
                if (values.join('') !== '') {
                  newValue = '';
                } else {
                  return;
                }
              }
            }

            if (
              _.includes(
                [
                  WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 电话号码
                  WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机号码
                ],
                control.type,
              )
            ) {
              handleChange({ values: [newValue.replace(/ /g, '')] });
            } else if (filterType === FILTER_CONDITION_TYPE.TEXT_ALLCONTAIN) {
              handleChange({ values: newValue.split(' ') });
            } else {
              handleChange({
                values: [newValue],
              });
            }
          }}
          onPaste={e => {
            const pasteValue = (e.clipboardData || window.clipboardData).getData('text');

            if (pasteValue && /\n/.test(pasteValue)) {
              setValueForMultiple(pasteValue);
              setPasteDialogVisible(true);
              e.preventDefault();
            }
          }}
        />
        <Tooltip title={_l('添加多个搜索关键词')}>
          <Button
            icon={<i className={cx('icon icon-lookup Font20', { colorPrimary: isMultiple })} />}
            aria-label={_l('添加多个搜索关键词')}
            onClick={() => setPasteDialogVisible(true)}
          />
        </Tooltip>
      </Space.Compact>
      {pasteDialogVisible && (
        <PasteDialog
          keywords={valueForMultiple}
          onClose={() => setPasteDialogVisible(false)}
          onChange={v => {
            const newValues = v
              .split('\n')
              .map(v => v.trim())
              .filter(_.identity);
            setValueForMultiple(v);
            setIsMultiple(!!newValues.length);
            handleChange({ values: newValues }, { forceUpdate: true });
          }}
        />
      )}
    </>
  );
}

Text.propTypes = {
  control: shape({}),
  filterType: number,
  values: arrayOf(string),
  onChange: func,
};
