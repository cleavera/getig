import { COMPONENT_REGISTRY } from '../constants/component-registry.constant';
import { LOGGER } from '../constants/logger.constant';
import { IComponentDefinition } from '../interfaces/component-definition.interface';

export function Binding(): PropertyDecorator {
    return (componentDefinition: object, propertyKey: string | symbol): void => {
        if (typeof propertyKey !== 'string') {
            LOGGER.error(new Error(`Property key must be a symbol ${(componentDefinition).constructor.name}.${propertyKey.toString()}`));

            return process.exit(1);
        }

        COMPONENT_REGISTRY.addBinding(componentDefinition.constructor as IComponentDefinition, propertyKey);
    };
}
