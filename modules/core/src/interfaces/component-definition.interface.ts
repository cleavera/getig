// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IComponentDefinition<T = object> = new(...args: Array<any>) => T;
