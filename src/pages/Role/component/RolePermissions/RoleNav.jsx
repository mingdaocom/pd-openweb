import React from 'react';
import { WrapNav } from 'src/pages/Role/style';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import RoleList from './RoleList';

export default class Con extends React.Component {
  render() {
    const { roleList = [], keywords } = this.props;
    return (
      <WrapNav className="flexColumn">
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
                  this.props.onChange({
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
                this.props.onChange({
                  keywords,
                  roleList: this.props.roleListClone.filter(
                    o => o.name.toLocaleLowerCase().indexOf(keywords.toLocaleLowerCase()) >= 0,
                  ),
                });
              }}
            />
          </div>
          <div className="navCon roleSet flex">
            {roleList.length <= 0 && <p className="mTop20 Gray_75 TxtCenter">{_l('暂无相关数据')}</p>}
            {roleList.length > 0 && <RoleList {...this.props} />}
          </div>
        </React.Fragment>
      </WrapNav>
    );
  }
}
