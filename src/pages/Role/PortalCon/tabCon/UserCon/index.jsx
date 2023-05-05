import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from 'src/pages/Role/PortalCon/redux/actions';
import { WrapTableCon, WrapNav } from 'src/pages/Role/style';
import User from './User';
import PendingReview from './PendingReview';
import _ from 'lodash';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { Tooltip, Dialog } from 'ming-ui';
import { navigateTo } from 'router/navigateTo';
import DropOption from 'src/pages/Role/PortalCon/components/DropOption';
import externalPortalAjax from 'src/api/externalPortal';

const Wrap = styled.div`
  height: 100%;
  .navConList {
    overflow: auto !important;
  }
  .optionNs {
    width: 20px;
    height: 20px;
    background: transparent;
    border-radius: 3px 3px 3px 3px;
    .moreop,
    .num {
      width: 20px;
      height: 20px;
      position: absolute;
      right: 0;
      top: 0;
      line-height: 20px;
      text-align: center;
    }
    .num {
      opacity: 1;
    }
    .moreop {
      opacity: 0;
    }
  }
  .navRoleLi {
    &:hover {
      .hasOption {
        .num {
          opacity: 0;
          z-index: 0;
        }
        .moreop {
          opacity: 1;
          z-index: 1;
        }
      }
    }
  }
`;
const WrapL = styled.div`
  .roleSearch {
    background: #fff;
    border-radius: 0;
    width: 100%;
    padding-left: 0;
  }
`;
const list = [
  {
    name: _l('全部'),
    roleId: 'all',
  },
  {
    name: _l('待审核'),
    roleId: 'pendingReview',
  },
];
class Con extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roleId: 'all',
      navList: list,
      keywords: '',
    };
  }
  componentDidMount() {
    const { portal = {} } = this.props;
    const { roleList = [], quickTag } = portal;
    const listType = _.get(this.props, ['match', 'params', 'listType']);

    this.setState({
      navList: roleList,
      roleId:
        listType === 'pending'
          ? 'pendingReview'
          : quickTag.roleId
          ? quickTag.roleId
          : portal.roleId
          ? portal.roleId
          : 'all',
    });
  }

  componentWillReceiveProps(nextProps) {
    const { portal = {} } = this.props;
    const { roleList = [] } = portal;
    if (!_.isEqual(nextProps.portal.roleList, roleList)) {
      this.setState({
        navList: nextProps.portal.roleList,
      });
    }
    const listType = _.get(nextProps, ['match', 'params', 'listType']);
    if (listType === 'pending' && !_.isEqual(listType, _.get(this.props, ['match', 'params', 'listType']))) {
      this.setState({
        roleId: 'pendingReview',
      });
    }
  }

  renderCon = () => {
    const { roleId } = this.state;
    const { portal = {} } = this.props;
    const { commonCount = 0, count = 0 } = portal;
    switch (roleId) {
      case 'pendingReview':
        return <PendingReview {...this.props} roleId={roleId} title={_l('待审核')} />;
      default:
        return (
          <User
            {...this.props}
            roleId={roleId}
            title={
              roleId === 'all' ? _l('全部') : (this.props.portal.roleList.find(o => o.roleId === roleId) || {}).name
            }
            commonCount={roleId === 'all' ? commonCount : count}
          />
        );
    }
  };
  delDialog = data => {
    const { portal = {}, appId, setPortalRoleList, setFastFilters } = this.props;
    const { roleList = [] } = portal;
    return Dialog.confirm({
      title: <span className="Red">{_l('你确认删除此角色吗？')}</span>,
      buttonType: 'danger',
      description: '',
      onOk: () => {
        externalPortalAjax
          .removeExRole({
            appId,
            roleId: data.roleId,
          })
          .then(res => {
            if (res) {
              setFastFilters();
              let list = roleList.filter(o => o.roleId !== data.roleId);
              this.setState({
                navList: list,
                roleId: 'all',
              });
              setPortalRoleList(list);
              alert(_l('删除成功'));
            } else {
              alert(_l('删除失败，请稍后重试'), 2);
            }
          });
      },
    });
  };
  renderNav = () => {
    const { navList = [], roleId, keywords = '' } = this.state;
    const { portal = {}, appId, canEditApp } = this.props;
    const { commonCount = 0, unApproveCount = 0, roleCountList = [], roleList = [] } = portal;
    return (
      <React.Fragment>
        <WrapL className="">
          <div className="navCon bTBorder">
            <ul>
              {list.map(o => {
                return (
                  <li
                    className={cx('flexRow alignItemsCenter', { cur: roleId === o.roleId })}
                    onClick={() => {
                      this.setState(
                        {
                          roleId: o.roleId,
                        },
                        () => {
                          'all' === o.roleId && this.props.setFastFilters();
                          const listType = _.get(this.props, ['match', 'params', 'listType']);
                          listType === 'pending' && navigateTo(`/app/${appId}/role/external`);
                        },
                      );
                    }}
                  >
                    <span className="flex Font14">{o.name}</span>
                    <span className="num">{o.roleId === 'all' ? commonCount : unApproveCount}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="search mTop16">
            <SearchInput
              className="roleSearch"
              placeholder={_l('搜索角色')}
              value={keywords}
              onChange={keywords => {
                this.setState({
                  keywords,
                  navList: roleList.filter(o => o.name.indexOf(keywords) >= 0),
                });
              }}
            />
          </div>
        </WrapL>
        <div className="navCon navConList">
          <ul>
            {navList.length <= 0 ? (
              <div className="TxtCenter Gray_bd mTop20">{_l('无相关角色')}</div>
            ) : (
              navList.map(o => {
                let optList = [];
                optList = [
                  ...optList,
                  {
                    value: 1,
                    text: _l('编辑角色权限'),
                  },
                  {
                    value: 2,
                    type: 'err',
                    text: _l('删除'),
                  },
                ].filter(o => canEditApp);
                if (o.isDefault) {
                  optList = optList.filter(it => it.value !== 2);
                }
                let num = (roleCountList.find(it => it.roleId === o.roleId) || {}).count;
                return (
                  <li
                    className={cx('flexRow alignItemsCenter navRoleLi', { cur: roleId === o.roleId })}
                    onClick={() => {
                      this.props.setQuickTag({ roleId: o.roleId, tab: 'user' });
                      this.setState(
                        {
                          roleId: o.roleId,
                        },
                        () => {
                          const listType = _.get(this.props, ['match', 'params', 'listType']);
                          listType === 'pending' && navigateTo(`/app/${appId}/role/external`);
                          this.props.setFastFilters({
                            controlId: 'portal_role',
                            values: [o.roleId],
                            dataType: 44,
                            spliceType: 1,
                            filterType: 2, //等于
                            DateRange: 0,
                            DateRangeType: 1,
                          });
                        },
                      );
                    }}
                  >
                    <span className="flex Font14 overflow_ellipsis breakAll InlineBlock" title={o.name}>
                      {o.name}
                    </span>

                    <div className={cx('optionNs Relative', { hasOption: optList.length > 0 })}>
                      {optList.length > 0 && (
                        <DropOption
                          dataList={optList}
                          onAction={it => {
                            if (it.value === 1) {
                              this.props.setQuickTag({ roleId: o.roleId, tab: 'roleSet' });
                            } else if (it.value === 2) {
                              this.delDialog(o);
                            }
                          }}
                        />
                      )}
                      {num > 0 && <span className="num">{num}</span>}
                    </div>
                    {!!o.description && (
                      <Tooltip text={<span>{o.description}</span>} popupPlacement="top">
                        <i className="icon-info_outline Font16 Gray_9e mLeft7" />
                      </Tooltip>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </React.Fragment>
    );
  };
  render() {
    return (
      <Wrap className="flexRow">
        <WrapNav className="flexColumn">{this.renderNav()}</WrapNav>
        <WrapTableCon className="flex overflowHidden flexColumn Relative">{this.renderCon()}</WrapTableCon>
      </Wrap>
    );
  }
}

const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Con);
