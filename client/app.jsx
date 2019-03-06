import React, { Component } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:1337/');

import { ActionRow, Container } from './styles';

const WIDTH = 1200;
const HEIGHT = 800;

// For Mobile
// const WIDTH = 375;
// const HEIGHT = 667;

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      pages: [
        {
          content: null,
          urlBar: '',
        }
      ],
      currentPage: 0,
      urlBarFocused: false,
    }

    socket.on('enviroment-setup', () => {
      socket.emit('bootstrap', { width: WIDTH, height: HEIGHT });
    })

    socket.on('bootstrap-complete', (data) => {
      const { pages, currentPage } = this.state;

      this.setState({
        loading: false,
        pages: [
          {
            content: data.pageContent,
            urlBar: '',
          }
        ]
      });
    });

    socket.on('new-page-content', (data) => {
      const { currentPage, pages, urlBarFocused } = this.state;

      const updateObject = {
        loading: false,
        pages: data.pageList.map((page, index) => {
          if (index === currentPage) {
            return {
              content: data.pageContent,
              urlBar: urlBarFocused ? pages[currentPage].urlBar : data.url,
            };
          }

          return {
            content: pages[index] && pages[index.content] || null,
            urlBar: page,
          };
        }),
      };

      this.setState(updateObject);
    })
  }

  handleClick = (e) => {
    e.stopPropagation();

    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left; //x position within the element.
    const y = e.clientY - rect.top;  //y position within the element.

    socket.emit('click', { x, y });
  }

  handleKeyPress = (e) => {
    e.stopPropagation();

    socket.emit('keypress', {
      which: e.keyCode,
      capsLock: e.getModifierState('CapsLock'),
      shiftKey: e.shiftKey,
    });
  }

  handleBack = () => {
    socket.emit('go-back');
  }

  handleUrlUpdate = (e) => {
    const { currentPage, pages } = this.state;

    this.setState({
      pages: pages.map((page, index) => {
        if (index === currentPage) {
          return {
            content: page.content,
            urlBar: e.target.value,
          };
        }

        return page;
      })
    });
  }

  handleNavigation = (e) => {
    const { currentPage, pages } = this.state;
    e.preventDefault();

    socket.emit('navigate', { url: pages[currentPage].urlBar });
  }

  handleTabSwitch = (pageNumber) => () => {
    this.setState({
      currentPage: pageNumber,
    });

    socket.emit('tab-switch', { tabIndex: pageNumber });
  }

  render() {
    const { currentPage, pages } = this.state;
    console.log(pages[currentPage].urlBar);
    return (
      <div>
        {
          this.state.loading
            ? (
              <p>Loading Enviroment</p>
            )
            : (
              <React.Fragment>
                {
                  pages.map((page, index) => (
                    <div onClick={this.handleTabSwitch(index)}>Tab {Number(index) + 1}</div>
                  ))
                }
                <ActionRow>
                  <button onClick={this.handleBack}>
                    Go Back
                  </button>
                  <form onSubmit={this.handleNavigation}>
                    <input
                      type='text'
                      onFocus={() => this.setState({ urlBarFocused: true })}
                      onBlur={() => this.setState({ urlBarFocused: false })}
                      value={pages[currentPage].urlBar}
                      onChange={this.handleUrlUpdate}
                    />
                  </form>
                </ActionRow>
                <Container
                  style={{
                    maxWidth: WIDTH,
                    maxHeight: HEIGHT,
                    width: WIDTH,
                    height: HEIGHT,
                  }}
                  onClick={this.handleClick}
                  tabIndex='0'
                  onKeyDown={this.handleKeyPress}
                >
                  <img
                    alt='Cloud Browser'
                    src={`data:image/jpeg;base64, ${pages[currentPage].content}`}
                  />
                </Container>
              </React.Fragment>
            )
        }
      </div>
    );
  }
}

export default App;
