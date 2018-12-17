import { Maybe } from '@cleavera/utils';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IComponentInstance } from '../interfaces/component-instance.interface';

export class MetaData {
    private readonly _META_PROPERTY_NAME: symbol;

    constructor(description: string = 'MetaData') {
        this._META_PROPERTY_NAME = Symbol(description);
    }

    public get<T = unknown>(object: IComponentDefinition | IComponentInstance, metaKey: string): Maybe<T> {
        if (!(this._META_PROPERTY_NAME in object)) {
            object[this._META_PROPERTY_NAME] = {};
        }

        return object[this._META_PROPERTY_NAME][metaKey];
    }
    public set(object: IComponentDefinition | IComponentInstance, metaKey: string, value: unknown): void {
        if (!(this._META_PROPERTY_NAME in object)) {
            object[this._META_PROPERTY_NAME] = {};
        }

        object[this._META_PROPERTY_NAME][metaKey] = value;
    }
}
