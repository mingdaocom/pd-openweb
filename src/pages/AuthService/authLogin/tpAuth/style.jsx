import styled from 'styled-components';

export const Wrap = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: var(--color-background-secondary);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: var(--color-background-secondary);

  .tpLoginContent {
    a {
      color: var(--color-primary);
    }
    a:hover {
      text-decoration: none;
      color: var(--color-link-hover);
    }
    .contianerBGStyle {
      -moz-border-radius: 2px;
      -webkit-border-radius: 2px;
      border-radius: 2px;
      background-color: var(--color-background-primary);
      box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
      -weblit-box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
      -moz-box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
      -ms-box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
    }
    .main .container {
      width: 392px;
      margin: 0px auto;
      margin-top: 45px;
    }
  }

  .tpAutoBind {
    width: 120px;
    margin: 0px auto;
    margin-top: 100px;
  }
  .tpAutoBind .sucIcon {
    background: url('images/sucIcon.png') no-repeat center center;
    width: 32px;
    height: 32px;
    display: inline-block;
    margin-right: 10px;
  }
  .tpAutoBind .txt {
    line-height: 32px;
    color: var(--color-text-tertiary);
    font-size: 16px;
  }
  @media screen and (max-width: 500px) {
    background-color: var(--color-border-secondary);
  }
`;
