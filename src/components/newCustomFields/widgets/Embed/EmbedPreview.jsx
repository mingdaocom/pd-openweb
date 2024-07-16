import React, { useMemo } from 'react';
import styled from 'styled-components';
import { View } from 'src/pages/customPage/components/editWidget/view/Preview';
import _ from 'lodash';

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 24px;
  min-width: 0;

  .SingleViewHeader {
    .icon-search,
    .icon-task-later {
      &:hover {
        color: #2196f3 !important;
      }
    }
  }
`;

export default function EmbedPreview(props) {
  const { needUpdate } = props;

  return useMemo(() => {
    return (
      <Wrap>
        <View {...props} />
      </Wrap>
    );
  }, [needUpdate]);
}
