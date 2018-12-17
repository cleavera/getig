export interface IModuleDefinition<T = unknown> { // tslint:disable-line no-any
    new(...args: Array<any>): T; // tslint:disable-line no-any
}
