import React, { Fragment, useState } from 'react';
import { useSetState } from 'react-use';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { filterAndFormatterControls } from 'src/pages/worksheet/views/util';
import VerifyDel from './VerifyDel';

const ControlsWrap = styled.div`
  .grade {
    margin-right: 30px;
  }
  .controlName {
    margin: 0 12px;
    color: #151515;
  }
  .relateItem {
    display: flex;
    align-items: center;
    line-height: 36px;
    margin-top: 10px;
  }
  li {
    .gradeName {
      width: 56px;
    }
    .controlInfo {
      display: flex;
      align-items: center;
      width: 320px;
      padding-left: 12px;
      position: relative;
      background-color: #f8f8f8;
      border-radius: 3px;
      .controlName {
        max-width: 90px;
      }
      .sheetName {
        max-width: 170px;
      }
    }

    .deleteWrap {
      position: absolute;
      top: 0;
      right: -24px;
      i {
        color: #9e9e9e;
        cursor: pointer;
        &:hover {
          color: #f44336;
        }
      }
    }
  }
  .addRelate {
    margin-top: 6px;
    width: 280px;
    color: #1677ff;
    font-weight: bold;
    line-height: 36px;
    cursor: pointer;
  }
`;
const EmptyHint = styled.div`
  padding: 12px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
  width: 280px;
  color: #9e9e9e;
  font-size: 13px;
  font-weight: 500;
`;

const InputWrap = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 12px;
  border-bottom: 1px solid #f0f0f0;
  input {
    line-height: 32px;
    border: none;
    outline: none;
    padding-left: 8px;
  }
`;

const isVisible = control => {
  let { fieldPermission = '111' } = control;
  const [visible] = fieldPermission.split('');
  if (visible === '0') {
    return false;
  }
  return true;
};

export default function HierarchyRelateMultiSheet({ worksheetInfo, viewControls, updateViewControls }) {
  const getSelectableControls = sheetInfo => {
    const { controls = [] } = _.get(sheetInfo, 'template') || {};
    const existSheet = viewControls.map(item => item.worksheetId);
    return _.filter(
      controls,
      item =>
        (item.type === 29 ||
          (item.type === 34 && _.includes(['0', '1'], _.get(item, 'advancedSetting.detailworksheettype')))) &&
        !_.includes(existSheet, item.dataSource),
    );
  };

  const [{ availableControls, controlLoading }, setControls] = useSetState({
    availableControls: getSelectableControls(worksheetInfo),
    controlLoading: false,
  });

  const [delIndex, setIndex] = useState(-1);
  const [searchValue, setValue] = useState('');

  const getAvailableControls = () => {
    const { worksheetId } = _.last(viewControls);
    const prevViewControl = _.last(viewControls.slice(0, -1));
    if (controlLoading) return;
    setValue('');
    setControls({ controlLoading: true });
    worksheetAjax
      .getWorksheetInfo({
        worksheetId,
        getTemplate: true,
        relationWorksheetId: prevViewControl ? prevViewControl.worksheetId : worksheetInfo.worksheetId,
      })
      .then(data => {
        setControls({
          availableControls: getSelectableControls(data),
        });
      })
      .finally(() => {
        setControls({ controlLoading: false });
      });
  };
  const addViewControl = item => {
    worksheetAjax.getWorksheetInfo({ worksheetId: item.dataSource, getTemplate: true }).then(data => {
      const controls = data.template.controls;
      const coverControls = filterAndFormatterControls({
        controls: controls.filter(l => isVisible(l)).filter(c => !!c.controlName),
        ////扫码|附件可作为封面
        filter: item => [14, 47].includes(item.type) || [14, 47].includes(item.sourceControlType),
      });
      setControls({
        availableControls: getSelectableControls(data),
      });
      updateViewControls(
        viewControls.concat({
          worksheetName: data.name,
          worksheetId: data.worksheetId,
          controlId: item.controlId,
          controlName: item.controlName,
          showControlName: true,
          coverCid: coverControls[0] ? coverControls[0].value : undefined,
          coverType: 0,
          advancedSetting: { coverposition: '0' },
          showControls: controls
            .filter(item => item.attribute !== 1)
            .slice(0, 2)
            .map(({ controlId }) => controlId),
        }),
      );
    });
  };

  const renderRelate = () => {
    if (controlLoading) return <LoadDiv />;
    const filterData = searchValue
      ? availableControls.filter(i => i.controlName.includes(searchValue))
      : availableControls;
    return (
      <Menu style={{ maxHeight: 300, overflowY: 'auto' }}>
        <InputWrap>
          <i className="icon-search Gray_75 Font16"></i>
          <input
            autoFocus
            value={searchValue}
            placeholder={_l('搜索')}
            onChange={e => {
              setValue(e.target.value);
            }}
          />
        </InputWrap>
        {filterData.length > 0 ? (
          <Fragment>
            {filterData.map(item => {
              const { controlId, controlName } = item;
              return (
                <Menu.Item
                  key={controlId}
                  onClick={() => {
                    addViewControl(item);
                  }}
                >
                  <i className="icon-link2 Gray_9e Font15"></i>
                  <span style={{ marginLeft: '6px' }} className="controlName Bold">
                    {controlName}
                  </span>
                </Menu.Item>
              );
            })}
          </Fragment>
        ) : (
          <EmptyHint>{_l('没有可选择的关联字段')}</EmptyHint>
        )}
      </Menu>
    );
  };
  return (
    <ControlsWrap>
      <ul>
        {viewControls.map(({ controlName, worksheetId, worksheetName }, index) => {
          return worksheetId === worksheetInfo.worksheetId ? (
            <li className="relateItem">
              <span className="grade Gray_9e">{_l('第1级')}</span>
              <i className="icon-1_worksheet Gray_9e Font18 mLeft4"></i>
              <span className="controlName">{worksheetInfo.name}</span>
              <span className="Gray_9e">{_l('( 本表 )')}</span>
            </li>
          ) : (
            <li className="relateItem">
              <span className="gradeName Gray_9e">{_l('第%0级', index + 1)}</span>
              <div className="controlInfo">
                <i className="icon-link2 Gray_9e Font18"></i>
                <div className="controlName overflow_ellipsis">{controlName}</div>
                <div className="sheetName overflow_ellipsis Gray_9e">{_l('( 工作表: %0 )', worksheetName)}</div>

                <VerifyDel
                  visible={delIndex === index}
                  title={_l('删除本级和之后的所有层级')}
                  onVisibleChange={visible => !visible && setIndex(-1)}
                  onCancel={() => {
                    setIndex(-1);
                  }}
                  popupAlign={{
                    offset: [70, 0],
                  }}
                  onDel={() => {
                    if (index <= 1) {
                      updateViewControls([
                        {
                          worksheetId: worksheetInfo.worksheetId,
                          worksheetName: worksheetInfo.name,
                        },
                      ]);
                      setControls({
                        availableControls: getSelectableControls(worksheetInfo),
                      });
                    } else {
                      updateViewControls(viewControls.slice(0, index));
                    }
                    setIndex(-1);
                  }}
                >
                  <div className="deleteWrap" onClick={() => setIndex(index)}>
                    <i className="icon-delete_12"></i>
                  </div>
                </VerifyDel>
              </div>
            </li>
          );
        })}
      </ul>
      <Dropdown
        overlayClassName="addHierarchyRelate"
        trigger={['click']}
        overlay={renderRelate()}
        placement="bottomLeft"
      >
        <div className={'addRelate'} onClick={getAvailableControls}>
          <i className="icon-add"></i>
          <span>{_l('下一级关联')}</span>
        </div>
      </Dropdown>
    </ControlsWrap>
  );
}
