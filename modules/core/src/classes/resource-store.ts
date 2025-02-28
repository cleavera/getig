import { IResource } from '../interfaces/resource.interface';

export class ResourceStore {
    private readonly _store: Array<Promise<IResource>>;

    constructor() {
        this._store = [];
    }

    public addResource(resource: IResource | Promise<IResource>): void {
        this._store.push(Promise.resolve(resource));
    }

    public getResources(): Array<Promise<IResource>> {
        return this._store;
    }
}
