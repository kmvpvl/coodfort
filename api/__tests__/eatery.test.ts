import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals';
import { app, server } from '../src/server';
import request from 'supertest';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

beforeAll(async () => {
    dotenv.config();
    const db_name = process.env.db_name;
    const db_user = process.env.db_user;
    const db_pwd = process.env.db_pwd;
    const db_port = process.env.db_port === undefined ? undefined : parseInt(process.env.db_port);
    const conn = await mysql.createConnection({
        database: db_name,
        user: db_user,
        password: db_pwd,
        port: db_port,
    });
    await conn.query(`DROP DATABASE IF EXISTS \`${db_name}\`;`);
    await conn.query(`CREATE DATABASE \`${db_name}\`;`);
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'debug').mockImplementation(jest.fn());
});

afterAll(done => {
    server.close();
    done();
});

describe('employee -> eatery', () => {
    let firstEateryId: number;
    /**
     * SUCCESS
     * Creating new Employee who shall become owner of Eatery
     */
    test('Creating new Employee who shall become owner of Eatery', async () => {
        const owner = await request(app).post('/employee/new').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send({
            name: 'Name of new Employee',
            bio: 'Bio of new Employee',
            tags: 'tag1,tag2,tag3',
        });
        expect(owner.statusCode).toBe(200);
    });
    /**
     * ERROR - 401 by WRONG LOGIN and password
     * Creating new Eatery by owner
     */
    test('Creating new Eatery with wrong credentials of user', async () => {
        let newEatery = await request(app).post('/eatery/new').set('content-type', 'application/json').set('coodfort-login', 'wrong_login').set('coodfort-password', 'password_of_new_employee').send({
            name: 'Name of new Eatery',
            description: 'Long-long-too-long description',
            url: 'https://test.te',
            tags: 'tag1,tag2,tag3',
        });
        expect(newEatery.statusCode).toBe(401);

        newEatery = await request(app).post('/eatery/new').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'wrong_password').send({
            name: 'Name of new Eatery',
            description: 'Long-long-too-long description',
            url: 'https://test.te',
            tags: 'tag1,tag2,tag3',
        });
        expect(newEatery.statusCode).toBe(401);
    });

    /**
     * ERROR - 400 Expected parameter
     * Creating new Eatery by owner
     */
    test('Creating new Eatery without mandatory property Name', async () => {
        const newEatery = await request(app).post('/eatery/new').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send({
            name1: 'Name of new Eatery',
            description: 'Long-long-too-long description',
            url: 'https://test.te',
            tags: 'tag1,tag2,tag3',
        });
        expect(newEatery.statusCode).toBe(400);
    });
    /**
     * SUCCESS
     * Creating new Eatery by owner
     */
    test('Creating new Eatery without tables', async () => {
        const newEatery = await request(app).post('/eatery/new').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send({
            name: 'Name of new Eatery1',
            description: 'Long-long-too-long description1',
            url: 'https://test.te1',
            tags: 'tag1,tag2,tag3',
        });
        firstEateryId = newEatery.body.eatery.id;
        expect(newEatery.statusCode).toBe(200);
    });

    test('Creating new Eatery with tables', async () => {
        const newEatery = await request(app)
            .post('/eatery/new')
            .set('content-type', 'application/json')
            .set('coodfort-login', 'new_employee')
            .set('coodfort-password', 'password_of_new_employee')
            .send({
                name: 'Name of new Eatery2',
                description: 'Long-long-too-long description',
                url: 'https://test.te',
                tags: 'tag1,tag2,tag3',
                tables: [{ name: 'Outside table 1' }, { name: 'Outside table 2' }],
            });
        expect(newEatery.statusCode).toBe(200);
    });

    test('Updating Eatery1 by adding 3 tables', async () => {
        const oldEatery = await request(app).post('/eatery/view').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send({
            id: firstEateryId,
        });
        expect(oldEatery.statusCode).toBe(200);

        oldEatery.body.eatery.tables.push(...[{ name: 'Inside table 101' }, { name: 'Inside table 102' }, { name: 'Inside table 103' }]);
        oldEatery.body.eatery.name = 'Updateted name of Eatery';

        const updEatery = await request(app).post('/eatery/update').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send(oldEatery.body.eatery);
        expect(updEatery.statusCode).toBe(200);
        expect(updEatery.body.eatery.created === oldEatery.body.eatery.created).toBe(true);
        //expect(updEatery.body.eatery.changed !== oldEatery.body.eatery.changed).toBe(true);
    });

    test('Updating Eatery1 by adding 2 new tables and update one o them', async () => {
        const oldEatery = await request(app).post('/eatery/view').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send({
            id: firstEateryId,
        });
        expect(oldEatery.statusCode).toBe(200);
        oldEatery.body.eatery.tables.splice(0, 2);
        oldEatery.body.eatery.tables[0].name = 'Updated name of table 103';
        oldEatery.body.eatery.tables.push(...[{ name: 'New table 105' }, { name: 'New table 106' }]);
        const updEatery = await request(app).post('/eatery/update').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send(oldEatery.body.eatery);
        expect(updEatery.statusCode).toBe(200);
        expect(updEatery.body.eatery.tables.length).toBe(3);
    });

    test('Publishing Eatery1', async () => {
        const oldEatery = await request(app).post('/eatery/publish').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send({
            id: firstEateryId,
        });
        expect(oldEatery.statusCode).toBe(200);
    });
});

describe('Checking Employee security', () => {
    test('Attempt to create Eatery with blank login and password', async () => {
        const a = await request(app).post('/eatery/new');
        expect(a.statusCode).toBe(401);
    });
    test('Attempt to create Employee with the same login', async () => {
        const newEmployee = await request(app).post('/employee/new').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send({
            name: 'Name of new Employee',
            bio: 'Bio of new Employee',
            tags: 'tag1,tag2,tag3',
        });
        expect(newEmployee.statusCode).toBe(400);
    });
});
