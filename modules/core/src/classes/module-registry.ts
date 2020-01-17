import { $createDirectory, $writeFile } from '@cleavera/fs';
import { $isNull, Asyncable, Maybe } from '@cleavera/utils';
import { join } from 'path';
import { COMPONENT_REGISTRY } from '../constants/component-registry.constant';
import { LOGGER } from '../constants/logger.constant';
import { RESOURCE_STORE } from '../constants/resource-store.constant';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IModuleDefinition } from '../interfaces/module-definition.interface';
import { IModuleInstance } from '../interfaces/module-instance.interface';
import { IPage } from '../interfaces/page.interface';
import { IResource } from '../interfaces/resource.interface';
import { MetaData } from '../services/meta-data';

export class ModuleRegistry {
    private _registry: MetaData;

    constructor() {
        this._registry = new MetaData('Module meta data');
    }

    public register(
        moduleDefinition: IModuleDefinition,
        path: string,
        pages: Array<IPage> = [],
        children: Array<IModuleDefinition> = [],
        resources: Array<Asyncable<IResource>> = []
    ): void {
        this.setPath(moduleDefinition, path);

        resources.forEach((resource: Asyncable<IResource>): void => {
            RESOURCE_STORE.addResource(resource);
        });

        pages.forEach((page: IPage) => {
            this.addPage(moduleDefinition, page);
        });

        children.forEach((child: IModuleDefinition) => {
            this.addChild(moduleDefinition, child);
        });
    }

    public async generate(moduleInstance: IModuleInstance, basePath: string = process.cwd()): Promise<void> {
        if (moduleInstance.beforeGenerate) {
            LOGGER.silly(`Running beforeGenerate lifecycle hook for ${moduleInstance.constructor.name}`);
            await moduleInstance.beforeGenerate();
        }

        const modulePath: Maybe<string> = this.getPath(moduleInstance.constructor);

        if ($isNull(modulePath)) {
            LOGGER.error(new Error(`Module needs a path ${moduleInstance}`));

            return process.exit(1);
        }

        basePath = join(basePath, modulePath);

        LOGGER.info(`Creating module ${moduleInstance.constructor.name} at ${basePath}`);

        await $createDirectory(basePath);

        for (const page of this.getPages(moduleInstance)) {
            const pagePath: string = join(basePath, page.fileName);

            LOGGER.info(`Creating page ${page.fileName} at ${pagePath}`);

            await $writeFile(pagePath, await COMPONENT_REGISTRY.render(page.component));
        }

        for (const child of this.getChildren(moduleInstance)) {
            await this.generate(new child(), basePath);
        }
    }

    public setPath(moduleDefinition: IModuleDefinition, path: string): void {
        this._registry.set(moduleDefinition, 'path', path);
    }

    public getPath(moduleDefinition: IModuleDefinition): Maybe<string> {
        return this._registry.get(moduleDefinition, 'path');
    }

    public addPage(moduleDefinition: IModuleDefinition, page: IPage): void {
        const pages: Array<IPage> = this._registry.get(moduleDefinition, 'pages') || [];

        pages.push(page);

        this._registry.set(moduleDefinition, 'pages', pages);

        page.resources.forEach((resource: Promise<IResource>): void => {
            RESOURCE_STORE.addResource(resource);
        });
    }

    public addDynamicPage(moduleInstance: IModuleInstance, page: IPage): void {
        const pages: Array<IPage> = this._registry.get(moduleInstance, 'pages') || [];

        pages.push(page);

        this._registry.set(moduleInstance, 'pages', pages);

        page.resources.forEach((resource: Promise<IResource>): void => {
            RESOURCE_STORE.addResource(resource);
        });
    }

    public getPages(moduleInstance: IModuleInstance): Array<IPage> {
        const staticPages: Array<IPage> = this._registry.get(moduleInstance.constructor, 'pages') || [];
        const dynamicPages: Array<IPage> = this._registry.get(moduleInstance, 'pages') || [];

        return staticPages.concat(dynamicPages);
    }

    public addChild(moduleDefinition: IModuleDefinition, child: IComponentDefinition): void {
        const children: Array<IComponentDefinition> = this._registry.get(moduleDefinition, 'children') || [];

        children.push(child);

        this._registry.set(moduleDefinition, 'children', children);
    }

    public addDynamicChild(moduleInstance: IModuleInstance, child: IComponentDefinition): void {
        const children: Array<IComponentDefinition> = this._registry.get(moduleInstance, 'children') || [];

        children.push(child);

        this._registry.set(moduleInstance, 'children', children);
    }

    public getChildren(moduleInstance: IModuleInstance): Array<IComponentDefinition> {
        const staticChildren: Array<IComponentDefinition> = this._registry.get(moduleInstance.constructor, 'children') || [];
        const dynamicChildren: Array<IComponentDefinition> = this._registry.get(moduleInstance, 'children') || [];

        return staticChildren.concat(dynamicChildren);
    }
}
