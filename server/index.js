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
      if (page) {
        const pageContent = await page.screenshot({
          type: 'jpeg',
          quality: 50,
          fullPage: true,
          encoding: 'base64',
        });

        socket.emit('new-page-content', { pageContent });
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
      await page.keyboard.sendCharacter(String.fromCharCode(data.charCode));
    });

    socket.on('disconnect', async () => {
      clearInterval(timer);
      await browser.close();
    });
});
