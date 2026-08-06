import React from 'react';
import styled, { css } from 'styled-components';
import { IconClose, IconFile } from './icons';
import { colors, radii, spacing, transitions, typography } from './tokens';

const Root = styled.div`
  display: flex;
  flex-wrap: ${({ $variant }) => ($variant === 'grid' ? 'wrap' : 'nowrap')};
  justify-content: ${({ $align }) => ($align === 'right' ? 'flex-end' : 'flex-start')};
  gap: ${spacing.lg};
  padding: ${({ $variant }) => ($variant === 'inline' ? '10px' : '0')};
  margin-bottom: ${({ $variant }) => ($variant === 'inline' ? '0' : '10px')};
  overflow-x: auto;
`;

const Card = styled.div`
  position: relative;
  display: flex;
  flex: 0 0 auto;
  flex-direction: column;
  width: 140px;
  min-height: 106px;
  overflow: hidden;
  border: 1px solid ${colors.border};
  border-radius: ${radii.card};
  background: ${colors.background};

  ${({ $status }) =>
    $status === 'error'
      ? css`
          border-color: ${colors.error};
          background: ${colors.errorSoft};
        `
      : null}
`;

const Preview = styled.div`
  display: flex;
  min-height: 66px;
  align-items: center;
  justify-content: center;
  background: ${({ $image }) => ($image ? colors.background : colors.backgroundSection)};

  img {
    width: 100%;
    height: 66px;
    object-fit: contain;
  }

  svg {
    width: 26px;
    height: 30px;
    color: ${colors.textMuted};
  }
`;

const Meta = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  padding: 8px 10px;
`;

const Name = styled.div`
  display: -webkit-box;
  overflow: hidden;
  color: ${colors.text};
  font-size: 12px;
  line-height: 18px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

const Status = styled.div`
  color: ${({ $status }) => ($status === 'error' ? colors.error : colors.textMuted)};
  font-size: 12px;
  line-height: 18px;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 3px;
  right: 3px;
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: ${radii.pill};
  background: ${colors.background};
  color: ${colors.textMuted};
  opacity: 0;
  cursor: pointer;
  transition:
    opacity ${transitions.hover},
    background ${transitions.hover},
    color ${transitions.hover};

  ${Card}:hover & {
    opacity: 1;
  }

  &:hover {
    background: ${colors.backgroundHover};
    color: ${colors.text};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

function getStatusLabel(item) {
  switch (item.status) {
    case 'uploading':
      return item.progress != null ? _l('上传中 %0%', item.progress) : _l('上传中');
    case 'parsing':
      return _l('解析中');
    case 'uploaded':
      return item.sizeLabel ?? _l('已上传');
    case 'error':
      return item.errorMessage ?? _l('上传失败');
    default:
      return item.sizeLabel ?? _l('待发送');
  }
}

export function Attachments({ items, variant = 'inline', align = 'left', removable = false, onRemove, className }) {
  if (!items.length) return null;

  return (
    <Root className={className} $variant={variant} $align={align}>
      {items.map(item => (
        <Card key={item.id} $status={item.status}>
          {removable && onRemove && (
            <RemoveButton type="button" onClick={() => onRemove(item.id)}>
              <IconClose />
            </RemoveButton>
          )}
          <Preview $image={item.kind === 'image'}>
            {item.kind === 'image' && item.previewUrl ? <img src={item.previewUrl} alt={item.name} /> : <IconFile />}
          </Preview>
          <Meta>
            <Name title={item.name}>{item.name}</Name>
            <Status $status={item.status}>{getStatusLabel(item)}</Status>
          </Meta>
        </Card>
      ))}
    </Root>
  );
}

export const AttachmentRemoveButton = styled.button`
  font-family: ${typography.fontFamily};
`;
