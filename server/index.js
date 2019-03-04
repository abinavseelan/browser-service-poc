const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 1337;
const puppeteer = require('puppeteer');
const cors = require('cors');
const morgan = require('morgan');
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(bodyParser.json());
app.use(cors())
app.use(morgan('dev'));

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

io.on('connection', async (socket) => {
  const browser = await puppeteer.launch({
      // headless: false,
  });
  const page = await browser.newPage();

  socket.emit('enviroment-setup', { status: 'complete' });

  socket.on('bootstrap', async (data) => {
      const { width, height } = data;
      await page.setViewport({
        width,
        height,
      });

      await page.goto('https://google.com', {
        waitUntil: "networkidle2"
      });

      const pageContent = await page.screenshot({
        type: 'jpeg',
        quality: 50,
        fullPage: true,
        encoding: 'base64',
      });

      socket.emit('bootstrap-complete', { status: 'complete', pageContent });
    });

    const timer = setInterval(async () => {
      if (!page.isClosed()) {
        const pageContent = await page.screenshot({
          type: 'jpeg',
          quality: 50,
          fullPage: true,
          encoding: 'base64',
        });

        socket.emit('new-page-content', { pageContent, url: page.url() });
      } else {
        clearInterval(timer);
      }
    }, 600);

    socket.on('click', async (data) => {
      const {x, y} = data;

      await page.mouse.move(x, y);
      await page.mouse.click(x, y);
    });

    socket.on('keypress', async (data) => {
      if (data.shiftKey) {
        await page.keyboard.down('Shift');
      }

      switch (data.which) {
        case 8: {
          await page.keyboard.press('Backspace');
          break;
        }

        case 13: {
          await page.keyboard.press('Enter');
        }

        case 32: {
          await page.keyboard.press('Space');
        }

        case 37: {
          await page.keyboard.press('ArrowLeft');
          break;
        }

        case 38: {
          await page.keyboard.press('ArrowUp');
          break;
        }

        case 39: {
          await page.keyboard.press('ArrowRight');
          break;
        }

        case 40: {
          await page.keyboard.press('ArrowDown');
          break;
        }

        default: {
          let character = data.which;

          if (data.shiftKey && data.capsLock) {
            character += 32;
          } else if (!data.shiftKey && !data.capsLock) {
            character += 32;
          }

          await page.keyboard.sendCharacter(String.fromCharCode(character));
        }
      }
    });

    socket.on('go-back', async () => {
      await page.goBack();
    });

    socket.on('navigate', async (data) => {
      let url = data.url;

      if (url.indexOf('http') === -1) {
        url = `http://${url}`;
      }

      await page.goto(url);
    });

    socket.on('disconnect', async () => {
      console.log('Clearing timer and disconnecting');
      clearInterval(timer);
      await browser.close();
    });
});
