import { MODULE_REGISTRY } from '../constants/module-registry.constant';
import { IModuleDescription } from '../interfaces/module-description.interface';

export function Module({ path, pages = [], children = [], resources = [] }: IModuleDescription): ClassDecorator {
    return (moduleDefinition: any): void => { // eslint-disable-line @typescript-eslint/no-explicit-any
        MODULE_REGISTRY.register(moduleDefinition, path, pages, children, resources);
    };
}
