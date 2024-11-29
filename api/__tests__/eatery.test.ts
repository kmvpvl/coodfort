import {afterAll, beforeAll, describe, expect, it, jest, test} from '@jest/globals';
import {app, server} from '../src/server';
import request from "supertest";
import { after, beforeEach } from 'node:test';

beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'debug').mockImplementation(jest.fn());

});

afterAll(done => {
    server.close();
    done();
})

describe('employee -> eatery', ()=> {
/**
 * SUCCESS
 * Creating new Employee who shall become owner of Eatery
 */
    test('Creating new Employee who shall become owner of Eatery', async ()=> {
        const owner = await request(app).post("/employee/new")
            .set('content-type', 'application/json')
            .set('coodfort-login', 'new_employee')
            .set('coodfort-password', 'password_of_new_employee')
            .send({
                name: "Name of new Employee",
                bio: "Bio of new Employee",
                tags:"tag1,tag2,tag3"
        });
        expect(owner.statusCode).toBe(200);
    });
/**
 * ERROR - 401 by WRONG LOGIN and password
 * Creating new Eatery by owner
 */
    test('Creating new Eatery with wrong credentials of user', async ()=> {
        let newEatery = await request(app).post("/eatery/new")
        .set('content-type', 'application/json')
        .set('coodfort-login', 'wrong_login')
        .set('coodfort-password', 'password_of_new_employee')
        .send({
            name: "Name of new Eatery",
            description: "Long-long-too-long description",
            url: "https://test.te",
            tags:"tag1,tag2,tag3"
        });
        expect(newEatery.statusCode).toBe(401);

        newEatery = await request(app).post("/eatery/new")
        .set('content-type', 'application/json')
        .set('coodfort-login', 'new_employee')
        .set('coodfort-password', 'wrong_password')
        .send({
            name: "Name of new Eatery",
            description: "Long-long-too-long description",
            url: "https://test.te",
            tags:"tag1,tag2,tag3"
        });
        expect(newEatery.statusCode).toBe(401);
    });

/**
 * ERROR - 400 Expected parameter
 * Creating new Eatery by owner
 */
    test('Creating new Eatery without mandatory property Name', async ()=> {
        const newEatery = await request(app).post("/eatery/new")
            .set('content-type', 'application/json')
            .set('coodfort-login', 'new_employee')
            .set('coodfort-password', 'password_of_new_employee')
            .send({
                name1: "Name of new Eatery",
                description: "Long-long-too-long description",
                url: "https://test.te",
                tags:"tag1,tag2,tag3"
        });
        expect(newEatery.statusCode).toBe(400);
    });
/**
 * SUCCESS
 * Creating new Eatery by owner
 */
    test('Creating new Eatery', async ()=> {
        const newEatery = await request(app).post("/eatery/new")
            .set('content-type', 'application/json')
            .set('coodfort-login', 'new_employee')
            .set('coodfort-password', 'password_of_new_employee')
            .send({
                name: "Name of new Eatery",
                description: "Long-long-too-long description",
                url: "https://test.te",
                tags:"tag1,tag2,tag3"
        });
        expect(newEatery.statusCode).toBe(200);
    });
});

describe('Checking Employee security', ()=>{
    beforeAll(()=>{
        console.debug("before all");
    });
    afterAll(()=> {
        console.debug("after all");
    });

    beforeEach(()=>{
        console.debug("before each");
    });

    test('Attempt to create Eatery with blank login and password', async ()=> {
        const a = await request(app).post("/eatery/new");
        expect(a.statusCode).toBe(401)
    })
    test('Attempt to create Employee with the same login', async () => {
        const newEmployee = await request(app).post("/employee/new")
            .set('content-type', 'application/json')
            .set('coodfort-login', 'new_employee')
            .set('coodfort-password', 'password_of_new_employee')
            .send({
                name: "Name of new Employee",
                bio: "Bio of new Employee",
                tags:"tag1,tag2,tag3"
            });
        expect(newEmployee.statusCode).toBe(400);
    })
})
