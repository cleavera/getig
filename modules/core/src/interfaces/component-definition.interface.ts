export interface IComponentDefinition<T = any> { // tslint:disable-line no-any
    new(...args: Array<any>): T; // tslint:disable-line no-any
}
