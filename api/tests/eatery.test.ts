import {afterAll, beforeAll, describe, expect, it, jest, test} from '@jest/globals';
import {app, server} from '../src/server';
import request from "supertest";
import { after, beforeEach } from 'node:test';

beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
    jest.spyOn(console, 'log').mockImplementation(jest.fn());
    jest.spyOn(console, 'debug').mockImplementation(jest.fn());
});

describe('before suit', ()=> {
    test('t1', ()=> {
        console.debug(3);
        expect(true).toBe(true);
    });
    test('t2', () => {
        console.debug(4);
        expect(true).toBe(true);
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

server.close();