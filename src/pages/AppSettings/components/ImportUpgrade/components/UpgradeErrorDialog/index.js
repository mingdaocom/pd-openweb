import React from 'react';
import { createRoot } from 'react-dom/client';
import { Dialog } from 'ming-ui';
import styled from 'styled-components';
import { UPGARADE_TYPE_LIST } from '../../../../config';
import { Fragment } from 'react';

const Wrap = styled.div`
  flex: 1;
  padding: 0 10px;
  border-radius: 4px 4px 4px 4px;
  border: 1px solid #dddddd;
`;
const Line = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #eaeaea;
`;
const Row = styled.div`
  color: #9e9e9e;
  height: 30px;
  line-height: 36px;
`;

function UpgradeErrorDialog(props) {
  return (
    <Dialog.confirm
      className="importErrorDialog"
      visible={true}
      width="640"
      title={_l('错误详情')}
      noFooter={true}
      anim={false}
    >
      <div className="flexColumn h100">
        <div className="mBottom20">{_l('以下 %0 项 升级失败', 10)}</div>
        <Wrap>
          {UPGARADE_TYPE_LIST.map(item => {
            return (
              <Line>
                {item.type === 'worksheet' && (
                  <Fragment>
                    <Row>
                      <span>{_l('工作表')}</span>
                      <span className="Gray bold">{_l(' 会员管理 ')}</span>
                      <span>{_l('中')}</span>
                      <span className="Gray bold">{_l(' 会员卡号 ')}</span>
                      <span>{_l('字段')}</span>
                      <span className="Gray bold">{_l(' 新增失败 ')}</span>
                    </Row>
                    <Row>
                      <span>{_l('工作表')}</span>
                      <span className="Gray bold">{_l(' 会员管理 ')}</span>
                      <span>{_l('中')}</span>
                      <span className="Gray bold">{_l(' 充值看板 ')}</span>
                      <span>{_l('视图')}</span>
                      <span className="Gray bold">{_l(' 更新失败 ')}</span>
                    </Row>
                  </Fragment>
                )}
                {item.type === 'customPage' && (
                  <Fragment>
                    <Row>
                      <span>{_l('自定义页面')}</span>
                      <span className="Gray bold">{_l(' 外部功能 新增失败')}</span>
                    </Row>
                  </Fragment>
                )}
                {item.type === 'role' && (
                  <Fragment>
                    <Row>
                      <span>{_l('角色')}</span>
                      <span className="Gray bold">{_l(' 技术人员 新增失败')}</span>
                    </Row>
                  </Fragment>
                )}
                {item.type === 'workflow' && (
                  <Fragment>
                    <Row>
                      <span>{_l('工作流')}</span>
                      <span className="Gray bold">{_l(' 新增充值流程 新增失败')}</span>
                    </Row>
                  </Fragment>
                )}
              </Line>
            );
          })}
        </Wrap>
      </div>
    </Dialog.confirm>
  );
}

export default ({}) => {
  const root = createRoot(document.createElement('div'));

  root.render(<UpgradeErrorDialog />);
};
