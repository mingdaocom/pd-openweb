import React, { Fragment, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useClickAway } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { bool, func, number, string } from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import groupAjax from 'src/api/group';

const SelectGroupWrap = styled.div(
  ({ showType }) => `
    overflow: hidden;
    width: ${showType === 1 ? '360px' : '100%'};
    background-color: #fff;
    border-radius: 4px;
    box-shadow: ${showType === 1 ? 'rgba(0, 0, 0, 0.16) 0px 3px 6px 1px' : 'none'};
    padding-top: 16px;
    text-align: left;
    .item,
    .projectItem {
      padding: 0 18px;
      height: 36px;
      &:hover {
        background: #f5f5f5;
      }
      &.select {
        background: #e5f4fd !important;
      }
      &.disabled {
        color: #757575 !important;
        background: #fff !important;
      }
    }
    .projectItem {
      justify-content: start;
    }
    .projectList {
      .item {
        padding-left: 30px;
      }
    }
    .split {
      margin: 5px 8px;
      height: 1px;
      background: #f0f0f0;
    }
    .rotate90 {
      transform: rotate(-90deg);
    }
`,
);
const DefaultChildWrap = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
`;
export function SelectGroup(props) {
  const {
    projectId,
    minHeight = 400,
    isAll = true,
    isMe = true,
    everyoneOnly = false,
    filterDisabledGroup = false,
    defaultValueAllowChange = true,
    defaultValue = {},
    value,
    showType = 1,
    onChange = () => {},
    onSave = () => {},
    onClose = () => {},
  } = props;
  const projects = (_.get(md, 'global.Account.projects') || []).filter(l => l.licenseType);
  const conRef = useRef();
  const [loading, setLoading] = useState(false);
  const [commonList, setCommonList] = useState([]);
  const [groupData, setGroupData] = useState({});
  const [groupLoading, setGroupLoading] = useState(false);
  const [expandKeys, setExpandKeys] = useState([]);
  const [selectIds, setSelectIds] = useState({
    shareGroupIds: defaultValue.shareGroupIds || [],
    shareProjectIds: defaultValue.shareProjectIds || [],
    radioProjectIds: defaultValue.radioProjectIds || [],
    isMe: defaultValue.isMe !== undefined ? defaultValue.isMe : false,
  });

  useEffect(() => {
    projectId !== undefined ? getGroup({ projectId }) : getCommonList();
  }, [projectId]);

  useEffect(() => {
    if (
      _.isEmpty(value) &&
      value &&
      (selectIds.shareGroupIds.length || selectIds.shareProjectIds.length || selectIds.isMe)
    ) {
      setSelectIds({ shareGroupIds: [], shareProjectIds: [], radioProjectIds: [], isMe: false });
    }
  }, [value]);

  useClickAway(conRef, () => {
    onSave();
    onClose(true);
  });

  const getGroup = item => {
    projectId !== undefined ? setLoading(true) : setGroupLoading(item.projectId);
    groupAjax
      .selectGroup({
        projectId: item.projectId === 'common' ? '' : item.projectId,
        withRadio: false,
      })
      .then(res => {
        let data = res.filter(
          l =>
            (_.get(l, 'extra.licenseType') !== 0 || !filterDisabledGroup) && (isMe || _.get(l, 'extra.isMe') !== true),
        );

        if (isAll && item.projectId !== 'common' && item.projectId) {
          data = [{ id: item.projectId, value: item.companyName, extra: { isProject: true } }].concat(data);
        }

        if (['common', ''].includes(item.projectId) && isMe) {
          data = [{ id: md.global.Account.accountId, value: _l('仅自己可见'), extra: { isMe: true } }].concat(data);
        }

        projectId !== undefined ? setLoading(false) : setGroupLoading(undefined);
        projectId !== undefined
          ? setCommonList(data)
          : setGroupData({
              ...groupData,
              [item.projectId]: data,
            });
      });
  };

  const getCommonList = () => {
    setLoading(true);
    groupAjax.selectGroupMostFrequent().then(res => {
      _.remove(res, l => _.get(l, 'extra.isMe'));
      setCommonList(
        isMe ? res.concat({ id: md.global.Account.accountId, value: _l('仅自己可见'), extra: { isMe: true } }) : res,
      );
      setLoading(false);
    });
  };

  const handleSelect = (item, checked) => {
    let selectObj = _.cloneDeep(selectIds);
    let list = [];

    if (md.global.Account.accountId === item.id) {
      selectObj = { shareProjectIds: [], shareGroupIds: [], radioProjectIds: [], isMe: checked };
    } else if (everyoneOnly && _.get(item, 'extra.isProject')) {
      selectObj = { shareProjectIds: checked ? [item.id] : [], shareGroupIds: [], radioProjectIds: [], isMe: false };
    } else {
      const type = _.get(item, 'extra.isProject') ? 'shareProjectIds' : 'shareGroupIds';
      selectObj[type] = checked ? selectObj[type].concat(item.id) : selectObj[type].filter(l => l !== item.id);

      if (everyoneOnly && type === 'shareGroupIds') {
        selectObj.shareProjectIds = [];
      }

      selectObj.isMe = false;
    }

    if (
      !defaultValueAllowChange &&
      !_.isEmpty(defaultValue) &&
      ((md.global.Account.accountId === item.id && !checked) || selectIds.isMe)
    ) {
      selectObj = {
        shareGroupIds: _.concat(selectObj.shareGroupIds || [], defaultValue.shareGroupIds || []),
        shareProjectIds: _.concat(selectObj.shareProjectIds || [], defaultValue.shareProjectIds || []),
        radioProjectIds: _.concat(selectObj.radioProjectIds || [], defaultValue.radioProjectIds || []),
        isMe: selectObj.isMe,
      };
      list = _.concat(selectObj.shareGroupIds, selectObj.shareProjectIds, selectObj.radioProjectIds);
    }

    setSelectIds(selectObj);
    onChange(selectObj, list.length > 0 ? list : { ...item, checked: checked });
  };

  const handleExpand = (item, expand) => {
    setExpandKeys(expand ? expandKeys.concat(item.projectId) : expandKeys.filter(l => l !== item.projectId));

    if (groupData[item.projectId]) return;

    getGroup(item);
  };

  const renderList = (data, key) => {
    return (
      <ul>
        {data.map(l => {
          const checked = (
            selectIds.isMe ? [md.global.Account.accountId] : selectIds.shareProjectIds.concat(selectIds.shareGroupIds)
          ).includes(l.id);
          const allProject = _.get(l, 'extra.isProject');
          const showProjectName = key === 'commonList' && allProject;
          const disabled =
            !defaultValueAllowChange &&
            (defaultValue.shareProjectIds || []).concat(defaultValue.shareGroupIds || []).includes(l.id);

          return (
            <li
              className={cx('item Font13 Gray valignWrapper Hand', {
                select: checked,
                disabled: disabled,
              })}
              key={`${key}-${l.id}`}
              onClick={() => {
                if (disabled) return;

                handleSelect(l, !checked);
              }}
              data-groupid={l.id}
              data-name={l.value}
            >
              <span className={showProjectName ? '' : 'flex overflow_ellipsis'}>
                {allProject ? _l('所有同事') : l.value}
              </span>
              {showProjectName && <span className="Gray_75 mLeft5 flex overflow_ellipsis">{l.value}</span>}
              {checked && <Icon icon="done" className="mLeft8 ThemeColor Font12" />}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderGroupList = () => {
    const groupList = projects.concat({ projectId: 'common', companyName: projects.length ? _l('个人') : _l('群组') });

    return (
      <div className="projectList">
        {groupList.map(l => {
          const expand = expandKeys.includes(l.projectId);

          return (
            <Fragment key={`projectItem-${l.projectId}`}>
              <div className="projectItem Font13 Gray valignWrapper Hand" onClick={() => handleExpand(l, !expand)}>
                <Icon icon="task_custom_btn_unfold" className={cx('Gray_9e Font12 mRight10', { rotate90: !expand })} />
                <span className="flex overflow_ellipsis">{l.companyName}</span>
              </div>
              {expand ? (
                groupLoading === l.projectId ? (
                  <LoadDiv />
                ) : (
                  renderList(groupData[l.projectId], `projectItem-${l.projectId}`)
                )
              ) : null}
            </Fragment>
          );
        })}
      </div>
    );
  };

  const renderCommonList = () => {
    if (!commonList.length) return;

    return (
      <Fragment>
        {projectId === undefined && <div className="pLeft16 Font12 Gray_75 pBottom8">{_l('最常使用')}</div>}
        {renderList(commonList, 'commonList')}
        {projectId === undefined && projects.length && <div className="split"></div>}
      </Fragment>
    );
  };

  return (
    <SelectGroupWrap className="quickSelectGroup" ref={conRef} style={{ height: minHeight }} showType={showType}>
      {loading ? (
        <LoadDiv />
      ) : (
        <ScrollView className="flex h100">
          {!commonList.length && !projects.length && <p className="item Gray_9e">{_l('暂无群组')}</p>}
          {renderCommonList()}
          {projectId === undefined && renderGroupList()}
        </ScrollView>
      )}
    </SelectGroupWrap>
  );
}

export function SelectGroupTrigger(props) {
  const {
    offset = { top: 0, left: 0 },
    zIndex = 1001,
    destroyPopupOnHide = false,
    defaultValue,
    hideIcon = false,
    everyoneOnly = false,
    projectId,
    className = '',
    getPopupContainer = triggerNode => triggerNode.parentElement,
  } = props;
  const [visible, setVisible] = useState(false);
  const popupOffset = [offset.left, offset.top];
  const [value, setValue] = useState([]);

  useEffect(() => {
    if (!defaultValue) return;

    const group = _.get(defaultValue, 'shareGroupIds') || [];
    const project = _.get(defaultValue, 'shareProjectIds') || [];
    const radio = _.get(defaultValue, 'radioProjectIds') || [];

    if (!group.length && !project.length && !radio.length) {
      setValue([{ id: md.global.Account.accountId, value: _l('仅自己可见'), extra: { isMe: true } }]);
    } else {
      setValue(
        group
          .map(l => ({ id: l, value: '' }))
          .concat(project.map(l => ({ id: l, value: _l('所有同事'), extra: { isProject: true } }))),
      );
    }
  }, []);

  useEffect(() => {
    if (projectId === undefined) return;

    !defaultValue && setValue([]);
  }, [projectId]);

  useEffect(() => {
    if (_.isEmpty(props.value) && props.value && value.length) {
      setValue([]);
    }
  }, [props.value]);

  useEffect(() => {
    if (value.length !== 1 || value[0].value) return;

    getGroupInfo(value[0].id);
  }, [value]);

  const getGroupInfo = groupId => {
    groupAjax.getGroupInfo({ groupId }).then(res => setValue([{ id: groupId, value: res.name }]));
  };

  const onChange = (selected, item) => {
    props.onChange(selected, value);

    if (_.isArray(item)) {
      setValue(item.map(l => ({ id: l, value: '' })));
      return;
    }

    if (item.id === md.global.Account.accountId || (everyoneOnly && _.get(item, 'extra.isProject'))) {
      setValue(item.checked ? [item] : []);
    } else {
      setValue(
        item.checked
          ? value
              .filter(l => l.id !== md.global.Account.accountId && (!everyoneOnly || !_.get(l, 'extra.isProject')))
              .concat(item)
          : value.filter(l => ![item.id, md.global.Account.accountId].includes(l.id)),
      );
    }
  };

  return (
    <Trigger
      zIndex={zIndex}
      popupVisible={visible}
      action={['click']}
      destroyPopupOnHide={destroyPopupOnHide}
      popupAlign={{
        offset: popupOffset,
        points: ['tl', 'bl'],
        overflow: { adjustX: true, adjustY: true },
      }}
      className={className}
      popup={
        <SelectGroup
          {...props}
          onClose={force => {
            if (!force && props.isDynamic) {
              return;
            }
            if (_.isFunction(props.onClose)) {
              props.onClose();
            }
            setVisible(false);
          }}
          onChange={onChange}
        />
      }
      onPopupVisibleChange={setVisible}
      getPopupContainer={getPopupContainer}
    >
      {props.children || (
        <DefaultChildWrap className="Hand">
          {!hideIcon && <Icon icon="eye" className="Font16 Gray_c mRight5" />}
          <span className="ThemeColor3">
            {value.length
              ? value.length === 1
                ? _.get(value[0], 'extra.isProject')
                  ? _l('所有同事')
                  : value[0].value
                : _l('已选择 %0 项', value.length)
              : _l('选择分享范围')}
          </span>
          {!hideIcon && <Icon icon="arrow-down-border" className="font8 Gray_7e" />}
        </DefaultChildWrap>
      )}
    </Trigger>
  );
}

SelectGroup.propTypes = {
  minHeight: number,
  projectId: string, // 单独渲染该网络
  isAll: bool, // 上是否显示所有同事
  isMe: bool, // 显示我自己
  filterDisabledGroup: bool, // 过滤掉到期网络或群组
  everyoneOnly: false, // 选择所有同事是否与选择群组互斥
  onSave: func, //关闭保存
  onClose: func, //关闭
};

export default function quickSelectGroup(target, props = {}) {
  const panelWidth = 360;
  const panelHeight = 41 + (props.minHeight || 400);
  let targetLeft;
  let targetTop;
  let x = 0;
  let y = 0;
  let height = 0;
  const { offset = { top: 0, left: 0 }, zIndex = 1001 } = props;
  const $con = document.createElement('div');
  function setPosition() {
    if (_.isFunction(_.get(target, 'getBoundingClientRect'))) {
      const rect = target.getBoundingClientRect();
      height = rect.height;
      targetLeft = rect.x;
      targetTop = rect.y;
      x = targetLeft + (offset.left || 0);
      y = targetTop + height + (offset.top || 0);
      if (x + panelWidth > window.innerWidth) {
        x = targetLeft - 10 - panelWidth;
      }
      if (y + panelHeight > window.innerHeight) {
        y = targetTop - panelHeight - 4;
        if (y < 0) {
          y = 0;
        }
        if (targetTop < panelHeight) {
          x = targetLeft - 10 - panelWidth;
          if (x < panelWidth) {
            x = targetLeft + 10 + 36;
          }
        }
      }
      $con.style.position = 'absolute';
      $con.style.left = x + 'px';
      $con.style.top = y + 'px';
      $con.style.zIndex = zIndex;
    }
  }
  setPosition();
  document.body.appendChild($con);
  const root = createRoot($con);

  function destory() {
    root.unmount();
    document.body.removeChild($con);
  }

  root.render(
    <SelectGroup
      {...props}
      onClose={force => {
        if (!force && props.isDynamic) {
          setTimeout(setPosition, 100);
          return;
        }
        if (_.isFunction(props.onClose)) {
          props.onClose();
        }
        destory();
      }}
    />,
  );
}
