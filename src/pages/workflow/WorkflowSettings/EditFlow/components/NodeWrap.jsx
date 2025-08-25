import React from 'react';
import styled from 'styled-components';
import CreateNode from './CreateNode';

const Box = styled.div`
  min-width: 333px;
  border-radius: 24px 24px 24px 24px;
  padding: 0 12px;
  background: #ededf4;
  .workflowBranch {
    background: #ededf4 !important;
    > .flexColumn {
      .clearLeftBorder::before,
      .clearLeftBorder::after,
      .clearRightBorder::before,
      .clearRightBorder::after {
        background: #ededf4 !important;
      }
    }
  }
  .workflowBranchBtn,
  .icon-custom_add_circle {
    background: #ededf4 !important;
  }
  .Menu.List {
    margin-top: -6px !important;
  }
`;

const Title = styled.div`
  max-width: 261px;
  height: 40px;
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / 16%);
  border-radius: 20px;
  padding: 0 20px;
  position: relative;
  border: 1px solid #fff;
  transform: translateY(-20px);
  margin-bottom: -20px;
`;

const EmptyContent = styled.div`
  width: 261px;
  height: 152px;
  .workflowLineBtn {
    width: auto !important;
    .icon-custom_add_circle {
      color: #1677ff !important;
      &:hover {
        color: #1565c0 !important;
      }
    }
  }
`;

export default props => {
  const isEmpty = !props.children.filter(o => o).length;

  return (
    <div className="flexColumn">
      <section className="workflowBox pTop50 pBottom10">
        <Box className="flexColumn">
          <Title className="flexRow alignItemsCenter">
            <div className="Font14 bold ellipsis TxtCenter">{_l('数据处理')}</div>
          </Title>
          {!isEmpty || props.nodeId === props.item.id ? (
            <div className="flexColumn">
              <div className="workflowBox pTop0">
                <CreateNode {...props} />
              </div>
            </div>
          ) : (
            <EmptyContent className="flexColumn alignItemsCenter justifyContentCenter">
              <CreateNode {...props} className="pTop0" />
              <div className="bold">{_l('处理步骤')}</div>
            </EmptyContent>
          )}

          {props.children}
        </Box>
      </section>
    </div>
  );
};
