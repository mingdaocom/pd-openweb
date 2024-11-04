import React from 'react';
import cx from 'classnames';
import { Icon, Checkbox, Radio, Tooltip } from 'ming-ui';
import { sortByShowControls, isRelation } from '../../util';
import { UN_PRINT_CONTROL, SYST_PRINT, PRINT_FILE_OPTIONS } from '../../config';
import _ from 'lodash';

const ControlsSettingConfig = [
  {
    label: _l('系统字段'),
    key: 'sys',
  },
  {
    label: _l('表单字段'),
    key: 'form',
  },
  {
    label: _l('手写签名'),
    key: 'signature',
  },
];

export default function ControlsSetting(props) {
  const {
    hide,
    systemControl = [],
    controls,
    signature,
    printData,
    setData,
    handChange,
    getIsChecked,
    changeAdvanceSettings,
  } = props;
  const { orderNumber, receiveControls = [], advanceSettings = [] } = printData;
  const fileStyle = safeParse(
    _.get(
      advanceSettings.find(l => l.key === 'atta_style'),
      'value',
    ),
  );

  const handleChecked = it => {
    if (SYST_PRINT[it.controlId]) {
      const checked = !printData[SYST_PRINT[it.controlId]];
      handChange({
        [SYST_PRINT[it.controlId]]: checked,
        systemControl: systemControl.map(item => {
          return {
            ...item,
            checked: it.controlId !== item.controlId ? item.checked : checked,
          };
        }),
      });
    } else {
      setData(it, 'checked', isRelation(it));
    }
  };

  const getRelationControlsShowPart = it => {
    if (it.checked) {
      let orderNumberCheck = (orderNumber.find(o => o.receiveControlId === it.controlId) || []).checked;
      let controls =
        it.showControls.length > 0
          ? (it.relationControls || []).filter(o => it.showControls.includes(o.controlId))
          : [];
      let list = controls.filter(o => o.checked);
      let isCheckPark = list.length < controls.length;
      return isCheckPark ? !!orderNumberCheck || list.length !== 0 : !orderNumberCheck;
    }
  };

  const setReceiveControls = (o, checked) => {
    let isChecked = checked;
    const controls =
      o.showControls.length > 0 ? o.relationControls.filter(it => o.showControls.includes(it.controlId)) : [];

    if (controls.map(o => o.checked).includes(true)) {
      isChecked = true;
    }

    return receiveControls.map(item => {
      return {
        ...item,
        checked: item.controlId === o.controlId ? isChecked : item.checked,
      };
    });
  };

  const onClickLiRelation = ({ it, controls, orderNumberList, relationControlId }) => {
    let isChecked = false;
    const dataOtherRelation = controls.map(controlItem => {
      const checked = controlItem.controlId === it.controlId ? !it.checked : controlItem.checked;

      if (checked || orderNumberList.checked) {
        isChecked = true;
      }

      return {
        ...controlItem,
        checked: checked,
      };
    });

    const dataOther = receiveControls.map(item => {
      if (item.controlId === relationControlId) {
        return {
          ...item,
          checked: isChecked,
          relationControls: dataOtherRelation,
        };
      } else {
        return item;
      }
    });

    handChange({
      receiveControls: dataOther,
    });
  };

  const handleFileRadio = (controlId, value) => {
    fileStyle[controlId] = value;
    changeAdvanceSettings({
      key: 'atta_style',
      value: JSON.stringify(fileStyle),
    });
  };

  const renderFileRadio = id => {
    return (
      <div className="mTop12 mLeft26">
        {PRINT_FILE_OPTIONS.map((l, i) => (
          <span key={`fileRadioGroup-${id}-${i}`} className="mRight24 InlineFlex alignItemsCenter">
            <Radio
              className="fileRadio"
              text={l.text}
              size="small"
              checked={(fileStyle[id] || '0') === l.value}
              onClick={() => handleFileRadio(id, l.value)}
            />
            {l.tips && (
              <Tooltip text={l.tips}>
                <Icon icon="help" className="Gray_9d hoverText Font16" />
              </Tooltip>
            )}
          </span>
        ))}
      </div>
    );
  };

  const renderLi = list => {
    let listData = (list || []).filter(o => !UN_PRINT_CONTROL.includes(o.type));

    return (
      <React.Fragment>
        {listData.map(it => {
          let isRelationControls = isRelation(it);
          let isClearSelected = isRelationControls && getRelationControlsShowPart(it);
          let sectionLi = it.type === 52 ? controls.filter(l => l.sectionId === it.controlId) : [];
          let isChecked = !isRelationControls ? it.checked : getIsChecked(it);

          if (it.type === 52 && sectionLi.length !== 0) {
            isChecked = sectionLi.some(l => l.checked);
          }

          return (
            <div
              key={`printSideNav-${it.controlId}`}
              className={cx('Relative', {
                mLeft25: !!it.sectionId,
              })}
            >
              <Checkbox
                checked={isChecked}
                clearselected={isClearSelected}
                key={it.controlId}
                className="mTop12"
                onClick={() => handleChecked(it)}
                text={it.controlName || _l('未命名')}
              />
              {(isRelationControls || (it.type === 52 && sectionLi.length)) && (
                <div className={cx({ mLeft24: it.type !== 52 })}>
                  <Icon
                    icon={it.expand ? 'expand_less' : 'expand_more'}
                    className="Font18 moreList Hand TxtCenter TxtBottom"
                    onClick={() => setData(it, 'expand')}
                  />
                  {it.expand && isRelationControls && renderLiRelation(it)}
                  {it.expand && it.type === 52 && <div className="Relative sectionLiCon">{renderLi(sectionLi)}</div>}
                </div>
              )}
              {it.type === 14 && isChecked && renderFileRadio(it.controlId)}
            </div>
          );
        })}
      </React.Fragment>
    );
  };

  const renderLiRelation = list => {
    let liControls = [];

    if (list.showControls.length > 0) {
      let relationsList = list.relationsData || {};
      //controls type数据以relations为准
      liControls = sortByShowControls(list).map(it => {
        let { template = [] } = relationsList;
        const _controls = _.get(template, 'controls') || [];
        return {
          ...it,
          sourceControlType:
            _controls.length > 0
              ? _.get(_controls.find(o => o.controlId === it.controlId) || {}, 'sourceControlType')
              : it.sourceControlType,
        };
      });
    }

    //关联表富文本不不显示 分割线 ,OCR ,条码不显示
    liControls = liControls.filter(
      it => ![...UN_PRINT_CONTROL, 41, 22, 47].includes(it.type) && !(it.type === 30 && it.sourceControlType === 41),
    );
    let orderNumberList = orderNumber.find(it => it.receiveControlId === list.controlId) || [];

    return (
      <React.Fragment>
        <Checkbox
          checked={orderNumberList.checked}
          key={`${orderNumberList.receiveControlId}-0`}
          className="mTop12"
          onClick={() =>
            handChange({
              receiveControls: setReceiveControls(list, !orderNumberList.checked),
              orderNumber: orderNumber.map(it => {
                return {
                  ...it,
                  checked: it.receiveControlId === list.controlId ? !it.checked : it.checked,
                };
              }),
            })
          }
          text={_l('序号')}
        />
        {liControls.map(it => {
          return (
            <React.Fragment>
              <Checkbox
                checked={it.checked}
                key={it.controlId}
                className="mTop12"
                onClick={() =>
                  onClickLiRelation({ it, controls: liControls, orderNumberList, relationControlId: list.controlId })
                }
                text={it.controlName || _l('未命名')}
              />
              {it.type === 14 && it.checked && renderFileRadio(`${list.controlId}_${it.controlId}`)}
            </React.Fragment>
          );
        })}
      </React.Fragment>
    );
  };

  if (hide) return null;

  return ControlsSettingConfig.map((l, i) => {
    if (l.key === 'signature' && !signature.length) return null;

    return (
      <React.Fragment>
        <p className="Bold mTop15 Gray_9e">{l.label}</p>
        {renderLi([systemControl, controls.filter(l => !l.sectionId), signature][i])}
      </React.Fragment>
    );
  });
}
