import React, { Fragment, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, Dialog, TagTextarea } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import projectSettingAjax from 'src/api/projectSetting';
import { ControlTag, SelectFieldsWrap } from 'src/pages/widgetConfig/styled/index';
import Config from '../../config';

const WaterMarkTextarea = styled(TagTextarea)`
  .CodeMirror-placeholder {
    color: var(--color-text-secondary) !important;
    padding: 0 10px !important;
  }
`;

const FooterBtns = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  .enableBtn {
    background: var(--color-success);
    &:hover {
      background: var(--color-success-hover);
    }
  }
  .closeBtn {
    border-color: var(--color-error);
    color: var(--color-error);
    &:hover {
      background: var(--color-error);
    }
  }
`;

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
  const { enabledWatermarkTxt = '', visible, onClose, enabledWatermark, updateEnabledWatermark } = props;

  const [value, setValue] = useState(enabledWatermarkTxt);
  const [selectVisible, setSelectVisible] = useState(false);
  const $tagTextarea = useRef(null);
  const [requestLoading, setRequestLoading] = useState(false);

  const onClick = item => {
    $tagTextarea.current.insertColumnTag(item.controlId);
  };

  const handleOk = () => {
    setRequestLoading(true);
    projectSettingAjax
      .setEnabledWatermarkTxt({ projectId: Config.projectId, enabledWatermarkTxt: value })
      .then(res => {
        res && setTimeout(() => location.reload(), 500);
      })
      .finally(() => setRequestLoading(false));
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

  const renderFooter = () => {
    const setEnabledWatermark = () => {
      setRequestLoading(true);
      projectSettingAjax
        .setEnabledWatermark({ projectId: Config.projectId, enabledWatermark: !enabledWatermark })
        .then(res => {
          if (res) {
            updateEnabledWatermark(!enabledWatermark);
            if (!enabledWatermark) {
              handleOk();
            } else {
              onClose();
              setRequestLoading(false);
              setTimeout(() => location.reload(), 500);
            }
          }
        });
    };

    return (
      <FooterBtns>
        {enabledWatermark ? (
          <Fragment>
            <Button type="ghost" className="closeBtn" onClick={setEnabledWatermark} disabled={requestLoading}>
              {_l('关闭此功能')}
            </Button>
            <Button type="primary" onClick={handleOk} disabled={requestLoading}>
              {_l('更新设置')}
            </Button>
          </Fragment>
        ) : (
          <Button type="primary" className="enableBtn" onClick={setEnabledWatermark} disabled={requestLoading}>
            {_l('启用')}
          </Button>
        )}
      </FooterBtns>
    );
  };

  return (
    <Dialog width={550} visible={visible} title={_l('屏幕水印')} footer={renderFooter()} onCancel={onClose}>
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
              const originControl = _.find(CONTROLS, item => item.controlId === id);
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

export default WaterMarkSettingDialog;
