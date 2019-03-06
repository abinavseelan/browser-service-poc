const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 1337;
const puppeteer = require('puppeteer');
const cors = require('cors');
const morgan = require('morgan');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const devices = require('puppeteer/DeviceDescriptors');
const iPhone = devices['iPhone 6'];

app.use(bodyParser.json());
app.use(cors())
app.use(morgan('dev'));

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const getPages = async (browser) => {
  let pages = await browser.pages();
  pages.splice(0, 1);

  return pages;
}

io.on('connection', async (socket) => {
  const browser = await puppeteer.launch({
      // headless: false,
  });

  await browser.newPage();

  let pages = await getPages(browser);

  let currentPage = pages[0];

  socket.emit('enviroment-setup', { status: 'complete' });

  socket.on('bootstrap', async (data) => {
      const { width, height } = data

      // For Mobile
      // await currentPage.emulate(iPhone)

      // For Desktop
      await currentPage.setViewport({
        width,
        height,
      });

      await currentPage.goto('https://google.com', {
        waitUntil: "networkidle2"
      });

      const pageContent = await currentPage.screenshot({
        type: 'jpeg',
        quality: 50,
        fullPage: true,
        encoding: 'base64',
      });

      socket.emit('bootstrap-complete', { status: 'complete', pageContent });
    });

    socket.on('click', async (data) => {
      const {x, y} = data;

      await currentPage.mouse.move(x, y);
      await currentPage.mouse.click(x, y, {
        delay: 200,
      });

      pages = await getPages(browser);
    });

    socket.on('keypress', async (data) => {
      if (data.shiftKey) {
        await currentPage.keyboard.down('Shift');
      }

      switch (data.which) {
        case 8: {
          await currentPage.keyboard.press('Backspace');
          break;
        }

        case 13: {
          await currentPage.keyboard.press('Enter');
        }

        case 32: {
          await currentPage.keyboard.press('Space');
        }

        case 37: {
          await currentPage.keyboard.press('ArrowLeft');
          break;
        }

        case 38: {
          await currentPage.keyboard.press('ArrowUp');
          break;
        }

        case 39: {
          await currentPage.keyboard.press('ArrowRight');
          break;
        }

        case 40: {
          await currentPage.keyboard.press('ArrowDown');
          break;
        }

        default: {
          let character = data.which;

          if (data.shiftKey && data.capsLock) {
            character += 32;
          } else if (!data.shiftKey && !data.capsLock) {
            character += 32;
          }

          await currentPage.keyboard.sendCharacter(String.fromCharCode(character));
        }
      }
    });

    socket.on('go-back', async () => {
      await currentPage.goBack();
    });

    socket.on('navigate', async (data) => {
      let url = data.url;

      if (url.indexOf('http') === -1) {
        url = `http://${url}`;
      }

      await currentPage.goto(url);
    });

    socket.on('tab-switch', async (data) => {
      pages = await getPages(browser);
      currentPage = pages[data.tabIndex];
    });

    const timer = setInterval(async () => {
      if (!currentPage.isClosed()) {
        const pageContent = await currentPage.screenshot({
          type: 'jpeg',
          quality: 30,
          fullPage: true,
          encoding: 'base64',
        });

        const pageList = pages.map(page => { return page.url() });

        socket.emit('new-page-content', {
          pageContent,
          pageList,
          url: currentPage.url()
        });
      } else {
        clearInterval(timer);
      }
    }, 600);

    socket.on('disconnect', async () => {
      console.log('Clearing timer and disconnecting');
      clearInterval(timer);
      await browser.close();
    });
});
