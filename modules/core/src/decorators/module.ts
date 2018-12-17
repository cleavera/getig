import { $createDirectory, $writeFile } from '@cleavera/fs';
import { $isNull, Asyncable, Maybe } from '@cleavera/utils';
import { join } from 'path';
import { LOGGER } from '../constants/logger.constant';
import { RESOURCE_STORE } from '../constants/resource-store.constant';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IModuleDefinition } from '../interfaces/module-definition.interface';
import { IModuleDescription } from '../interfaces/module-description.interface';
import { IModuleInstance } from '../interfaces/module-instance.interface';
import { IPage } from '../interfaces/page.interface';
import { IResource } from '../interfaces/resource.interface';
import { MetaData } from '../services/meta-data';
import { Component } from './component';

const MODULE_METADATA: MetaData = new MetaData('Module meta data');

export function Module({ path, pages = [], children = [], resources = [] }: IModuleDescription): ClassDecorator {
    return (moduleDefinition: any): void => { // tslint:disable-line no-any
        Module.register(moduleDefinition, path, pages, children, resources);
    };
}

Module.register = (
    moduleDefinition: IModuleDefinition,
    path: string,
    pages: Array<IPage> = [],
    children: Array<IModuleDefinition> = [],
    resources: Array<Asyncable<IResource>> = []
): void => {
    Module.setPath(moduleDefinition, path);

    resources.forEach((resource: Asyncable<IResource>): void => {
        RESOURCE_STORE.addResource(resource);
    });

    pages.forEach((page: IPage) => {
        Module.addPage(moduleDefinition, page);
    });

    children.forEach((child: IModuleDefinition) => {
        Module.addChild(moduleDefinition, child);
    });
};

Module.generate = async(moduleInstance: IModuleInstance, basePath: string = process.cwd()): Promise<void> => {
    if (moduleInstance.beforeGenerate) {
        LOGGER.silly(`Running beforeGenerate lifecycle hook for ${moduleInstance.constructor.name}`);
        await moduleInstance.beforeGenerate();
    }

    const modulePath: Maybe<string> = Module.getPath(moduleInstance.constructor);

    if ($isNull(modulePath)) {
        LOGGER.error(new Error(`Module needs a path ${moduleInstance}`));

        return process.exit(1);
    }

    basePath = join(basePath, modulePath);

    LOGGER.info(`Creating module ${moduleInstance.constructor.name} at ${basePath}`);

    await $createDirectory(basePath);

    for (const page of Module.getPages(moduleInstance)) {
        const pagePath: string = join(basePath, page.fileName);

        LOGGER.info(`Creating page ${page.fileName} at ${pagePath}`);

        await $writeFile(pagePath, await Component.render(page.component));
    }

    for (const child of Module.getChildren(moduleInstance)) {
        await Module.generate(new child(), basePath);
    }
};

Module.setPath = (moduleDefinition: IModuleDefinition, path: string): void => {
    MODULE_METADATA.set(moduleDefinition, 'path', path);
};

Module.getPath = (moduleDefinition: IModuleDefinition): Maybe<string> => {
    return MODULE_METADATA.get(moduleDefinition, 'path');
};

Module.addPage = (moduleDefinition: IModuleDefinition, page: IPage): void => {
    const pages: Array<IPage> = MODULE_METADATA.get(moduleDefinition, 'pages') || [];

    pages.push(page);

    MODULE_METADATA.set(moduleDefinition, 'pages', pages);

    page.resources.forEach((resource: Promise<IResource>): void => {
        RESOURCE_STORE.addResource(resource);
    });
};

Module.addDynamicPage = (moduleInstance: IModuleInstance, page: IPage): void => {
    const pages: Array<IPage> = MODULE_METADATA.get(moduleInstance, 'pages') || [];

    pages.push(page);

    MODULE_METADATA.set(moduleInstance, 'pages', pages);

    page.resources.forEach((resource: Promise<IResource>): void => {
        RESOURCE_STORE.addResource(resource);
    });
};

Module.getPages = (moduleInstance: IModuleInstance): Array<IPage> => {
    const staticPages: Array<IPage> = MODULE_METADATA.get(moduleInstance.constructor, 'pages') || [];
    const dynamicPages: Array<IPage> = MODULE_METADATA.get(moduleInstance, 'pages') || [];

    return staticPages.concat(dynamicPages);
};

Module.addChild = (moduleDefinition: IModuleDefinition, child: IComponentDefinition): void => {
    const children: Array<IComponentDefinition> = MODULE_METADATA.get(moduleDefinition, 'children') || [];

    children.push(child);

    MODULE_METADATA.set(moduleDefinition, 'children', children);
};

Module.addDynamicChild = (moduleInstance: IModuleInstance, child: IComponentDefinition): void => {
    const children: Array<IComponentDefinition> = MODULE_METADATA.get(moduleInstance, 'children') || [];

    children.push(child);

    MODULE_METADATA.set(moduleInstance, 'children', children);
};

Module.getChildren = (moduleInstance: IModuleInstance): Array<IComponentDefinition> => {
    const staticChildren: Array<IComponentDefinition> = MODULE_METADATA.get(moduleInstance.constructor, 'children') || [];
    const dynamicChildren: Array<IComponentDefinition> = MODULE_METADATA.get(moduleInstance, 'children') || [];

    return staticChildren.concat(dynamicChildren);
};
