export interface IModuleDefinition<T = unknown> {
    new(...args: Array<any>): T; // eslint-disable-line @typescript-eslint/no-explicit-any
}
