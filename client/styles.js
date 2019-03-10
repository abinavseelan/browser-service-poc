import Styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
    font-size: 14px;
    font-family: 'Source Sans Pro', sans-serif;
  }

  body {
    margin: 0;
    padding: 0;
  }
`;

export const MockViewPort = Styled.div`
  overflow: auto;

  img {
    width: 100%;
  }
`;


export const ActionRow = Styled.div`
  display: flex;
  margin-top: 20px 0;
  background-color: white;
  border-bottom: 1px solid #eee;

  button {
    margin-left: 12px;
    background: none;
    border: none;
    cursor: pointer;
  }

  form, input {
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 8px;
    width: 90%;
  }

  input {
    background-color: #eee;
    box-shadow: none;
    border: none;
  }
`;

export const TabsRow = Styled.div`
  background-color: #eee;
  display: flex;
`;


export const Tab = Styled.div`
  ${(props) => `
    background-color: ${props.active ? 'white': '#eee'};
  `}

  padding: 8px 16px;
  border-right: 1px #eed solid;
  width: 100px;
`;

export const Container = Styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #eee;
`;

export const MockBrowser = Styled.div`
  box-shadow: 0 4px 6px rgba(50,50,93,.11), 0 1px 3px rgba(0,0,0,.08);
  border-radius: 8px;
  overflow: hidden;
`;
