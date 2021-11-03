import React, { Fragment, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Dialog } from 'ming-ui';
import update from 'immutability-helper';
import { Dropdown } from 'antd';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import { getAdvanceSetting, getIconByType } from '../../util';
import { COMMON, TEMPLATE_TYPE } from '../../config/ocr';
import { DropdownPlaceholder, SelectFieldsWrap } from '../../styled';
import { handleAdvancedSettingChange } from '../../util/setting';

const ConfigRelation = styled.div`
  .title {
    margin: 24px 0 12px 0;
  }

  .mapItem {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    .ant-dropdown-trigger {
      margin: 0;
    }
    .mapIcon {
      color: #2196f3;
    }
    .Dropdown,
    .ming.Menu {
      width: 100%;
    }
    .item,
    .field {
      width: 45%;
    }
    .item {
      background-color: #f8f8f8;
      line-height: 36px;
      padding: 0 12px;
      border-radius: 4px;
    }
    .infoWrap {
      display: flex;
      align-items: center;
      flex: 1;
      .name {
        display: flex;
        align-items: center;
        flex: 1;
        i {
          margin-right: 6px;
        }
      }
    }
  }
`;
// 获取映射类型
const getMapByType = type => {
  const { map } = TEMPLATE_TYPE.find(item => item.value === type);
  return map || COMMON;
};

function MapItem(props) {
  const { allControls, ocrMap, value, text, match, withSubList, setMap } = props;
  const [isHover, setHover] = useState(false);
  const getSubList = () => allControls.filter(item => item.type === 34);
  // 获取所有可选的映射字段
  const getSelectableControls = (match, withSubList = false) => {
    const allCid = ocrMap.map(item => item.cid);
    const allSubCid = ocrMap.map(item => item.subCid);
    const filterControls = (controls = [], exclude = []) =>
      controls.filter(item => match.includes(item.type) && !exclude.includes(item.controlId));
    let controls = [
      {
        id: 'current',
        controls: filterControls(allControls, allCid),
      },
    ];
    if (!withSubList) return controls;
    const subList = getSubList();
    subList.forEach(({ controlId, relationControls = [], controlName }) => {
      if (relationControls.length > 0) {
        controls.push({
          id: controlId,
          name: controlName,
          controls: filterControls(relationControls, allSubCid),
        });
      }
    });
    return controls;
  };

  const getControlInfo = value => {
    const { cid, subCid } = ocrMap.find(item => parseFloat(item.type) === value) || {};
    let control = allControls.find(item => item.controlId === cid) || {};
    if (subCid) {
      control = (control.relationControls || []).find(item => item.controlId === subCid) || {};
      return control;
    }
    return control;
  };
  const selectableControls = getSelectableControls(match, withSubList);
  const isHaveSelectableControls = selectableControls.some(item => item.controls.length > 0);
  const info = getControlInfo(value);

  const renderControlItem = ({ id, name, controls }) => {
    if (!isHaveSelectableControls) {
      return id === 'current' ? <div className="emptyText Gray_9e">{_l('无可选控件')}</div> : null;
    }
    return controls.length > 0 ? (
      <ul key={id} className="relateSheetList">
        <li>
          {name && (
            <div className="title Gray_75">
              <span>{name}</span>
            </div>
          )}
          <ul className="fieldList">
            {controls.map(({ type, controlId, controlName }) => {
              let para = {
                type: value,
                name: text,
                cid: controlId,
              };
              if (id && id !== 'current') {
                para = { ...para, cid: id, subCid: controlId };
              }
              return (
                <li
                  key={controlId}
                  className="overflow_ellipsis"
                  onClick={() => {
                    const index = ocrMap.findIndex(item => item.type === value);
                    if (index > -1) {
                      setMap(update(ocrMap, { $splice: [[index, 1, para]] }));
                    } else {
                      setMap(ocrMap.concat(para));
                    }
                  }}
                >
                  <i className={`icon-${getIconByType(type)}`}></i>
                  {controlName}
                </li>
              );
            })}
          </ul>
        </li>
      </ul>
    ) : null;
  };
  return (
    <div className="mapItem">
      <div className="item">{text}</div>
      <i className="mapIcon icon-arrow_forward Font20"></i>
      <div className="field">
        <Dropdown
          trigger={['click']}
          overlay={
            <SelectFieldsWrap className="mapFieldsWrap">
              <div className="fieldsWrap">{selectableControls.map(renderControlItem)}</div>
            </SelectFieldsWrap>
          }
        >
          <DropdownPlaceholder onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            {isEmpty(info) ? (
              <div className="infoWrap">
                <div className="name Gray_9e">{_l('请选择')}</div>
                <i className={'Font14 icon-arrow-down-border Gray_9e'}></i>
              </div>
            ) : (
              <div className="infoWrap">
                <div className="name">
                  <i className={`Gray_9e Font14 icon-${getIconByType(info.type)}`}></i>
                  {info.controlName}
                </div>
                <i
                  className={cx(
                    `Font14 icon-${isHover ? 'closeelement-bg-circle Gray_75' : 'arrow-down-border Gray_9e'} `,
                  )}
                  onClick={e => {
                    e.stopPropagation();
                    const index = ocrMap.findIndex(item => item.type === value);
                    if (index > -1) {
                      setMap(update(ocrMap, { $splice: [[index, 1]] }));
                    }
                  }}
                ></i>
              </div>
            )}
          </DropdownPlaceholder>
        </Dropdown>
      </div>
    </div>
  );
}

export default function OcrMap({ data, onChange, onClose, ...rest }) {
  const { enumDefault = 0 } = data;

  const [ocrMap, setMap] = useState(getAdvanceSetting(data, 'ocrmap') || []);

  const renderItem = ({ items, title, withSubList }) => {
    return (
      <Fragment>
        {title && <div className="title Gray_75">{title}</div>}
        {items.map(item => {
          return <MapItem {...rest} {...item} withSubList={withSubList} ocrMap={ocrMap} setMap={setMap} />;
        })}
      </Fragment>
    );
  };
  const renderMapDetail = () => {
    const mapDetail = getMapByType(enumDefault);
    return mapDetail.map(renderItem);
  };
  return (
    <Dialog
      width={640}
      visible
      title={_l('建立字段映射')}
      onOk={() => {
        onChange(handleAdvancedSettingChange(data, { ocrmap: JSON.stringify(ocrMap) }));
        onClose();
      }}
      onCancel={() => onClose()}
    >
      <ConfigRelation>{renderMapDetail()}</ConfigRelation>
    </Dialog>
  );
}
