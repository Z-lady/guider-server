import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import * as CryptoJS from 'crypto-js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/auth/login (POST) - should login with AES encrypted password', async () => {
    const key = 'your-secret-key';
    const plaintextPassword = 'testpassword';
    const encrypted = CryptoJS.AES.encrypt(plaintextPassword, key).toString();
    const loginBody = {
      login: 'testuser',
      password: encrypted,
    };
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginBody)
      .expect(201);
    expect(response.body).toHaveProperty('access_token');
  });
});
