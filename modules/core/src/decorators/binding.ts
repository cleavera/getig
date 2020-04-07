import { isString } from '@cleavera/utils';

import { COMPONENT_REGISTRY } from '../constants/component-registry.constant';
import { LOGGER } from '../constants/logger.constant';

export function Binding(): PropertyDecorator {
    return (componentDefinition: any, propertyKey: string | symbol): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!isString(propertyKey)) {
            LOGGER.error(new Error(`Property key must be a symbol ${(componentDefinition as Object).constructor.name}.${propertyKey.toString()}`));

            return process.exit(1);
        }

        COMPONENT_REGISTRY.addBinding(componentDefinition.constructor, propertyKey);
    };
}
