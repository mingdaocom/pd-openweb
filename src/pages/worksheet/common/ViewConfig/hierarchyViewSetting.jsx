import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Menu, Dropdown } from 'antd';
import { LoadDiv } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import VerifyDel from 'src/pages/worksheet/views/components/VerifyDel';
import { useSetState } from 'react-use';
import CardDisplay from './CardDisplay';
import update from 'immutability-helper';
import Abstract from './components/Abstract';
import CoverSetting from './components/CoverSettingCon';
import DisplayControl from './components/DisplayControl';
import { updateViewAdvancedSetting } from './util';
import _ from 'lodash';

const EmptyHint = styled.div`
  margin: -6px 0 0 20px;
  background: #fff;
  padding: 18px 12px;
  border-radius: 3px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
  width: 280px;
  color: #9e9e9e;
  font-size: 13px;
`;

const HierarchyViewSettingWrap = styled.div`
  margin-top: -20px;
  margin-bottom: 12px;

  li {
    &:last-child {
      border: none;
    }
    &.currentSheet {
      .config.visible {
        max-height: 1600px;
      }
    }
    .display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 48px;
      width: 100%;
      padding: 4px 0;
      border-bottom: 1px solid #eaeaea;
      &.borderBottomNone {
        border-bottom: 1px solid #fff;
      }
      &:hover {
        .delete {
          visibility: visible;
        }
      }
      .delete {
        visibility: hidden;
      }
      .handle {
        display: flex;
        align-items: center;
        .switchVisible {
          cursor: pointer;
          padding-left: 20px;
          color: #757575;
          &:hover {
            color: #2196f3;
          }
        }
        .delete {
          color: #757575;
          &:hover {
            color: #f44336;
          }
        }
      }
    }
    .info {
      display: flex;
      align-items: center;
      i {
        cursor: pointer;
        font-size: 16px;
      }
      .controlName {
        margin: 0 8px;
        max-width: 140px;
      }
      .sheetInfo {
        max-width: 140px;
      }
    }
    .config {
      transition: max-height 0.25s;
      max-height: 0;
      display: none;
      .content {
        opacity: 0;
        visibility: hidden;
        transition: all 0.25s;
      }
      &.visible {
        max-height: 425px;
        display: block;
        margin-top: -4px;
        padding-bottom: 4px;
        border-bottom: 1px solid #eaeaea;
        .content {
          padding-top: 10px;
          padding-bottom: 24px;
          opacity: 1;
          visibility: visible;
        }
      }
    }
  }
  .grade {
    margin-right: 30px;
  }
  .controlName {
    margin: 0 4px 0 12px;
    color: #333;
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
      width: 260px;
      position: relative;
      background-color: #f8f8f8;
      margin-left: 10px;
      border-radius: 3px;
    }

    .deleteWrap {
      position: absolute;
      top: 0;
      right: -24px;
    }
  }
  .addRelate {
    color: #2196f3;
    font-weight: bold;
    cursor: pointer;
    margin-top: 18px;
    &:hover {
      color: #1565c0;
    }
  }
`;

export default function HierarchyViewSetting(props) {
  const { view, currentSheetInfo, updateCurrentView, appId, filteredColumns } = props;
  const { viewControls = [], childType, advancedSetting, layersName } = view;

  const [{ activeIndex, delIndex }, setSetting] = useSetState({
    activeIndex: -1,
    delIndex: -1,
  });

  const getSelectableControls = sheetInfo => {
    const { controls = [] } = _.get(sheetInfo, 'template') || {};
    const existSheet = viewControls.map(item => item.worksheetId);
    return _.filter(controls, item => item.type === 29 && !_.includes(existSheet, item.dataSource));
  };

  const [{ availableControls, controlLoading }, setControls] = useSetState({
    availableControls: getSelectableControls(currentSheetInfo),
    controlLoading: false,
  });
  const switchActive = index => {
    if (index === activeIndex) {
      setSetting({ activeIndex: -1 });
    } else {
      setSetting({ activeIndex: index });
    }
  };
  const handleChange = (obj, isUpdate = true) => {
    updateCurrentView({ appId, ...view, ...obj }, isUpdate);
  };

  const getAvailableControls = () => {
    const { worksheetId = '' } = _.last(viewControls) || {};
    if (controlLoading) return;
    setControls({ controlLoading: true });
    worksheetAjax
      .getWorksheetInfo({ worksheetId, getTemplate: true })
      .then(data => {
        setControls({
          availableControls: getSelectableControls(data),
        });
      })
      .always(() => {
        setControls({ controlLoading: false });
      });
  };
  const addViewControl = item => {
    const existSheet = viewControls.map(({ worksheetId }) => worksheetId); // 可选控件为关联表且关联他表
    worksheetAjax.getWorksheetInfo({ worksheetId: item.dataSource, getTemplate: true }).then(data => {
      setControls({
        availableControls: getSelectableControls(data, existSheet),
      });
      handleChange({
        viewControls: viewControls.concat({
          worksheetName: data.name,
          worksheetId: data.worksheetId,
          controlId: item.controlId,
          controlName: item.controlName,
        }),
        editAttrs: ['viewControls'],
      });
    });
  };

  const deleteViewControl = index => {
    if (index <= 1) {
      handleChange({
        viewControls: [
          {
            worksheetId: currentSheetInfo.worksheetId,
            worksheetName: currentSheetInfo.name,
          },
        ],
        layersName: [currentSheetInfo.name],
        editAttrs: ['viewControls', 'layersName'],
      });
      setControls({
        availableControls: getSelectableControls(currentSheetInfo),
      });
    } else {
      handleChange({
        viewControls: viewControls.slice(0, index),
        layersName: layersName.slice(0, index),
        editAttrs: ['viewControls', 'layersName'],
      });
    }
  };

  const renderRelate = () => {
    if (controlLoading) return <LoadDiv />;
    return availableControls.length > 0 ? (
      <Menu style={{ maxHeight: 300, overflowY: 'auto' }}>
        {availableControls.map(item => {
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
      </Menu>
    ) : (
      <EmptyHint>{_l('没有可选择的关联字段')}</EmptyHint>
    );
  };

  return (
    <HierarchyViewSettingWrap>
      {viewControls.map((item, index) => {
        const visible = activeIndex === index;
        return item.worksheetId === currentSheetInfo.worksheetId ? (
          <li className="currentSheet">
            <div className={cx('display Hand', { borderBottomNone: visible })} onClick={() => switchActive(index)}>
              <div className="info">
                <i className="icon-view Font18 Gray_9e"></i>
                <span className="controlName Font14 Bold overflow_ellipsis">{currentSheetInfo.name}</span>
                <span className="Gray_9e">{_l(' (本表) ')}</span>
              </div>
              <div className="handle">
                <div className="switchVisible">
                  <i
                    className={cx(activeIndex === index ? 'icon-arrow-up-border' : 'icon-arrow-down-border', 'Gray_9e')}
                  ></i>
                </div>
              </div>
            </div>
            <div className={cx('config', { visible })}>
              <div className="content">
                {/* abstract：摘要控件ID */}
                <Abstract
                  {...props}
                  advancedSetting={advancedSetting}
                  handleChange={value => {
                    updateCurrentView({
                      ...view,
                      appId,
                      advancedSetting: updateViewAdvancedSetting(view, { abstract: value }),
                      editAttrs: ['advancedSetting'],
                    });
                  }}
                />
                {/* 显示字段 */}
                <DisplayControl
                  {...props}
                  worksheetControls={filteredColumns}
                  handleChange={checked => {
                    updateCurrentView({ ...view, appId, showControlName: checked, editAttrs: ['showControlName'] });
                  }}
                  handleChangeSort={({ newControlSorts, newShowControls }) => {
                    updateCurrentView({
                      appId,
                      ...view,
                      controlsSorts: newControlSorts,
                      displayControls: newShowControls,
                      editAttrs: ['controlsSorts', 'displayControls'],
                    });
                  }}
                />
                {/* 封面图片 */}
                <CoverSetting
                  {...props}
                  advancedSetting={advancedSetting}
                  // 是否显示
                  handleChangeIsCover={value =>
                    updateCurrentView({
                      ...view,
                      appId,
                      coverCid: value === 'notDisplay' ? '' : value,
                      editAttrs: ['coverCid'],
                    })
                  }
                  // 显示位置
                  handleChangePosition={(value, coverTypeValue) => {
                    updateCurrentView({
                      ...view,
                      appId,
                      coverType: coverTypeValue,
                      advancedSetting: updateViewAdvancedSetting(view, { coverposition: value }),
                      editAttrs: ['coverType', 'advancedSetting'],
                    });
                  }}
                  // 显示方式
                  handleChangeType={value =>
                    updateCurrentView({
                      ...view,
                      appId,
                      coverType: value,
                      editAttrs: ['coverType'],
                    })
                  }
                  // 允许点击查看
                  handleChangeOpencover={value => {
                    updateCurrentView({
                      ...view,
                      appId,
                      advancedSetting: updateViewAdvancedSetting(view, { opencover: value }),
                      editAttrs: ['advancedSetting'],
                    });
                  }}
                />
              </div>
            </div>
          </li>
        ) : (
          <li key={item.worksheetId}>
            <div className={cx('display Hand', { borderBottomNone: visible })} onClick={() => switchActive(index)}>
              <div className="info">
                <i className="icon-link2 Gray_9e Font18"></i>
                <div className="controlName overflow_ellipsis Font14 Bold">
                  {item.controlName || item.worksheetName}
                </div>
                <div className="sheetInfo Gray_9e overflow_ellipsis">{_l('( 工作表: %0 )', item.worksheetName)}</div>
              </div>
              <div className="handle">
                <VerifyDel
                  title={_l('删除本级和之后的所有层级')}
                  visible={index === delIndex}
                  onVisibleChange={visible => !visible && setSetting({ delIndex: -1 })}
                  popupAlign={{
                    offset: [-100, 0],
                  }}
                  onDel={e => {
                    e.stopPropagation();
                    deleteViewControl(index);
                    setSetting({ delIndex: -1 });
                  }}
                  onCancel={e => {
                    e.stopPropagation();
                    setSetting({ delIndex: -1 });
                  }}
                >
                  <i
                    className="delete pointer icon-delete_12"
                    onClick={e => {
                      e.stopPropagation();
                      setSetting({ delIndex: index });
                    }}
                  ></i>
                </VerifyDel>
                <div className="switchVisible">
                  <i className={cx(visible ? 'icon-arrow-up-border' : 'icon-arrow-down-border')}></i>
                </div>
              </div>
            </div>
            <div className={cx('config', { visible })}>
              <div className="content">
                <CardDisplay
                  {...item}
                  visible={visible}
                  handleDisplayChange={obj =>
                    handleChange({
                      viewControls: update(viewControls, {
                        [index]: { $apply: item => ({ ...item, ...obj }) },
                      }),
                      editAttrs: ['viewControls'],
                    })
                  }
                />
              </div>
            </div>
          </li>
        );
      })}

      <Dropdown
        overlayClassName="addHierarchyRelate"
        trigger={['click']}
        overlay={renderRelate()}
        placement="bottomLeft"
      >
        <div className={cx('addRelate')} onClick={getAvailableControls}>
          <i className="icon-add Font20"></i>
          <span className="InlineBlock TxtTop">{_l('下一级关联')}</span>
        </div>
      </Dropdown>
    </HierarchyViewSettingWrap>
  );
}
