import { MODULE_REGISTRY } from '../constants/module-registry.constant';
import { IModuleDescription } from '../interfaces/module-description.interface';

export function Module({ path, pages = [], children = [], resources = [] }: IModuleDescription): ClassDecorator {
    return (moduleDefinition: any): void => { // tslint:disable-line no-any
        MODULE_REGISTRY.register(moduleDefinition, path, pages, children, resources);
    };
}
