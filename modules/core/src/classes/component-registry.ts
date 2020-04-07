import { Asyncable, IDict, Maybe } from '@cleavera/types';
import { isNull, isUndefined, stringReplace } from '@cleavera/utils';

import { LOGGER } from '../constants/logger.constant';
import { RESOURCE_STORE } from '../constants/resource-store.constant';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IComponentDescription } from '../interfaces/component-description.interface';
import { IComponentInstance } from '../interfaces/component-instance.interface';
import { IInstanceMapping } from '../interfaces/instance-mapping.interface';
import { IResource } from '../interfaces/resource.interface';
import { MetaData } from '../services/meta-data';

export class ComponentRegistry {
    private readonly _registry: MetaData;

    constructor() {
        this._registry = new MetaData('Component meta data');
    }

    public register(
        {
            template,
            styles = [],
            scripts = [],
            components = [],
            resources = [],
            isDependant = false
        }: IComponentDescription,
        componentDefinition: IComponentDefinition
    ): void {
        this.setTemplate(componentDefinition, template);

        if (!Array.isArray(styles)) {
            styles = [styles];
        }

        if (!Array.isArray(scripts)) {
            scripts = [scripts];
        }

        if (!Array.isArray(resources)) {
            resources = [resources];
        }

        styles.forEach((style: Asyncable<string>): void => {
            this.addStyles(componentDefinition, style);
        });

        scripts.forEach((script: Asyncable<string>): void => {
            this.setScripts(componentDefinition, script);
        });

        components.forEach((component: IComponentDefinition): void => {
            this.addStaticComponent(componentDefinition, component);
        });

        resources.forEach((resource: Asyncable<IResource>): void => {
            RESOURCE_STORE.addResource(resource);
        });

        this.setIsDependant(componentDefinition, isDependant);
    }

    public setIsDependant(componentDefinition: IComponentDefinition, isDependant: boolean): void {
        this._registry.set(componentDefinition, 'isDependant', isDependant);
    }

    public getIsDependant(componentDefinition: IComponentDefinition): boolean {
        return this._registry.get(componentDefinition, 'isDependant') ?? false;
    }

    public async render(componentInstance: IComponentInstance): Promise<string> {
        const componentDefinition: IComponentDefinition = this.getDefinition(componentInstance);

        LOGGER.debug(`Rendering ${componentDefinition.name}`);

        const template: Maybe<string> = await this.getTemplate(componentDefinition);
        const bindings: Array<string> = this.getBindings(componentDefinition);
        const components: Array<IComponentDefinition> = this.getComponents(componentDefinition);

        if (isNull(template)) {
            LOGGER.error(new Error(`No template ${componentDefinition.name}`));

            return process.exit(1);
        }

        if (!isUndefined(componentInstance.beforeRender)) {
            LOGGER.silly(`Running beforeRender lifecycle hook for ${componentDefinition.name}`);
            await componentInstance.beforeRender();
        }

        return this.interpolate(componentInstance, template, bindings, components, async(): Promise<void> => {
            if (!isUndefined(componentInstance.onRender)) {
                LOGGER.silly(`Running onRender lifecycle hook for ${componentDefinition.name}`);
                await componentInstance.onRender();
            }
        });
    }

    public async interpolate(
        context: IComponentInstance,
        template: string,
        bindings: Array<string>,
        components: Array<IComponentDefinition>,
        onRender: Maybe<() => Asyncable<void>> = null
    ): Promise<string> {
        for (const component of components) {
            template = await stringReplace(
                template,
                new RegExp(`@{${component.name}\\(((?:[A-z0-9-_]+?(?:,(?:\\s)?)?)*)\\)}`, 'g'),
                async([_match, args]: RegExpExecArray): Promise<string> => {
                    const params: Array<unknown> = args.split(/,\s?/g).map((param: string): unknown => {
                        for (const c of components) {
                            if (c.name === param) {
                                return c;
                            }
                        }

                        return context[param];
                    });

                    LOGGER.silly(`Loading child component ${component.name} with arguments ${JSON.stringify(params)}`);

                    const comp: unknown = new component(...params);

                    this.addInstance(context, comp);

                    return await this.render(comp);
                }
            );
        }

        if (!isNull(onRender)) {
            await onRender();
        }

        for (const binding of bindings) {
            template = template.replace(new RegExp(`#{${binding}}`, 'g'), await context[binding]);
        }

        return template;
    }

    public setTemplate(componentDefinition: IComponentDefinition, template: Asyncable<string>): void {
        this._registry.set(componentDefinition, 'template', Promise.resolve(template));
    }

    public async getTemplate(componentDefinition: IComponentDefinition): Promise<Maybe<string>> {
        return Promise.resolve(this._registry.get(componentDefinition, 'template'));
    }

    public addStaticComponent(componentDefinition: IComponentDefinition, component: IComponentDefinition): void {
        const components: Array<IComponentDefinition> = this._registry.get(componentDefinition, 'components') ?? [];

        if (this.getIsDependant(component)) {
            components.push(component);
        } else {
            components.unshift(component);
        }

        this._registry.set(componentDefinition, 'components', components);
    }

    public addDynamicComponent(componentInstance: IComponentInstance, component: IComponentDefinition): void {
        const components: Array<IComponentDefinition> = this._registry.get(componentInstance, 'components') ?? [];

        components.push(component);

        this._registry.set(componentInstance, 'components', components);
    }

    public getComponents(componentInstance: IComponentInstance): Array<IComponentDefinition> {
        const dynamicComponents: Array<IComponentDefinition> = this._registry.get(componentInstance, 'components') ?? [];
        const staticComponents: Array<IComponentDefinition> = this._registry.get(this.getDefinition(componentInstance), 'components') ?? [];

        return dynamicComponents.concat(staticComponents);
    }

    public getDescendants(componentInstance: IComponentInstance): Array<IComponentDefinition> {
        const components: IDict<IComponentDefinition> = this._getRecursiveChildComponents(componentInstance);
        const out: Array<IComponentDefinition> = [];

        for (const component in components) {
            if (!components.hasOwnProperty(component)) {
                continue;
            }

            out.push(components[component]);
        }

        return out;
    }

    public addBinding(componentDefinition: IComponentDefinition, binding: string): void {
        const bindings: Array<string> = this._registry.get(componentDefinition, 'bindings') ?? [];

        bindings.push(binding);

        this._registry.set(componentDefinition, 'bindings', bindings);
    }

    public getBindings(componentDefinition: IComponentDefinition): Array<string> {
        return this._registry.get(componentDefinition, 'bindings') ?? [];
    }

    public addStyles(componentDefinition: IComponentDefinition, styleDefinitions: Asyncable<string>): void {
        const styles: Array<Promise<string>> = this._registry.get(componentDefinition, 'styles') ?? [];

        styles.push(Promise.resolve(styleDefinitions));

        this._registry.set(componentDefinition, 'styles', styles);
    }

    public getStyles(componentDefinition: IComponentDefinition): Array<Promise<string>> {
        return this._registry.get(componentDefinition, 'styles') ?? [];
    }

    public setScripts(componentDefinition: IComponentDefinition, script: Asyncable<string>): void {
        const scripts: Array<Promise<string>> = this._registry.get(componentDefinition, 'scripts') ?? [];

        scripts.push(Promise.resolve(script));

        this._registry.set(componentDefinition, 'scripts', scripts);
    }

    public getScripts(componentDefinition: IComponentDefinition): Array<Promise<string>> {
        return this._registry.get(componentDefinition, 'scripts') ?? [];
    }

    public getDefinition(componentInstance: IComponentInstance): IComponentDefinition {
        return componentInstance.constructor;
    }

    public addInstance(parentInstance: IComponentInstance, childInstance: IComponentInstance): void {
        const instances: Array<IInstanceMapping> = this._registry.get(parentInstance, 'instances') ?? [];

        instances.push({
            type: childInstance.constructor,
            instance: childInstance
        });

        this._registry.set(parentInstance, 'instances', instances);
        this._registry.set(childInstance, 'parent', parentInstance);
    }

    public getInstances(parentInstance: IComponentInstance, childDefinition: IComponentDefinition): Array<IComponentInstance> {
        const instances: Array<IInstanceMapping> = this._registry.get(parentInstance, 'instances') ?? [];

        return instances.reduce((filteredInstances: Array<IComponentInstance>, instance: IInstanceMapping): IComponentInstance => {
            if (instance.type === childDefinition) {
                filteredInstances.push(instance.instance);
            }

            return filteredInstances;
        }, []);
    }

    public getParent(childInstance: IComponentInstance): Maybe<IComponentInstance> {
        return this._registry.get(childInstance, 'parent');
    }

    private _getRecursiveChildComponents(parentInstance: IComponentInstance, components: IDict<IComponentDefinition> = {}): IDict<IComponentDefinition> {
        for (const component of this.getComponents(parentInstance)) {
            components[component.toString()] = component;

            for (const instance of this.getInstances(parentInstance, component)) {
                this._getRecursiveChildComponents(instance, components);
            }
        }

        return components;
    }
}
