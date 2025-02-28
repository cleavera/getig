export interface IBeforeGenerate {
    beforeGenerate(): void | Promise<void>;
}
