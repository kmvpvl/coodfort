import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals';
import { app, server } from '../src/server';
import request from 'supertest';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { IMenu } from '../src/types/eaterytypes';

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

let firstEateryId: number;

describe('employee -> eatery', () => {
    /**
     * SUCCESS
     * Creating new Employee who shall become owner of Eatery
     */
    test('Creating new Employee who shall become owner of Eatery', async () => {
        const owner = await request(app)
            .post('/employee/new')
            .set('content-type', 'application/json')
            .set('coodfort-login', 'new_employee')
            .set('coodfort-password', 'password_of_new_employee')
            .send({
                name: 'Name of new Employee',
                bio: 'Bio of new Employee',
                tags: ['tag1', 'tag2', 'tag3'],
            });
        expect(owner.statusCode).toBe(200);
    });
    /**
     * ERROR - 401 by WRONG LOGIN and password
     * Creating new Eatery by owner
     */
    test('Creating new Eatery with wrong credentials of user', async () => {
        let newEatery = await request(app)
            .post('/eatery/new')
            .set('content-type', 'application/json')
            .set('coodfort-login', 'wrong_login')
            .set('coodfort-password', 'password_of_new_employee')
            .send({
                name: 'Name of new Eatery',
                description: 'Long-long-too-long description',
                url: 'https://test.te',
                tags: ['tag1', 'tag2', 'tag3'],
            });
        expect(newEatery.statusCode).toBe(401);

        newEatery = await request(app)
            .post('/eatery/new')
            .set('content-type', 'application/json')
            .set('coodfort-login', 'new_employee')
            .set('coodfort-password', 'wrong_password')
            .send({
                name: 'Name of new Eatery',
                description: 'Long-long-too-long description',
                url: 'https://test.te',
                tags: ['tag1', 'tag2', 'tag3'],
            });
        expect(newEatery.statusCode).toBe(401);
    });

    /**
     * ERROR - 400 Expected parameter
     * Creating new Eatery by owner
     */
    test('Creating new Eatery without mandatory property Name', async () => {
        const newEatery = await request(app)
            .post('/eatery/new')
            .set('content-type', 'application/json')
            .set('coodfort-login', 'new_employee')
            .set('coodfort-password', 'password_of_new_employee')
            .send({
                name1: 'Name of new Eatery',
                descriptions: [{ url: 'https://test.te1#2', html: 'Long-long-too-long description1' }],
                urls: [{ url: 'https://test.te1', caption: 'Main url' }],
                tags: ['tag1', 'tag2', 'tag3'],
            });
        expect(newEatery.statusCode).toBe(400);
    });

    /**
     * SUCCESS
     * Creating new Eatery Korchma by owner
     */

    test('Creating new Eatery Korchma', async () => {
        const corchma = require('./corchma.json');
        const newEatery = await request(app).post('/eatery/new').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send(corchma);
        expect(newEatery.statusCode).toBe(200);
    });

    /**
     * SUCCESS
     * Creating new Eatery by owner
     */
    test('Creating new Eatery without tables', async () => {
        const newEatery = await request(app)
            .post('/eatery/new')
            .set('content-type', 'application/json')
            .set('coodfort-login', 'new_employee')
            .set('coodfort-password', 'password_of_new_employee')
            .send({
                name: 'Name of new Eatery1',
                descriptions: [{ url: 'https://test.te1#2', html: 'Long-long-too-long description1' }],
                urls: [{ url: 'https://test.te1', caption: 'Main url' }],
                tags: ['tag1', 'tag2', 'tag3'],
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
                descriptions: [{ url: 'https://test.te1#2', html: 'Long-long-too-long description1' }],
                urls: [{ url: 'https://test.te1', caption: 'Main url' }],
                tags: ['tag1', 'tag2', 'tag3'],
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
        oldEatery.body.eatery.name = 'Updateted name of Eatery1';

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
        const newEmployee = await request(app)
            .post('/employee/new')
            .set('content-type', 'application/json')
            .set('coodfort-login', 'new_employee')
            .set('coodfort-password', 'password_of_new_employee')
            .send({
                name: 'Name of new Employee',
                bio: 'Bio of new Employee',
                tags: ['tag1', 'tag2', 'tag3'],
            });
        expect(newEmployee.statusCode).toBe(400);
    });
});

describe('Meals editing', () => {
    test('Creating meal Americano', async () => {
        const meal1 = require('./americano.json');
        const newMeal1 = await request(app).post('/meal/new').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send(meal1);
        expect(newMeal1.statusCode).toBe(200);
    });
    test('Creating meal Salad', async () => {
        const meal1 = require('./salad.json');
        const newMeal1 = await request(app).post('/meal/new').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send(meal1);
        expect(newMeal1.statusCode).toBe(200);
    });
    test('Creating meal Chakhokhbilli', async () => {
        const meal1 = require('./chakhokhbili.json');
        const newMeal1 = await request(app).post('/meal/new').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send(meal1);
        expect(newMeal1.statusCode).toBe(200);
    });
    test('Creating meal Kholodets', async () => {
        const meal1 = require('./kholodets.json');
        const newMeal1 = await request(app).post('/meal/new').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send(meal1);
        expect(newMeal1.statusCode).toBe(200);
    });
    const m: IMenu = {
        headerHtml: "Here's the header of menu. The CoodFORT eatery presents:",
        footerHtml: 'The footer of entire menu. Copyright 2025',
        chapters: [
            {
                name: 'Rum & Whisky & Vodka',
                description: 'All drinks with alcohol above 40%',
                headerHtml: '',
                footerHtml: '',
                items: [
                    {
                        name: 'Vodka',
                        description: 'Smirnoff Vodka (bottled in Poland)',
                        photos: [],
                        options: [
                            {
                                volume: '50 ml',
                                amount: 150,
                                currency: 'RUR',
                                includeOptions: [{ volume: 'Coconut Syrop 10ml', amount: 50, currency: 'RUR' }],
                            },
                        ],
                    },
                ],
            },
            {
                name: 'Coffee and Tea',
                description: 'All hot drinks',
                headerHtml: '',
                footerHtml: '',
                items: [
                    {
                        name: 'Americano',
                        description: 'Americano (Brasilian arabica, middle roast)',
                        options: [
                            {
                                volume: '200 ml',
                                amount: 150,
                                currency: 'RUR',
                                includeOptions: [{ volume: 'Coconut Syrop 10ml', amount: 50, currency: 'RUR' }],
                            },
                        ],
                        photos: [
                            {
                                url: `data:image/jpeg;base64,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`,
                            },
                        ],
                    },
                ],
            },
        ],
    };
});
