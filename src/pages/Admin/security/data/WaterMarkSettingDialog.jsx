import React, { useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Dialog, TagTextarea, Tooltip } from 'ming-ui';
import projectSettingAjax from 'src/api/projectSetting';
import { ControlTag, SelectFieldsWrap } from 'src/pages/widgetConfig/styled/index';
import Config from '../../config';

const CONTROLS = [
  {
    controlId: 'fullname',
    controlName: _l('姓名'),
  },
  {
    controlId: 'mobilePhone',
    controlName: _l('手机'),
  },
  {
    controlId: 'email',
    controlName: _l('邮箱'),
  },
  {
    controlId: 'companyName',
    controlName: _l('组织名称'),
  },
];

function WaterMarkSettingDialog(props) {
  const { defaultValue = '', visible, onClose } = props;

  const [value, setValue] = useState(defaultValue);
  const [selectVisible, setSelectVisible] = useState(false);
  const $tagTextarea = useRef(null);

  const onClick = item => {
    $tagTextarea.current.insertColumnTag(item.controlId);
  };

  const handleOk = () => {
    projectSettingAjax
      .setEnabledWatermarkTxt({
        projectId: Config.projectId,
        enabledWatermarkTxt: value,
      })
      .then(res => {
        if (res) {
          setTimeout(() => {
            location.reload();
          }, 500);
        }
      });
    onClose();
  };

  const renderSelect = () => {
    return (
      <SelectFieldsWrap>
        <div className="fieldsWrap" style={{ width: '430px' }}>
          <ul className="fieldList">
            {CONTROLS.map(item => (
              <li onClick={() => onClick(item)} style={{ maxWidth: '100%' }}>
                {item.controlName}
              </li>
            ))}
          </ul>
        </div>
      </SelectFieldsWrap>
    );
  };

  return (
    <Dialog visible={visible} title={_l('设置水印文字')} onOk={handleOk} onCancel={onClose}>
      <div>
        <div className="Font13 Gray_75 mBottom18">{_l('建议文字在20个字符以内，超出可能显示不全')}</div>
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
          <TagTextarea
            defaultValue={value}
            maxHeight={140}
            getRef={tagTextarea => {
              $tagTextarea.current = tagTextarea;
            }}
            renderTag={id => {
              const originControl = _.find(CONTROLS, item => item.controlId === id);
              const controlName = _.get(originControl, 'controlName');
              return (
                <Tooltip text={<span>{_l('ID: %0', id)}</span>} popupPlacement="bottom" disable={controlName}>
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

export default WaterMarkSettingDialog;
