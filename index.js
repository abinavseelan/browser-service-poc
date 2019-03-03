const express = require('express');
const bodyParser = require('body-parser');
const port = 1337;
const puppeteer = require('puppeteer');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(bodyParser.json());
app.use(cors())
app.use(morgan('dev'));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

app.post('/start', (req, res) => {
    const { width, height } = req.body;

    puppeteer.launch().then(async browser => {
        try {
            const page = await browser.newPage();
            await page.setViewport({
                width,
                height,
            });
    
            await page.goto('https://www.flipkart.com/account/login?ret="/"', {
                waitUntil: "networkidle2"
            });
            await page.type(`form[autocomplete="on"] input[type="text"]`, 'abinav.n.seelan@gmail.com');
            await page.type(`form[autocomplete="on"] input[type="password"]`, 'a7xandsynforlife');
            await page.click(`form[autocomplete="on"] button[type="submit"]`);
            await page.waitForNavigation({
                waitUntil: "domcontentloaded"
            });
            res.json({
                wsEndpoint: browser.wsEndpoint(),
    
            });
        } catch (err) {
            console.log(err);
            browser.close();
        }
    });
});

app.post('/query/:query', (req, res) => {
    const { wsEndpoint } = req.body;

    const {query} = req.params;

    if (!wsEndpoint) {
        return res.status(400).json({
            message: 'wsEndpoint undefined',
        });
    }

    puppeteer
        .connect({ browserWSEndpoint: wsEndpoint })
        .then(async browser => {
            try {
                const [ currentPage ] = await browser.pages();
    
                await currentPage.goto(`https://www.flipkart.com/search?q=${query}`, {
                    waitUntil: "networkidle2",
                });
    
                const pageContent = await currentPage.screenshot({
                    type: 'jpeg',
                    quality: 50,
                    fullPage: true,
                    encoding: 'base64',
                });

                res.status(200).json({
                    pageContent,
                });
            } catch (err) {
                console.log(err);
                browser.close();
            }
        });
})

app.post('/click', (req, res) => {
    const { wsEndpoint, x, y } = req.body;

    if (!wsEndpoint || typeof x === 'undefined' || typeof y === 'undefined') {
        return res.status(400).json({
            message: 'wsEndpoint, x or y is undefined',
        });
    }

    puppeteer
        .connect({browserWSEndpoint: wsEndpoint})
        .then(async browser => {
            const [currentPage] = await browser.pages();

            await currentPage.mouse.click(x, y, {
                delay: 500,
            });

            await currentPage.waitFor(1000);

            const pageContent = await currentPage.screenshot({
                type: 'jpeg',
                quality: 50,
                fullPage: true,
                encoding: 'base64',
            });

            res.status(200).json({
                pageContent,
            });
        })
})