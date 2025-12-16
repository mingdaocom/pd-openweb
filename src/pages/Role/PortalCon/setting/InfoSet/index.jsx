import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { v4 as uuidv4, validate as validateUUID } from 'uuid';
import { Checkbox, SortableList, UpgradeIcon } from 'ming-ui';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import SelectExDrop from 'src/pages/Role/PortalCon/components/SelectExDrop';
import { DEFAULT_CONFIG } from 'src/pages/widgetConfig/config/widget';
import PortalSettingDialog from 'src/pages/widgetConfig/widgetSetting/components/PortalSettingDialog';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import { filterAlias, WIDGETS_TO_API_TYPE_ENUM_N } from './config';
import Item from './Item';
import { Wrap, WrapSortControls } from './style';
import './portalSort.less';

export default function InfoSet(props) {
  const { portal = {}, appId, onChangePortalSetModel = () => {} } = props;
  let { portalSet = {}, onChangePortalSet } = props;
  let { controlTemplate = {} } = portalSet;
  const { groupId, name, projectId, worksheetId } = portal.baseInfo || {};
  const [showId, setShowId] = useState(false);
  const [controls, setControls] = useState([]);
  const [controlsFilter, setControlsFilter] = useState([]);
  const [allControl, setAllControl] = useState([]);
  const [hs, setHs] = useState(false);

  useEffect(() => {
    let { controlTemplate = {} } = portalSet;
    let { controls = [] } = controlTemplate;
    setHs(false);
    setControls(
      (controls.length > 0 ? controls.filter(o => !filterAlias.includes(o.alias)) : []).sort((a, b) => {
        return a.row - b.row;
      }),
    );
    setControlsFilter(controls.length > 0 ? controls.filter(o => filterAlias.includes(o.alias)) : []);
    setAllControl(controls || []);
    window.subListSheetConfig = {};
  }, []);
  useEffect(() => {
    if (controls.length <= 0) {
      return;
    }
    let tmp = controls.slice();
    let val = tmp.shift();
    let data = [val].concat(...controlsFilter).concat(...tmp);
    setAllControl(data);
    onChangePortalSet(
      {
        controlTemplate: {
          ...controlTemplate,
          controls: data,
        },
      },
      hs,
    );
  }, [controls]);

  const handleMoveApp = list => {
    setHs(true);
    setControls(
      list.map((o, i) => {
        if (o.alias) {
          return { ...o, row: 0 };
        } else {
          return { ...o, row: controlsFilter.length + i + 1 };
        }
      }),
    );
  };
  const handleSortEnd = list => {
    handleMoveApp([controls[0], ...list]);
  };
  const renderCon = () => {
    return (
      <React.Fragment>
        {/* 第一个是系统文本字段，名称是姓名，不支持修改也不支持删除，默认不收集，默认非必填 */}
        <WrapSortControls className="mBottom10 porTalSort mTop10 title flexRow">
          <span className={cx('InlineBlock controlN disable title')}>{_l('类型')}</span>
          <span className={cx('controlName InlineBlock mLeft10 disable title')}>{_l('名称')}</span>
          <Checkbox
            className="TxtLeft InlineBlock Hand"
            text={_l('收集')}
            checked={controls.filter(o => o.fieldPermission === '110').length >= controls.length}
            clearselected={
              !!(
                controls.length &&
                controls.filter(o => o.fieldPermission === '110').length &&
                controls.filter(o => o.fieldPermission === '110').length !== controls.length
              )
            }
            onClick={() => {
              setHs(true);
              setControls(
                controls.map(o => {
                  return {
                    ...o,
                    fieldPermission:
                      controls.filter(o => o.fieldPermission === '110').length >= controls.length ? '111' : '110',
                  };
                }),
              );
            }}
          />
          <Checkbox
            className="TxtLeft InlineBlock Hand required"
            text={_l('必填')}
            checked={controls.filter(o => o.required).length >= controls.length}
            clearselected={
              !!(
                controls.length &&
                controls.filter(o => o.required).length &&
                controls.filter(o => o.required).length !== controls.length
              )
            }
            onClick={() => {
              setHs(true);
              setControls(
                controls.map((o, i) => {
                  if (i === 0) {
                    return o;
                  }
                  return { ...o, required: !(controls.filter(o => o.required).length >= controls.length) };
                }),
              );
            }}
          />
          <div style={{ width: 46 }} />
        </WrapSortControls>
        {/* 系统字段 用户 */}
        <WrapSortControls className="mBottom10 porTalSort firstWrapSorh flexRow">
          <span className="sortBox InlineBlock mRight18"></span>
          <span className={cx('InlineBlock controlN disable')}>
            {(DEFAULT_CONFIG[WIDGETS_TO_API_TYPE_ENUM_N[controls[0].type]] || {}).widgetName}
          </span>
          <span
            className={cx('controlName InlineBlock mLeft10 disable mRight25', { noName: !controls[0].controlName })}
          >
            {controls[0].controlName}
          </span>
          <Checkbox
            className="TxtLeft InlineBlock Hand cellect"
            text={''}
            checked={controls[0].fieldPermission === '110'}
            onClick={() => {
              setHs(true);
              setControls(
                controls.map((o, i) => {
                  if (i === 0) {
                    return {
                      ...o,
                      ...{
                        fieldPermission: controls[0].fieldPermission === '110' ? '111' : '110',
                        controlId: controls[0].controlId,
                      },
                    };
                  }
                  return o;
                }),
              );
            }}
          />
          <Checkbox className="TxtLeft InlineBlock Hand required" text={''} disabled checked={controls[0].required} />
          <div style={{ width: 46 }} />
        </WrapSortControls>
        <div className="">
          <SortableList
            itemKey="controlId"
            items={controls.filter((o, i) => i !== 0)}
            useDragHandle
            onSortEnd={handleSortEnd}
            helperClass={'portalList'}
            renderItem={options => (
              <Item
                {...options}
                {...options.item}
                appId={appId}
                projectId={projectId}
                onChange={control => {
                  setHs(true);
                  setControls(
                    controls.map(o => {
                      if (o.controlId === control.controlId) {
                        return { ...o, ...control };
                      }
                      return o;
                    }),
                  );
                }}
                showEditDialog={controlId => {
                  setShowId(controlId);
                }}
                deleteBtn={controlId => {
                  setHs(true);
                  setControls(controls.filter(o => o.controlId !== controlId));
                }}
              />
            )}
          />
        </div>
      </React.Fragment>
    );
  };

  const FEATURE_STATUS = getFeatureStatus(projectId, VersionProductType.userExtensionInformation);
  const FEATURE_STATUS_DISABLED = FEATURE_STATUS === '2';

  return (
    <Wrap>
      <div className="content">
        <h6 className="Font16 Gray Bold mBottom0">{_l('用户列表信息设置')}</h6>
        <div className="Font12 Gray_9e mTop8 mBottom8">
          {_l(
            '外部用户列表在系统字段的基础上，还可增加自定义字段的配置；如果自定义字段需要用户注册/登录时填写收集，点击左侧的收集勾选框，需要用户必填可点击右侧的必填勾选框',
          )}
        </div>
        {controls.length > 0 && renderCon()}
        <div
          className="addControl InlineBlock Hand"
          onClick={() => {
            setHs(true);
            setControls(
              controls.concat({
                controlId: uuidv4(),
                fieldPermission: '110', //新增默认就是收集
                required: false,
                row: allControl.length + 1,
              }),
            );
          }}
        >
          <i className="icon icon-add Font18 mRight5 TxtMiddle InlineBlock" />
          <span className="Bold TxtMiddle InlineBlock">{_l('添加字段')}</span>
        </div>
        {controls.length > 0 && (
          <React.Fragment>
            <div className="mTop30 Font16 Bold">
              {_l('作为权限标签的扩展信息字段')} {FEATURE_STATUS_DISABLED && <UpgradeIcon />}
            </div>
            <div className="mTop15 Gray_9e">
              {_l(
                '选择用户扩展信息作为用户权限标签字段（仅支持关联记录字段），可启用的字段上限为3个，每个标签字段的有限值上限为1000个，超过时默认取前1000个，当其他工作表记录也关联了此标签字段时，可以在角色权限、或筛选器中过滤出当前用户对应的标签记录。',
              )}
            </div>
            <SelectExDrop
              disabled={FEATURE_STATUS_DISABLED}
              key={JSON.stringify(controls)}
              values={_.get(props, 'portalSet.portalSetModel.extendAttr')}
              controls={controls.filter(o => o.type === 29 && !validateUUID(o.controlId))}
              onChange={extendAttr => {
                if (FEATURE_STATUS_DISABLED) {
                  return buriedUpgradeVersionDialog(projectId, VersionProductType.userExtensionInformation);
                }
                setHs(true);
                onChangePortalSetModel({ extendAttr });
              }}
            />
          </React.Fragment>
        )}
      </div>
      {showId && (
        <PortalSettingDialog
          onClose={() => {
            setShowId('');
          }}
          onOk={control => {
            setShowId('');
            setHs(true);
            setControls(
              controls.map(o => {
                if (o.controlId !== control.controlId) {
                  return o;
                } else {
                  return control;
                }
              }),
            );
          }}
          globalSheetInfo={{
            appId,
            groupId,
            name,
            projectId,
            worksheetId,
          }}
          data={controls.find(c => c.controlId === showId)}
          allControls={controls}
          from="portal"
        />
      )}
    </Wrap>
  );
}
