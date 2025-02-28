import { COMPONENT_REGISTRY } from '../constants/component-registry.constant';
import { LOGGER } from '../constants/logger.constant';
import { IComponentDefinition } from '../interfaces/component-definition.interface';

export function OnRender(): MethodDecorator {
    return (componentDefinition: object, propertyKey: string | symbol): void => {
        if (typeof propertyKey !== 'string') {
            LOGGER.error(new Error(`Method key must not be a symbol ${(componentDefinition).constructor.name}.${propertyKey.toString()}`));

            return process.exit(1);
        }

        COMPONENT_REGISTRY.addOnRenderCallback(componentDefinition.constructor as IComponentDefinition, propertyKey);
    };
}
