import { $isString } from '@cleavera/utils';
import { COMPONENT_REGISTRY } from '../constants/component-registry.constant';
import { LOGGER } from '../constants/logger.constant';

export function Binding(): PropertyDecorator {
    return (componentDefinition: any, propertyKey: string | symbol): void => { // tslint:disable-line no-any
        if (!$isString(propertyKey)) {
            LOGGER.error(new Error(`Property key must be a symbol ${componentDefinition.constructor.name}.${propertyKey.toString()}`));

            return process.exit(1);
        }

        COMPONENT_REGISTRY.addBinding(componentDefinition.constructor, propertyKey);
    };
}
