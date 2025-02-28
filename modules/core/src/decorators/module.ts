import { MODULE_REGISTRY } from '../constants/module-registry.constant';
import { IModuleDefinition } from '../interfaces/module-definition.interface';
import { IModuleDescription } from '../interfaces/module-description.interface';

export function Module({ path, pages = [], children = [], resources = [] }: IModuleDescription): ClassDecorator {
    return (moduleDefinition: object): void => {
        MODULE_REGISTRY.register(moduleDefinition as IModuleDefinition, path, pages, children, resources);
    };
}
