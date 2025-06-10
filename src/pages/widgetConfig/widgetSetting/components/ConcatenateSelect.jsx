import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import { find, get, includes } from 'lodash';
import { TagTextarea, Tooltip } from 'ming-ui';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import { ROW_ID_CONTROL, SYSTEM_CONTROL } from '../../config/widget';
import { ControlTag, SelectFieldsWrap, SettingItem } from '../../styled';
import { getConcatenateControls } from '../../util/data';
import SelectControl from './SelectControl';

export default function Concatenate({
  data,
  onChange,
  allControls,
  hideTitle = false,
  classNames,
  withSYS = true,
  placeholder,
}) {
  const $tagtextarea = useRef(null);
  const { controlId, dataSource } = data;
  const [visible, setVisible] = useState(false);
  const availableControls = !withSYS
    ? [...getConcatenateControls(allControls, data)]
    : [...SYSTEM_CONTROL, ...ROW_ID_CONTROL, ...getConcatenateControls(allControls, data)];
  useEffect(() => {
    $tagtextarea.current.setValue(dataSource || '');
  }, [controlId]);
  return (
    <Fragment>
      <SettingItem className={classNames}>
        {!hideTitle && <div className="settingItemTitle">{_l('选择字段')}</div>}
        <div className="settingContent">
          <TagTextarea
            defaultValue={dataSource}
            maxHeight={140}
            getRef={tagtextarea => {
              $tagtextarea.current = tagtextarea;
            }}
            placeholder={placeholder}
            renderTag={(id, options) => {
              const originControl = find(availableControls, item => item.controlId === id);
              const controlName = get(originControl, 'controlName');
              const invalidError =
                originControl && originControl.type === 30 && (originControl.strDefault || '')[0] === '1';
              return (
                <Tooltip text={<span>{_l('ID: %0', id)}</span>} popupPlacement="bottom" disable={controlName}>
                  <ControlTag
                    className={cx('WordBreak', { invalid: !controlName || invalidError, Hand: !controlName })}
                  >
                    {controlName ? (invalidError ? _l('%0(无效类型)', controlName) : controlName) : _l('字段已删除')}
                  </ControlTag>
                </Tooltip>
              );
            }}
            onChange={(err, value) => {
              if (!err) {
                onChange({ dataSource: value });
              }
            }}
            onFocus={() => {
              setVisible(true);
            }}
          />
          {visible && (
            <SelectControl
              className={'isolate'}
              list={filterOnlyShowField(availableControls)}
              onClickAway={() => setVisible(false)}
              onClick={item => {
                $tagtextarea.current.insertColumnTag(item.controlId);
              }}
            />
          )}
        </div>
      </SettingItem>
    </Fragment>
  );
}
