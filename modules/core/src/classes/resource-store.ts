import { Asyncable } from '@cleavera/types';

import { IResource } from '../interfaces/resource.interface';

export class ResourceStore {
    private readonly _store: Array<Promise<IResource>>;

    constructor() {
        this._store = [];
    }

    public addResource(resource: Asyncable<IResource>): void {
        this._store.push(Promise.resolve(resource));
    }

    public getResources(): Array<Promise<IResource>> {
        return this._store;
    }
}
