import { Employee } from './eatery';

export interface AuthUser {
    guest?: object;
    employee?: Employee;
}
