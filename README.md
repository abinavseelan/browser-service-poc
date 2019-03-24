# Browser Instance as a Service

PoC for a service to provide a cloud-based browser instance

![image](https://user-images.githubusercontent.com/6417910/54875980-2a7fee00-4e2e-11e9-882e-09ad649a76d2.png)

## Setting up the project

- Clone the repository
- Install the dependencies
  ```
  $ npm install
  ```
- Run the project
  ```
  $ npm start
  ```

This serves the client-side react app via [webpack-dev-server](https://github.com/webpack/webpack-dev-server) on port 3000 and starts an express server hosting [puppeteer](https://pptr.dev) on port 1337.
