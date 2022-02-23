import * as http from 'http';
import * as jwt from 'jsonwebtoken';
import openUrl from '../open-url';
import { setConfig, getConfig } from '../config';

export const ensureToken = async (): Promise<string> => {
  const token = await getToken();
  const payload = jwt.decode(token, { json: true });

  if (!payload?.exp) {
    throw new Error('Invalid token.');
  }

  if (payload.exp * 1000 < Date.now()) {
    return getToken();
  }

  return token;
};

export const getToken = async (): Promise<string> => {
  const existing = await getConfig('token');
  return existing || login();
};

export const login = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const server = http
      .createServer(async (req, resp) => {
        const done = (error?: Error) => {
          server.close();

          if (error) {
            resp.write(error.message);
            resp.end();
            reject(error);
            return;
          }

          resp.end();
        };

        if (req.url === '/callback') {
          resp.write(callbackPage);
          return done();
        }

        if (!req.url?.startsWith('/callback/consume?')) {
          resp.write('Invalid auth callback.');
          return done();
        }

        const params = Object.fromEntries(
          new URL(req.url || '/', serverUrl).searchParams,
        );

        if (params.state !== state) {
          return done(new Error('CSRF validation failed.'));
        }

        if (!params.access_token) {
          return done(new Error('Token not received.'));
        }

        await setConfig('token', params.access_token);
        resolve(params.access_token);
        resp.write(successPage);
        return done();
      })
      .listen(serverPort, (err?: Error) => {
        if (err) {
          const message = `Unable to start an HTTP server on port ${serverPort}.`;
          console.error(message);
          throw err;
        } else {
          openUrl(authorizeUrl);
        }
      });
  });
};

const serverPort = 42197;
const serverUrl = 'http://localhost:' + serverPort;
const callbackUrl = serverUrl + '/callback';
const nonce = (Date.now() + Math.random() * 10 ** 17).toString();
const state = (Date.now() + Math.random() * 10 ** 17).toString();

const callbackPage = `
    <html>
      <body>
        <script>
          location.href = location.href.replace('/callback#', '/callback/consume?');
        </script>
      </body>
    </html>
  `;

const successPage = `
    <html>
      <head>
        <title>Login Success</title>
        <style>
          body {
            font-family: sans-serif;
            -webkit-font-smoothing: antialiased;
          }
        </style>
      </head>
      <body>
        <h1>Login Successful</h1>
        <p>You can <a href="javascript:window.close()">close this window</a> and return to the command line.</p>
      </body>
    </html>
  `;

const authorizeUrl =
  'https://concept-engine.us.auth0.com/authorize?' +
  [
    `response_type=id_token token`,
    `audience=concept-engine-api`,
    `redirect_uri=${encodeURI(callbackUrl)}`,
    `client_id=EWI4gzGQrVtcOg4VT0OSNnmPY8SFhkNV`,
    `nonce=${nonce}`,
    `state=${state}`,
  ].join('&');
