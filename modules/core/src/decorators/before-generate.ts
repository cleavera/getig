import { LOGGER } from '../constants/logger.constant';
import { MODULE_REGISTRY } from '../constants/module-registry.constant';
import { IModuleDefinition } from '../interfaces/module-definition.interface';

export function BeforeGenerate(): MethodDecorator {
    return (moduleDefinition: object, propertyKey: string | symbol): void => {
        if (typeof propertyKey !== 'string') {
            LOGGER.error(new Error(`Method key must not be a symbol ${(moduleDefinition).constructor.name}.${propertyKey.toString()}`));

            return process.exit(1);
        }

        MODULE_REGISTRY.addBeforeGenerateCallback(moduleDefinition.constructor as IModuleDefinition, propertyKey);
    };
}
