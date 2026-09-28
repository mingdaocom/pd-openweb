import React from 'react';
import { Icon, SearchInput } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import { WrapNav } from 'src/pages/Role/style';
import RoleList from './RoleList';

export default class Con extends React.Component {
  render() {
    const { roleList = [], keywords } = this.props;
    return (
      <WrapNav className="flexColumn">
        <React.Fragment>
          <div className="navCon">
            <Button
              block
              shape="round"
              icon={<Icon type="add" />}
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
              {_l('创建角色')}
            </Button>
          </div>
          <div className="search">
            <SearchInput
              className="roleSearch w100"
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
            {roleList.length <= 0 && <p className="mTop20 textSecondary TxtCenter">{_l('暂无相关数据')}</p>}
            {roleList.length > 0 && <RoleList {...this.props} />}
          </div>
        </React.Fragment>
      </WrapNav>
    );
  }
}
