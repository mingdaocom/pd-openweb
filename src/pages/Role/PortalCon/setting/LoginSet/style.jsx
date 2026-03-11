import styled from 'styled-components';
import cbg from '../img/center.png';
import cCbg from '../img/centerC.png';
import rbg from '../img/right.png';
import rCbg from '../img/rightC.png';

export const Wrap = styled.div`
  position: relative;
  height: calc(100% - 100px);
  overflow: hidden;
  .content {
    padding: 24px;
    height: calc(100% - 68px);
    overflow: auto;
  }
  .pageTitle {
    width: 592px;
    height: 36px;
    background: var(--color-background-primary);
    border: 1px solid var(--color-border-secondary);
    border-radius: 3px;
    padding: 0 14px;
    &:hover {
      border: 1px solid var(--color-text-disabled);
    }
    &:focus {
      border: 1px solid var(--color-primary);
    }
  }
  .uploadLogo {
    width: 240px;
    height: 80px;
    background: var(--color-background-primary);
    border: 2px dashed var(--color-border-secondary);
    border-radius: 4px;
    line-height: 80px;
    position: relative;
    color: var(--color-primary);
    padding: 6px;
    .upload_logo {
      height: 100%;
      width: 100%;
      font-weight: 500;
      i {
        vertical-align: top;
        display: inline-block;
        line-height: 62px;
      }
      span {
        font-size: 16px;
        vertical-align: top;
        display: inline-block;
        line-height: 64px;
      }
    }
    .delete {
      position: absolute;
      right: -9px;
      top: -9px;
      color: var(--color-text-tertiary);
      display: none;
      background: var(--color-background-primary);
      border-radius: 50%;
      &:hover {
        color: var(--color-primary);
      }
    }
    &:hover {
      background: rgba(33, 150, 243, 0.1);
      border: 2px dashed var(--color-primary);
      .delete {
        display: block;
      }
    }
    img {
      height: 64px;
      vertical-align: top;
      max-width: 100%;
      object-fit: contain;
    }
  }
  .pageMode {
    li {
      .iconBox {
        width: 80px;
        height: 58px;
        background: var(--color-background-secondary);
        border-radius: 6px;
        position: relative;
        background: url(${cbg}) no-repeat;
        background-size: contain;
        i {
          padding: 1px;
          position: absolute;
          right: -9px;
          top: -9px;
          background: var(--color-background-primary);
          border-radius: 50%;
        }
      }
      &.rightIconBox {
        .iconBox {
          background: url(${rbg}) no-repeat;
          background-size: contain;
        }
      }
      &.current,
      &:hover {
        .iconBox {
          background: url(${cCbg}) no-repeat;
          background-size: contain;
        }
        &.rightIconBox {
          .iconBox {
            background: url(${rCbg}) no-repeat;
            background-size: contain;
          }
        }
      }
      &.current {
        .iconBox {
          box-shadow: none;
        }
      }
      &:hover {
        .iconBox {
          box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
        }
      }
    }
  }
  .bgTypeUl {
    .bgTypeUlLi {
      height: 36px;
      padding: 0 20px;
      background: var(--color-background-primary);
      border: 1px solid var(--color-background-secondary);
      border-radius: 0px 3px 3px 0px;
      line-height: 34px;
      text-align: center;
      margin-right: -1px;
      &:nth-child(1) {
        border-radius: 3px 0px 0px 3px;
      }
      &.current {
        background: var(--color-primary);
        color: var(--color-white);
        position: relative;
        z-index: 1;
      }
    }
  }
  .colorLi {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    margin-right: 14px;
    text-align: center;
    line-height: 28px;
    vertical-align: top;
    transition: all 0.4s ease;
    margin-top: 14px;
    &:hover,
    &.current {
      transform: scale(1.22);
    }

    .check {
      color: var(--color-white);
      vertical-align: middle;
      font-size: 18px;
    }
  }
  .upload_imageBg {
    padding: 0 16px;
    background: var(--color-primary-transparent);
    border-radius: 6px;
    color: var(--color-primary);
    display: inline-block;
    height: 44px;
    line-height: 44px;
    min-width: 240px;
    font-weight: 500;
    &:hover {
      background: var(--color-primary-transparent);
    }
  }
  .hideUploadBgTxt {
    color: var(--color-text-tertiary);
    a {
      color: var(--color-primary);
    }
  }
  .loginDemo {
    position: fixed;
    left: 0;
    top: 50px;
    bottom: 0;
    right: 640px;
  }
`;
export const WrapDemo = styled.div`
  @media (max-width: 1000px) {
    display: none;
  }
  display: flex;
  background-color: rgb(245, 245, 245);
  width: calc(100% - 64px);
  height: 80%
  border-radius:8px;
  position: relative;
  left: 50%;
  top: 46%;
  transform: translate(-50%, -50%);
  background-repeat: no-repeat;
  background-size: cover;
  overflow: auto;
  .backImageUrl {
    flex: 1;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center center;
  }
`;
export const WrapCon = styled.div`
  background: var(--color-background-primary);
  width: 50%;
  padding: 50px;
  p {
    margin: 0;
    padding: 0;
  }
  img {
    max-width: 100%;
    object-fit: contain;
  }
  .logoImageUrlIcon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    div {
      height: 28px;
    }
  }
  &.isCenterCon {
    padding: 32px 32px 40px;
    width: 320px;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .pageTitleDeme {
    font-size: 16px;
    font-weight: 600;
  }

  .txtMobilePhone {
    max-width: 360px;
    height: 32px;
    background: var(--color-background-secondary);
    border-radius: 3px;
    max-width: 100%;
  }
  .loginBtn {
    max-width: 360px;
    width: 100%;
    height: 32px;
    background: var(--color-primary-transparent);
    opacity: 1;
    border-radius: 3px;
  }
  &.isR {
    .btnCon {
      max-width: 360px;
      margin: 0 auto;
      padding-top: 90px;
    }
  }
`;
