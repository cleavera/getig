export interface IComponentDefinition<T = any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    new(...args: Array<any>): T; // eslint-disable-line @typescript-eslint/no-explicit-any
}
