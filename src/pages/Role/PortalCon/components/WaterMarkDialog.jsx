import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dialog, TagTextarea } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { ControlTag, SelectFieldsWrap } from 'src/pages/widgetConfig/styled/index';

const WaterMarkTextarea = styled(TagTextarea)`
  .CodeMirror-placeholder {
    color: var(--color-text-secondary) !important;
    padding: 0 10px !important;
  }
`;

// 门户水印仅支持：姓名、手机号、邮箱
const DEFAULT_CONTROLS = [
  { controlId: 'fullname', controlName: _l('姓名') },
  { controlId: 'mobilePhone', controlName: _l('手机号') },
  { controlId: 'email', controlName: _l('邮箱') },
];

function WaterMarkDialog(props) {
  const { defaultValue = '', visible, onClose, onSave, controls = DEFAULT_CONTROLS } = props;
  const [value, setValue] = useState(defaultValue);
  const [selectVisible, setSelectVisible] = useState(false);
  const $tagTextarea = useRef(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleOk = () => {
    onSave(value);
    onClose();
  };

  const insertTag = item => {
    $tagTextarea.current?.insertColumnTag(item.controlId);
  };

  const renderSelect = () => (
    <SelectFieldsWrap>
      <div className="fieldsWrap" style={{ width: '430px' }}>
        <ul className="fieldList">
          {controls.map(item => (
            <li key={item.controlId} onClick={() => insertTag(item)} style={{ maxWidth: '100%' }}>
              {item.controlName}
            </li>
          ))}
        </ul>
      </div>
    </SelectFieldsWrap>
  );

  return (
    <Dialog width={550} visible={visible} title={_l('屏幕水印')} onOk={handleOk} onCancel={onClose}>
      <div>
        <div className="bold mBottom8">{_l('自定义水印文字')}</div>
        <div className="Font13 textSecondary mBottom18">
          {_l('为空时显示默认水印文字（姓名+手机或邮箱）。可自定义，建议文字在20个字符以内，超出可能显示不全')}
        </div>
        <Trigger
          popupVisible={selectVisible}
          onPopupVisibleChange={visible => setSelectVisible(visible)}
          action={['click']}
          popup={renderSelect()}
          popupAlign={{
            points: ['tl', 'bl'],
            offset: [0, 0],
            overflow: { adjustX: true, adjustY: true },
          }}
        >
          <WaterMarkTextarea
            className="waterMarkTextarea"
            defaultValue={value}
            placeholder={_l('姓名+手机或邮箱')}
            maxHeight={140}
            getRef={tagTextarea => {
              $tagTextarea.current = tagTextarea;
            }}
            renderTag={id => {
              const originControl = _.find(controls, item => item.controlId === id);
              const controlName = _.get(originControl, 'controlName');
              return (
                <Tooltip title={controlName ? '' : <span>{_l('ID: %0', id)}</span>} placement="bottom">
                  <ControlTag className={cx({ invalid: !controlName, Hand: !controlName })}>{controlName}</ControlTag>
                </Tooltip>
              );
            }}
            onChange={(err, value) => {
              if (!err) {
                setValue(value);
              }
            }}
            onFocus={() => setSelectVisible(true)}
          />
        </Trigger>
      </div>
    </Dialog>
  );
}

export default WaterMarkDialog;
