import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import RoleNav from 'src/pages/Role/component/RolePermissions/RoleNav.jsx';
import 'src/pages/Role/style.less';
import RoleInfoCon from './RoleInfoCon';

const Wrap = styled.div`
  height: 100%;
  .roleSearch {
    background: #fff;
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

export default class Con extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      roleId: '',
      roleList: [],
      keywords: '',
      loading: true,
      roleListClone: [],
    };
  }
  componentDidMount() {
    const { roleList = [], dataList = [], roleId } = this.props;
    this.setState({
      roleId: roleId || (roleList.length > 0 ? roleList[0].roleId : ''),
      roleListClone: roleList,
      roleList,
      dataList,
      loading: false,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { roleList = [], roleId } = this.props;
    if (!_.isEqual(nextProps.roleList, roleList) || nextProps.roleId !== roleId) {
      this.setState({
        roleList: nextProps.roleList,
        dataList: nextProps.dataList,
        roleListClone: nextProps.roleList,
      });
      if (nextProps.roleList.length < roleList.length) {
        this.setState({
          roleId: nextProps.roleId,
        });
      }
    }
  }

  render() {
    const { roleId, roleList, loading, keywords, dataList, roleListClone } = this.state;
    return (
      <Wrap className="flexRow">
        <RoleNav
          {...this.props}
          roleList={roleList}
          dataList={dataList}
          roleListClone={roleListClone}
          roleId={roleId}
          onChange={data => {
            this.setState({ ...data });
          }}
          keywords={keywords}
        />
        <RoleInfoCon
          {...this.props}
          roleId={roleId}
          roleList={roleListClone}
          loading={loading}
          onChange={data => {
            this.setState({ ...data });
          }}
        />
      </Wrap>
    );
  }
}
