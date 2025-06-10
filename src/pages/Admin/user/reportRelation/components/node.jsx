import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv } from 'ming-ui';
import {
  addSubordinates,
  fetchSubordinates,
  loadMore,
  removeStructure,
  replaceStructure,
  updateCollapse,
} from '../actions';
import { selectUser } from '../common';
import Item from './item';
import NoData from './noData';

const LoadWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

class Node extends Component {
  static propTypes = {
    subordinates: PropTypes.arrayOf(PropTypes.string),
    isFirst: PropTypes.bool,
    isLast: PropTypes.bool,
  };

  static defaultProps = {
    isFirst: true,
    isLast: true,
  };

  renderChilds() {
    const {
      subordinates,
      collapsed,
      id,
      auth,
      pageIndex,
      dispatch,
      moreLoading,
      subTotalCount,
      firstLevelLoading,
      dataFromProps = false,
      data = {},
      onChangeData,
      disableMore = false,
      sourceData = [],
    } = this.props;

    if (subordinates && !collapsed) {
      const sortSubordinates = !_.isEmpty(sourceData)
        ? _.orderBy(sourceData, ['status'], ['desc'])
            .map(v => v.accountId)
            .filter(v => _.includes(subordinates, v))
        : subordinates;

      return (
        <div className="childNodeList">
          {sortSubordinates.map((child, index) => {
            const _props = {
              id: child,
              parentId: id,
              level: this.props.level + 1,
              isFirst: index === 0,
              isLast: index === sortSubordinates.length - 1,
              auth,
            };

            if (dataFromProps) {
              _props.onChangeData = onChangeData;
              _props.data = data;
              _props.dataFromProps = dataFromProps;
            }

            return <ConnectedNode {..._props} key={_props.id} />;
          })}
          {!disableMore && subTotalCount > sortSubordinates.length && (
            <div
              className="loadMore Hand"
              onClick={() => {
                if (moreLoading) return;
                dispatch(loadMore(id, pageIndex + 1));
              }}
            >
              {(!id && firstLevelLoading) || (id && moreLoading) ? _l('加载中') : _l('更多')}
            </div>
          )}
        </div>
      );
    }
  }

  toggle() {
    const { dispatch, id, collapsed, subordinates, hasSub } = this.props;
    dispatch(updateCollapse(id, collapsed));
    if (collapsed && hasSub && !subordinates) {
      dispatch(fetchSubordinates(id));
    }
  }

  renderToggleButton() {
    const { collapsed, id, hasSub, dataFromProps, onChangeData, data, subordinates } = this.props;
    if (hasSub || (subordinates && subordinates.length)) {
      const font = collapsed ? 'plus' : 'minus';
      return (
        <Icon
          className="toggleButton"
          icon={font}
          onClick={() => {
            if (dataFromProps) {
              onChangeData({ type: 'EXPEND', value: !collapsed, id: id });
            } else this.toggle();
          }}
        />
      );
    }
  }

  add() {
    const { id, dispatch, dataFromProps, onChangeData } = this.props;
    selectUser({
      title: _l('添加下属'),
      accountId: id,
      callback: accounts => {
        let param = { id, accounts };
        if (dataFromProps) {
          param.callback = () => onChangeData({ type: 'ADD', value: accounts, id });
        }
        dispatch(addSubordinates(param));
      },
    });
  }

  replace() {
    const { id, parentId, dispatch, onChangeData, dataFromProps } = this.props;
    selectUser({
      title: _l('替换成员'),
      accountId: id,
      unique: true,
      callback: accounts => {
        let param = {
          parentId,
          account: accounts[0],
          replacedAccountId: id,
        };
        if (dataFromProps) {
          param.callback = () => onChangeData({ type: 'REPLACE', value: accounts[0], id: parentId });
        }
        dispatch(replaceStructure(param));
      },
    });
  }

  remove() {
    const { id, parentId, fullname, dispatch, dataFromProps, onChangeData } = this.props;
    Dialog.confirm({
      title: _l('确认移除 %0 ?', fullname),
      description: _l('移除后，其下属成员也将从汇报关系中移除'),
      onOk: () => {
        let param = {
          parentId,
          accountId: id,
        };
        if (dataFromProps) {
          param.callback = () => onChangeData({ type: 'REMOVE', id: parentId, values: id });
        }
        dispatch(removeStructure(param));
      },
    });
  }

  renderItem() {
    const { auth, id, fullname, avatar, department, job, status, subordinates, isHighLight, subTotalCount } =
      this.props;
    const itemProps = {
      id,
      fullname,
      avatar,
      department,
      job,
      subordinates,
      status,
      isHighLight,
      auth,
      subTotalCount,
      add: this.add.bind(this),
      replace: this.replace.bind(this),
      remove: this.remove.bind(this),
    };

    return <Item {...itemProps} />;
  }

  shouldComponentUpdate(nextProps) {
    return !_.isEqual(this.props, nextProps);
  }

  render() {
    const { isFirst, isLast, id, subordinates, auth, isLoading, pageIndex } = this.props;
    if (isLoading && !id && pageIndex === 1) {
      return (
        <LoadWrap>
          <LoadDiv />
        </LoadWrap>
      );
    }
    if (!id) {
      return (
        <div className="rootNodeItem">
          <div className="Font24 pLeft8">
            <Icon icon="company" className="TxtMiddle Gray_9e" />
            <span className="Font16 TxtMiddle mLeft10 mRight10">{this.props.fullname}</span>
            {auth ? (
              <span className="Hand Font14 TxtMiddle Gray_9e" onClick={this.add.bind(this)}>
                <Icon className="Font24 mRight10 TxtMiddle" icon="add-member2" />
                <span className="TxtMiddle">{_l('添加下属')}</span>
              </span>
            ) : null}
          </div>
          {subordinates && subordinates.length ? <div className="rootNodeSheet" /> : <NoData />}
          {this.renderChilds()}
        </div>
      );
    } else {
      return (
        <div
          className={cx('nodeItem', { last: isLast, first: isFirst })}
          ref={el => {
            this.node = el;
          }}
        >
          {this.renderItem()}
          {this.renderToggleButton()}
          {this.renderChilds()}
        </div>
      );
    }
  }
}

const ConnectedNode = connect((state, ownProps) => {
  const {
    entities: { users },
    highLightId,
    isLoading,
    firstLevelLoading,
  } = state;
  const user = ownProps.dataFromProps
    ? {
        ...ownProps.data[ownProps.id],
        disableMore: ownProps.data[ownProps.id].disableMore,
      }
    : users[ownProps.id];

  return {
    ...user,
    // ...ownProps,
    level: ownProps.level,
    isHighLight: highLightId === ownProps.id,
    isLoading,
    firstLevelLoading: ownProps.dataFromProps ? ownProps.firstLevelLoading : firstLevelLoading,
  };
})(Node);

ConnectedNode.defaultProps = {
  id: '',
  level: 0, // 层级  公司 为0 递增
};

export default ConnectedNode;
