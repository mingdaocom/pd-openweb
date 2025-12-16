import React, { useCallback, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { CityPicker, Icon, Input } from 'ming-ui';
import { getAreaHintText } from 'src/pages/widgetConfig/util/setting';
import { useWidgetEvent } from '../../../core/useFormEventManager';

export default function AreaWidgets(props) {
  const {
    disabled,
    value,
    onChange,
    advancedSetting = {},
    recordId,
    controlId,
    enumDefault2,
    projectId,
    formItemId,
    createEventHandler = () => {},
  } = props;

  const [search, setSearch] = useState(undefined);
  const [keywords, setKeywords] = useState('');
  const [visible, setVisible] = useState(false);
  const inputRef = useRef(null);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      switch (triggerType) {
        case 'trigger_tab_enter':
          inputRef.current && inputRef.current.focus();
          break;
        case 'trigger_tab_leave':
          setVisible(false);
          inputRef.current && inputRef.current.blur();
          break;
        case 'Enter':
          setVisible(true);
          break;
        default:
          break;
      }
    }, []),
  );

  const handleChange = data => {
    const { anylevel } = advancedSetting;
    const last = _.last(data);
    if (search) {
      setSearch(undefined);
      setKeywords('');
    }

    const index = last.path.split('/').length;

    // 必须选择最后一级
    if (anylevel === '1' && !last.last && enumDefault2 < index) {
      return;
    }

    onChange(JSON.stringify({ code: last.id, name: last.path }));
  };

  const onFetchData = useCallback(
    _.debounce(keywords => {
      setKeywords(keywords);
    }, 500),
    [],
  );

  const { anylevel, chooserange = 'CN', commcountries } = advancedSetting || {};

  const city = safeParse(value || '{}');

  return (
    <CityPicker
      id={`customFields-cityPicker-${controlId}-${recordId}`}
      search={keywords}
      defaultValue={city.name || ''}
      selectCode={city.code || ''}
      popupVisible={visible}
      level={enumDefault2}
      chooserange={chooserange}
      commcountries={commcountries}
      disabled={disabled}
      mustLast={anylevel === '1'}
      callback={handleChange}
      projectId={projectId}
      destroyPopupOnHide={true}
      showConfirmBtn={anylevel !== '1'}
      onClear={() => {
        onChange('');
        if (search) {
          setSearch('');
          setKeywords('');
        }
      }}
      handleVisible={value => {
        setVisible(value);
      }}
    >
      <button
        type="button"
        className={cx('customFormControlBox customFormButton flexRow', {
          controlDisabled: disabled,
        })}
        disabled={disabled}
      >
        <Input
          manualRef={inputRef}
          className={cx('flex minWidth0 mRight20 ellipsis CityPicker-input-textCon')}
          placeholder={city.name || getAreaHintText(props)}
          value={visible ? search || '' : city.name || ''}
          title={city.name || ''}
          onChange={value => {
            setSearch(value);
            onFetchData(value);
          }}
          onKeyDown={createEventHandler}
          disabled={disabled}
          readOnly={disabled}
        />
        {!disabled && (
          <>
            {!_.isEmpty(city) && (
              <Icon
                icon="workflow_cancel"
                className="Font12 Gray_9e customFormButtoDel"
                onClick={e => {
                  onChange('');
                  setSearch(undefined);
                  setKeywords('');
                  e.stopPropagation();
                }}
              />
            )}
            <Icon icon="map" className="Font16 Gray_bd" />
          </>
        )}
      </button>
    </CityPicker>
  );
}

AreaWidgets.propTypes = {
  from: PropTypes.number,
  type: PropTypes.number,
  disabled: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
};
