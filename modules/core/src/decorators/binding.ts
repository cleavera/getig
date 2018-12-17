import { $isString } from '@cleavera/utils';
import { LOGGER } from '../constants/logger.constant';
import { Component } from './component';

export function Binding(): PropertyDecorator {
    return (componentDefinition: any, propertyKey: string | symbol): void => { // tslint:disable-line no-any
        if (!$isString(propertyKey)) {
            LOGGER.error(new Error(`Property key must be a symbol ${componentDefinition.constructor.name}.${propertyKey.toString()}`));

            return process.exit(1);
        }

        Component.addBinding(componentDefinition.constructor, propertyKey);
    };
}
