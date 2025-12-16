import styled from 'styled-components';
import { CustomButton } from 'worksheet/components/Basics';

export const Con = styled.div`
  .shareCard {
    position: relative;
    width: 320px;
    min-height: 110px;
    border-radius: 3px;
    .card {
      width: 100%;
      min-height: 110px;
      background-color: #fff;
      background-clip: padding-box;
      padding: 19px 19px 18px 16px;
      position: relative;
      z-index: 9;
      box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
      display: flex;
      flex-direction: column;
      .desc {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 24px;
      }
      .title {
        line-height: 17px;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    .content {
      gap: 10px;
      display: flex;
    }
    .iconWrap {
      width: 48px;
      height: 48px;
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
    }
    .arrow {
      position: absolute;
      display: block;
      width: 22px;
      height: 22px;
      overflow: hidden;
      background: 0 0;
      pointer-events: none;
      left: 0;
      transform: translate(-100%);
      top: 12px;
      z-index: 9;
      > span {
        box-shadow: 3px 3px 7px rgba(0, 0, 0, 0.16);
        transform: translate(11px) rotate(135deg);
        position: absolute;
        inset: 0;
        display: block;
        width: 11.3137085px;
        height: 11.3137085px;
        margin: auto;
        content: '';
        pointer-events: auto;
        border-radius: 0 0 2px;
        pointer-events: none;
        &::before {
          position: absolute;
          top: -11.3137085px;
          left: -11.3137085px;
          width: 33.9411255px;
          height: 33.9411255px;
          background: #fff;
          background-repeat: no-repeat;
          background-position: -10px -10px;
          content: '';
          clip-path: path(
            'M 9.849242404917499 24.091883092036785 A 5 5 0 0 1 13.384776310850237 22.627416997969522 L 20.627416997969522 22.627416997969522 A 2 2 0 0 0 22.627416997969522 20.627416997969522 L 22.627416997969522 13.384776310850237 A 5 5 0 0 1 24.091883092036785 9.849242404917499 L 23.091883092036785 9.849242404917499 L 9.849242404917499 23.091883092036785 Z'
          );
        }
      }
    }
  }
  .wxPublicWrap {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: space-between;
    align-items: center;
    li {
      width: 60px;
      height: 60px;
      border-radius: 3px;
      border: 1px solid #e8e8e8;
      text-align: center;
      position: relative;
      &:hover {
        .current {
          opacity: 1;
        }
      }
      img {
        height: 100%;
        width: auto;
      }
      .current {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        line-height: 60px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
        opacity: 0;
        &.visible {
          opacity: 1;
        }
        .Icon {
          color: #fff;
        }
      }
    }
  }
  .fillInput {
    border-color: #ddd !important;
    &:hover {
      border-color: #ccc !important;
    }
    &:focus {
      border-color: #1e88e5 !important;
    }
  }
  .customImgWrap {
    width: 58px;
    height: 58px;
    position: relative;
    .fileImage {
      max-height: 100%;
      max-width: 100%;
      object-fit: contain;
    }
    .mask {
      opacity: 0;
      background-color: rgba(0, 0, 0, 0.6);
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      .deleteBtn {
        width: 32px;
        height: 24px;
        background: #fff;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        left: 12px;
        bottom: 12px;
        &:hover {
          .Icon {
            color: red !important;
          }
        }
      }
    }
    &:hover {
      .mask {
        opacity: 1;
      }
    }
  }
`;

export const UploadBtn = styled(CustomButton)`
  border: 1px solid #e0e0e0;
  width: fit-content;
  &.disabled {
    cursor: not-allowed;
    background-color: #f5f5f5;
  }
  .icon {
    display: inline-block;
    position: relative;
    top: 3px;
    margin-right: 4px;
    font-size: 20px;
  }
`;
