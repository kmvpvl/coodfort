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

describe('\'employee/new\' path test', ()=> {
    test('Create new Employee', async ()=> {
        const newEmployee = await request(app).post("/employee/new")
            .set('content-type', 'application/json')
            .set('coodfort-login', 'new_employee')
            .set('coodfort-password', 'password_of_new_employee')
            .send({
                name: "Name of new Employee",
                bio: "Bio of new Employee",
                tags:"tag1,tag2,tag3"
            });
        expect(newEmployee.statusCode).toBe(200);
    });
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
});

describe('creating structure', ()=>{
    beforeAll(()=>{
        console.debug("before all");
    });
    afterAll(()=> {
        console.debug("after all");
    });

    beforeEach(()=>{
        console.debug("before each");
    });

    test('test1', async ()=> {
        console.debug(1);
        const t = request(app);
        const a = await t.post("/eatery/edit");
        expect(a.statusCode).toBe(401)
    })
    test('test2', ()=> {
        console.debug(2);
        expect(true).toBe(true);
    })
})
