import { Maybe } from '@cleavera/utils';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IComponentInstance } from '../interfaces/component-instance.interface';

export class MetaData {
    private static META_PROPERTY_NAME: symbol = Symbol('MetaData');

    public static get<T = unknown>(object: IComponentDefinition | IComponentInstance, metaKey: string): Maybe<T> {
        if (!(this.META_PROPERTY_NAME in object)) {
            object[this.META_PROPERTY_NAME] = {};
        }

        return object[this.META_PROPERTY_NAME][metaKey];
    }
    public static set(object: IComponentDefinition | IComponentInstance, metaKey: string, value: unknown): void {
        if (!(this.META_PROPERTY_NAME in object)) {
            object[this.META_PROPERTY_NAME] = {};
        }

        object[this.META_PROPERTY_NAME][metaKey] = value;
    }
}
