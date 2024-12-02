import { afterAll, beforeAll, describe, expect, jest, test } from '@jest/globals';
import { app, server } from '../src/server';
import request from 'supertest';

beforeAll(() => {
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
        const updEatery = await request(app).post('/eatery/update').set('content-type', 'application/json').set('coodfort-login', 'new_employee').set('coodfort-password', 'password_of_new_employee').send(oldEatery.body.eatery);
        expect(updEatery.statusCode).toBe(200);
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
