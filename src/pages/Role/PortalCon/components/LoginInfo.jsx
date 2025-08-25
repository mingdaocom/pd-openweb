import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, MdAntDateRangePicker } from 'ming-ui';
import autoSize from 'ming-ui/decorators/autoSize';
import externalPortalAjax from 'src/api/externalPortal';
import PorTalTable from 'src/pages/Role/PortalCon/tabCon/portalComponent/PortalTable';
import { pageSize } from '../tabCon/util';

const AutoSizePorTalTable = autoSize(PorTalTable);

const Wrap = styled.div`
  .con {
    min-height: 400px;
    padding-bottom: 20px;
    overflow: auto;
  }
  .topAct {
    padding-bottom: 16px;
    .searchWrapper {
      width: 230px;
      height: 32px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 3px;
      vertical-align: middle;
      .cursorText {
        height: 30px;
        border: none;
      }

      display: flex;
      padding: 0 5px;
      input {
        flex: 1;
        width: 178px;
        border: none;
        line-height: 32px;
        box-sizing: border-box;
        vertical-align: top;
      }
      i::before {
        line-height: 32px;
      }
      .none {
        display: none;
      }
    }
    .ant-picker {
      width: 410px;
      .ant-picker-input {
        height: 32px;
        background: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 3px;
        padding: 0 15px;
      }
    }
  }
`;

let ajaxFn = null;
function LoginInfo(props) {
  const { appId } = props;
  const [info, setState] = useSetState({
    pageIndex: 1,
    searchValue: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setloading] = useState(false);
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);
  const columns = [
    {
      id: 'accountId',
      width: 150,
      name: _l('用户'),
      render: (control, data = {}) => {
        return (
          <div className="userImgBox">
            <span className="name mLeft5">{data.log.fullname}</span>
          </div>
        );
      },
    },
    {
      id: 'mobilePhone',
      width: 150,
      name: _l('手机号'),
      render: (control, data = {}) => {
        return data.log.mobilePhone;
      },
    },
    {
      id: 'email',
      width: 150,
      name: _l('邮箱'),
      render: (control, data = {}) => {
        return data.log.email;
      },
    },
    {
      id: 'userAgent',
      width: 170,
      name: _l('终端平台'),
      render: (control, data = {}) => {
        return data.log.userAgent;
      },
    },
    {
      id: 'ip',
      width: 150,
      name: _l('IP地址'),
      render: (control, data = {}) => {
        return data.log.ip;
      },
    },
    {
      id: 'date',
      name: _l('登录时间'),
      width: 170,
      render: (control, data = {}) => {
        return data.date;
      },
    },
  ];
  const getList = (dataInfo = {}) => {
    if (loading) {
      return;
    }
    setloading(true);
    ajaxFn && ajaxFn.abort();
    let data = { ...info, ...dataInfo };
    const { searchValue, startDate, endDate, pageIndex } = data;
    ajaxFn = externalPortalAjax.getUserActionLogs({
      appId,
      fullnameOrMobilePhone: searchValue, //用户名或手机号
      startDate,
      endDate,
      pageIndex,
      pageSize,
    });
    ajaxFn.then(res => {
      setloading(false);
      const { data = {} } = res;
      setList(data.list || []);
      setCount(data.totalCount || 0);
      setState({ ...dataInfo });
    });
  };
  useEffect(() => {
    getList();
  }, []);
  return (
    <Wrap>
      <div className="topAct">
        <span className="title InlineBlock Gray_75">{_l('用户')}</span>
        <div className="searchWrapper InlineBlock mLeft16">
          <Icon icon="search" className="Font18 Gray_9e" />
          <input
            type="text"
            className="cursorText"
            placeholder={_l('搜索用户名称、手机号、邮箱')}
            onChange={event => {
              setState({
                searchValue: _.trim(event.target.value),
              });
            }}
            onKeyDown={event => {
              if (event.which === 13) {
                getList({
                  searchValue: _.trim(event.target.value),
                  pageIndex: 1,
                });
              }
            }}
            value={info.searchValue}
          />
          {info.searchValue && (
            <Icon
              icon="cancel"
              className="Font18 Hand Gray_9e"
              onClick={() => {
                getList({
                  searchValue: '',
                  pageIndex: 1,
                });
              }}
            />
          )}
        </div>
        <span className="Gray_75 mLeft50 InlineBlock">{_l('登录时间')}</span>
        <MdAntDateRangePicker
          defaultValue={[]}
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          onChange={moments => {
            getList({
              startDate: !moments || !moments[0] ? '' : moments[0].format('YYYY-MM-DD HH:mm'),
              endDate: !moments || !moments[1] ? '' : moments[1].format('YYYY-MM-DD HH:mm'),
              pageIndex: 1,
            });
          }}
        />
      </div>
      <div className="con">
        <AutoSizePorTalTable
          columns={columns}
          noShowCheck
          list={list}
          pageSize={pageSize}
          loading={loading}
          pageIndex={info.pageIndex}
          total={count}
          changePage={pageIndex => {
            getList({ pageIndex });
          }}
        />
      </div>
    </Wrap>
  );
}

export default LoginInfo;
