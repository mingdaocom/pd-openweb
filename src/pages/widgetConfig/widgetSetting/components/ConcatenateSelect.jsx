import React, { useState, useEffect, useRef, Fragment } from 'react';
import { TagTextarea } from 'ming-ui';
import { includes, get, find } from 'lodash';
import cx from 'classnames';
import { SettingItem, SelectFieldsWrap, ControlTag } from '../../styled';
import { SYSTEM_CONTROL } from '../../config/widget';
import SelectControl from './SelectControl';
import { getConcatenateControls } from '../../util/data';

export default function Concatenate({ data, onChange, allControls }) {
  const $tagtextarea = useRef(null);
  const { controlId, dataSource } = data;
  const [visible, setVisible] = useState(false);
  const [searchValue, setValue] = useState('');
  const availableControls = getConcatenateControls(allControls, data).concat(SYSTEM_CONTROL);
  const filteredControls = availableControls.filter(item => includes(item.controlName, searchValue));
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
              const controlName = get(
                find(availableControls, item => item.controlId === id),
                'controlName',
              );
              return <ControlTag className={cx({ invalid: !controlName })}>{controlName || _l('已删除')}</ControlTag>;
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
              searchValue={searchValue}
              onSearchChange={setValue}
              list={filteredControls}
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
