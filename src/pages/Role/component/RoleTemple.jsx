import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { WrapTableCon, WrapNav } from 'src/pages/Role/style';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import RoleSet from './RoleSet';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import '../style.less';
const noOpType = [100];
const SortHandle = SortableHandle(() => <Icon className="Font12 mLeft3 Hand" icon="drag_indicator" />);
const Item = SortableElement(({ item, dataList, onAction, roleId, onChoose }) => (
  <li
    className={cx('flexRow alignItemsCenter navLiRole', { cur: roleId === item.roleId })}
    onClick={() => onChoose(item.roleId)}
  >
    {!noOpType.includes(item.roleType) || !item.roleId ? (
      <SortHandle />
    ) : (
      <span className="InlineBlock mLeft5" style={{ width: 10 }}></span>
    )}
    {/* <Icon className="Font16 mLeft5 Hand" icon={item.roleType === 100 ? 'manage_accounts' : 'limit-othermember'} /> */}
    <span className="flex mLeft5 Font14 flexRow alignItemsCenter">
      <span className="InlineBlock overflow_ellipsis breakAll" title={item.name}>
        {item.name}
      </span>
      {item.isDefault && <span className="tag mLeft3 InlineBlock">{_l('默认权限')}</span>}
    </span>
    {![100].includes(item.roleType) && item.roleId !== '' && (
      <DropOption key={`${item.roleId}-li`} dataList={dataList} onAction={o => onAction(o, item)} />
    )}
  </li>
));
const SortableList = SortableContainer(props => {
  return (
    <div>
      {_.map(props.items, (item, index) => {
        return <Item {...props} item={item} index={index} />;
      })}
    </div>
  );
});

const Wrap = styled.div`
  height: 100%;
  .roleSearch {
    background: #fff;
    // border-bottom: 1px solid #ddd;
    border-radius: 0;
    width: 100%;
    padding-left: 0px;
  }
  .rg {
    .Font100 {
      font-size: 100px;
    }
    .icon {
      color: #e0e0e0;
    }
  }
  .Font120 {
    font-size: 120px;
  }
`;

const WrapSys = styled.div`
   {
    padding: 25px 48px 30px;
    max-width: 1250px;
    .nameInput {
      width: 300px;
      line-height: 36px;
      background: #f8f8f8;
      border-radius: 3px 3px 3px 3px;
      padding: 0 13px;
      font-weight: 400;
    }
    .desC {
      line-height: 36px;
      background: #f8f8f8;
      border-radius: 3px 3px 3px 3px;
      padding: 0 13px;
      font-weight: 400;
    }
    .desRole {
      line-height: 36px;
      background: #fef9e4;
      border-radius: 3px 3px 3px 3px;
      padding: 0 13px;
      font-weight: 400;
    }
    .toUser {
      color: #757575;
      &:hover {
        color: #2196f3;
      }
    }
  }
`;
export default class Con extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roleId: '',
      roleList: [],
      keywords: '',
    };
  }
  componentDidMount() {
    const { roleList = [], dataList = [], roleId } = this.props;
    this.setState({
      roleId: roleId || (roleList.length > 0 ? roleList[0].roleId : ''),
      roleList,
      dataList,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { roleList = [], roleId } = this.props;
    if (!_.isEqual(nextProps.roleList, roleList)) {
      this.setState({
        roleList: nextProps.roleList,
        dataList: nextProps.dataList,
      });
      if (nextProps.roleList.length < roleList.length) {
        this.setState({
          roleId: nextProps.roleId,
        });
      }
    }
  }
  handleSortEnd = ({ oldIndex, newIndex }) => {
    const { handleMoveApp } = this.props;
    if (oldIndex === newIndex) return;
    const list = this.state.roleList.slice();
    if (list.find(o => noOpType.includes(o.roleType)) && [0].includes(newIndex)) return;
    const currentItem = list.splice(oldIndex, 1)[0];
    list.splice(newIndex, 0, currentItem);
    this.setState({ roleList: list });
    handleMoveApp && handleMoveApp(list);
  };

  renderNav = () => {
    const { roleList = [], roleId, dataList, keywords } = this.state;
    return (
      <React.Fragment>
        <div className="navCon">
          <span
            className="addRole Hand Block TxtCenter"
            onClick={() => {
              if (roleList.find(o => !o.roleId)) {
                alert(_l('请保存当前新增角色'), 3);
                return;
              }
              this.props.handleChangePage(() => {
                this.setState({
                  roleId: '',
                  roleList: roleList.concat({ roleId: '', name: _l('新角色') }),
                });
              });
            }}
          >
            <Icon type="add" />
            {_l('创建角色')}
          </span>
        </div>
        <div className="search">
          <SearchInput
            className="roleSearch"
            placeholder={_l('搜索角色')}
            value={keywords}
            onChange={keywords => {
              this.setState({
                keywords,
                roleList: this.props.roleList.filter(o => o.name.indexOf(keywords) >= 0),
              });
            }}
          />
        </div>
        <div className="navCon roleSet flex">
          {roleList.length <= 0 && <p className="mTop20 Gray_75 TxtCenter">{_l('暂无相关数据')}</p>}
          <ul>
            {roleList && (
              <SortableList
                items={roleList}
                roleId={roleId}
                useDragHandle
                onSortEnd={this.handleSortEnd}
                helperClass={''}
                onChoose={roleId => {
                  this.props.handleChangePage(() => {
                    this.setState({
                      roleId,
                    });
                  });
                }}
                dataList={dataList}
                onAction={(o, data) => {
                  this.props.onAction(o, data);
                }}
              />
            )}
          </ul>
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { appId, editCallback, isForPortal, showRoleSet, projectId, setQuickTag } = this.props;
    const { roleId, roleList } = this.state;
    const data = (roleId ? this.props.roleList : roleList).find(o => o.roleId === roleId) || {};
    return (
      <Wrap className="flexRow">
        <WrapNav className="flexColumn">{this.renderNav()}</WrapNav>
        <WrapTableCon className="flex overflowHidden flexColumn Relative">
          {noOpType.includes(data.roleType) && !isForPortal ? (
            <WrapSys className={'settingForm'}>
              <div className="flexRow alignItemsCenter">
                <div className="Font14 bold flex">{_l('角色名称')}</div>
                <span
                  className="Font14 toUser Hand flexRow alignItemsCenter"
                  onClick={() => {
                    this.props.handleChangePage(() => {
                      setQuickTag({ roleId: data.roleId, tab: 'user' });
                    });
                  }}
                >
                  <Icon type={'supervisor_account'} className="mRight6 Font16" /> {_l('查看用户')}
                </span>
              </div>
              <div className="mTop8">
                <div className={'nameInput'}>{_l('管理员')}</div>
              </div>
              <div className="Font14 mTop25 bold">{_l('描述')}</div>
              <div className="mTop8">
                <div className="w100 desC">{_l('应用管理员可以配置应用，管理应用下所有数据和人员')}</div>
              </div>
              <div className="Font14 mTop25 bold">{_l('权限')}</div>
              <div className="mTop8">
                <div className="desRole">
                  {_l('拥有所有权限')}
                  <span className="Gray_9e">（{_l('应用管理员为系统内置角色，不可修改')}）</span>
                </div>
              </div>
            </WrapSys>
          ) : (
            <RoleSet
              {...this.props}
              setQuickTag={setQuickTag}
              projectId={projectId}
              roleId={roleId}
              appId={appId}
              isForPortal={isForPortal}
              onFormat={() => {
                this.setState({
                  roleList: roleList.filter(o => !!o.roleId),
                });
              }}
              editCallback={(id, isConfirm) => {
                let list = roleList.map(o => {
                  if (!o.roleId) {
                    return {
                      ...o,
                      roleId: id,
                    };
                  } else {
                    return o;
                  }
                });
                editCallback();
                if (isConfirm) {
                  this.setState({
                    roleList: list,
                  });
                } else {
                  this.setState({
                    roleList: list,
                    roleId: id,
                  });
                }
              }}
              onDelRole={() => {
                let list = roleList.filter(o => !!o.roleId);
                this.setState({
                  roleList: list,
                  roleId: (list[0] || {}).roleId,
                });
              }}
              showRoleSet={showRoleSet}
            />
          )}
        </WrapTableCon>
      </Wrap>
    );
  }
}
