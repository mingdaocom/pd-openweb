import React, { useState, useEffect, useRef, Fragment } from 'react';
import { TagTextarea, Tooltip } from 'ming-ui';
import { includes, get, find } from 'lodash';
import cx from 'classnames';
import { SettingItem, SelectFieldsWrap, ControlTag } from '../../styled';
import { SYSTEM_CONTROL, ROW_ID_CONTROL } from '../../config/widget';
import SelectControl from './SelectControl';
import { getConcatenateControls } from '../../util/data';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';

export default function Concatenate({ data, onChange, allControls }) {
  const $tagtextarea = useRef(null);
  const { controlId, dataSource } = data;
  const [visible, setVisible] = useState(false);
  const availableControls = [...SYSTEM_CONTROL, ...ROW_ID_CONTROL, ...getConcatenateControls(allControls, data)];
  useEffect(() => {
    $tagtextarea.current.setValue(dataSource || '');
  }, [controlId]);
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('选择字段')}</div>
        <div className="settingContent">
          <TagTextarea
            defaultValue={dataSource}
            maxHeight={140}
            getRef={tagtextarea => {
              $tagtextarea.current = tagtextarea;
            }}
            renderTag={(id, options) => {
              const originControl = find(availableControls, item => item.controlId === id);
              const controlName = get(originControl, 'controlName');
              const invalidError =
                originControl && originControl.type === 30 && (originControl.strDefault || '')[0] === '1';
              return (
                <Tooltip text={<span>{_l('ID: %0', id)}</span>} popupPlacement="bottom" disable={controlName}>
                  <ControlTag className={cx({ invalid: !controlName || invalidError, Hand: !controlName })}>
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
