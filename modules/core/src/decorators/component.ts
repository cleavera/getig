import { $isNull, $stringReplace, Asyncable, IDict, Maybe } from '@cleavera/utils';
import { LOGGER } from '../constants/logger.constant';
import { RESOURCE_STORE } from '../constants/resource-store.constant';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IComponentDescription } from '../interfaces/component-description.interface';
import { IComponentInstance } from '../interfaces/component-instance.interface';
import { IInstanceMapping } from '../interfaces/instance-mapping.interface';
import { IResource } from '../interfaces/resource.interface';
import { MetaData } from '../services/meta-data';

const COMPONENT_METADATA: MetaData = new MetaData('Component meta data');

export function Component({ template, styles = [], scripts = [], components = [], resources = [], isDependant = false }: IComponentDescription): ClassDecorator {
    return (componentDefinition: any): void => { // tslint:disable-line no-any
        Component.setTemplate(componentDefinition, template);

        if (!Array.isArray(styles)) {
            styles = [styles];
        }

        if (!Array.isArray(scripts)) {
            scripts = [scripts];
        }

        if (!Array.isArray(resources)) {
            resources = [resources];
        }

        styles.forEach((style: Asyncable<string>) => {
            Component.addStyles(componentDefinition, style);
        });

        scripts.forEach((script: Asyncable<string>) => {
            Component.setScripts(componentDefinition, script);
        });

        components.forEach((component: IComponentDefinition) => {
            Component.addStaticComponent(componentDefinition, component);
        });

        resources.forEach((resource: Asyncable<IResource>): void => {
            RESOURCE_STORE.addResource(resource);
        });

        Component.setIsDependant(componentDefinition, isDependant);
    };
}

Component.render = async(componentInstance: IComponentInstance): Promise<string> => {
    const componentDefinition: IComponentDefinition = Component.getDefinition(componentInstance);

    LOGGER.debug(`Rendering ${componentDefinition.name}`);

    const template: Maybe<string> = await Component.getTemplate(componentDefinition);
    const bindings: Array<string> = Component.getBindings(componentDefinition);
    const components: Array<IComponentDefinition> = Component.getComponents(componentDefinition);

    if ($isNull(template)) {
        LOGGER.error(new Error(`No template ${componentDefinition.name}`));

        return process.exit(1);
    }

    if (componentInstance.beforeRender) {
        LOGGER.silly(`Running beforeRender lifecycle hook for ${componentDefinition.name}`);
        await componentInstance.beforeRender();
    }

    return Component.interpolate(componentInstance, template, bindings, components, async(): Promise<void> => {
        if (componentInstance.onRender) {
            LOGGER.silly(`Running onRender lifecycle hook for ${componentDefinition.name}`);
            await componentInstance.onRender();
        }
    });
};

Component.interpolate = async(
    context: IComponentInstance,
    template: string,
    bindings: Array<string>,
    components: Array<IComponentDefinition>,
    onRender: Maybe<() => Asyncable<void>> = null
): Promise<string> => {
    for (const component of components) {
        template = await $stringReplace(
            template,
            new RegExp(`@{${component.name}\\(((?:[A-z0-9-_]+?(?:,(?:\\s)?)?)*)\\)}`, 'g'),
            async(_match: string, args: string): Promise<string> => {
                const params: Array<unknown> = args.split(/,\s?/g).map((param: string) => {
                    for (const c of components) {
                        if (c.name === param) {
                            return c;
                        }
                    }

                    return context[param];
                });

                LOGGER.silly(`Loading child component ${component.name} with arguments ${JSON.stringify(params)}`);

                const comp: unknown = new component(...params);

                Component.addInstance(context, comp);

                return await Component.render(comp);
            });
    }

    if (!$isNull(onRender)) {
        await onRender();
    }

    for (const binding of bindings) {
        template = template.replace(new RegExp(`#{${binding}}`, 'g'), await context[binding]);
    }

    return template;
};

Component.setTemplate = (componentDefinition: IComponentDefinition, template: Asyncable<string>): void => {
    COMPONENT_METADATA.set(componentDefinition, 'template', Promise.resolve(template));
};

Component.getTemplate = async(componentDefinition: IComponentDefinition): Promise<Maybe<string>> => {
    return Promise.resolve(COMPONENT_METADATA.get(componentDefinition, 'template'));
};

Component.addStaticComponent = (componentDefinition: IComponentDefinition, component: IComponentDefinition): void => {
    const components: Array<IComponentDefinition> = COMPONENT_METADATA.get(componentDefinition, 'components') || [];

    if (Component.getIsDependant(component)) {
        components.push(component);
    } else {
        components.unshift(component);
    }

    COMPONENT_METADATA.set(componentDefinition, 'components', components);
};

Component.addDynamicComponent = (componentInstance: IComponentInstance, component: IComponentDefinition): void => {
    const components: Array<IComponentDefinition> = COMPONENT_METADATA.get(componentInstance, 'components') || [];

    components.push(component);

    COMPONENT_METADATA.set(componentInstance, 'components', components);
};

Component.getComponents = (componentInstance: IComponentInstance): Array<IComponentDefinition> => {
    const dynamicComponents: Array<IComponentDefinition> = COMPONENT_METADATA.get(componentInstance, 'components') || [];
    const staticComponents: Array<IComponentDefinition> = COMPONENT_METADATA.get(Component.getDefinition(componentInstance), 'components') || [];

    return dynamicComponents.concat(staticComponents);
};

Component.getDescendants = (componentInstance: IComponentInstance): Array<IComponentDefinition> => {
    const components: IDict<IComponentDefinition> = {};

    function _appendChildComponents(parentInstance: IComponentInstance): IDict<IComponentDefinition> {
        for (const component of Component.getComponents(parentInstance)) {
            components[component.toString()] = component;

            for (const instance of Component.getInstances(parentInstance, component)) {
                _appendChildComponents(instance);
            }
        }

        return components;
    }

    _appendChildComponents(componentInstance);

    const out: Array<IComponentDefinition> = [];

    for (const component in components) {
        if (!components.hasOwnProperty(component)) {
            continue;
        }

        out.push(components[component]);
    }

    return out;
};

Component.addBinding = (componentDefinition: IComponentDefinition, binding: string): void => {
    const bindings: Array<string> = COMPONENT_METADATA.get(componentDefinition, 'bindings') || [];

    bindings.push(binding);

    COMPONENT_METADATA.set(componentDefinition, 'bindings', bindings);
};

Component.getBindings = (componentDefinition: IComponentDefinition): Array<string> => {
    return COMPONENT_METADATA.get(componentDefinition, 'bindings') || [];
};

Component.addStyles = (componentDefinition: IComponentDefinition, styleDefinitions: Asyncable<string>): void => {
    const styles: Array<Promise<string>> = COMPONENT_METADATA.get(componentDefinition, 'styles') || [];

    styles.push(Promise.resolve(styleDefinitions));

    COMPONENT_METADATA.set(componentDefinition, 'styles', styles);
};

Component.getStyles = (componentDefinition: IComponentDefinition): Array<Promise<string>> => {
    return COMPONENT_METADATA.get(componentDefinition, 'styles') || [];
};

Component.setScripts = (componentDefinition: IComponentDefinition, script: Asyncable<string>): void => {
    const scripts: Array<Promise<string>> = COMPONENT_METADATA.get(componentDefinition, 'scripts') || [];

    scripts.push(Promise.resolve(script));

    COMPONENT_METADATA.set(componentDefinition, 'scripts', scripts);
};

Component.getScripts = (componentDefinition: IComponentDefinition): Array<Promise<string>> => {
    return COMPONENT_METADATA.get(componentDefinition, 'scripts') || [];
};

Component.getDefinition = (componentInstance: IComponentInstance): IComponentDefinition => {
    return componentInstance.constructor;
};

Component.addInstance = (parentInstance: IComponentInstance, childInstance: IComponentInstance): void => {
    const instances: Array<IInstanceMapping> = COMPONENT_METADATA.get(parentInstance, 'instances') || [];

    instances.push({
        type: childInstance.constructor,
        instance: childInstance
    });

    COMPONENT_METADATA.set(parentInstance, 'instances', instances);
    COMPONENT_METADATA.set(childInstance, 'parent', parentInstance);
};

Component.getInstances = (parentInstance: IComponentInstance, childDefinition: IComponentDefinition): Array<IComponentInstance> => {
    const instances: Array<IInstanceMapping> = COMPONENT_METADATA.get(parentInstance, 'instances') || [];

    return instances.reduce((filteredInstances: Array<IComponentInstance>, instance: IInstanceMapping) => {
        if (instance.type === childDefinition) {
            filteredInstances.push(instance.instance);
        }

        return filteredInstances;
    }, []);
};

Component.getParent = (childInstance: IComponentInstance): Maybe<IComponentInstance> => {
    return COMPONENT_METADATA.get(childInstance, 'parent');
};

Component.setIsDependant = (componentDefinition: IComponentDefinition, isDependant: boolean): void => {
    COMPONENT_METADATA.set(componentDefinition, 'isDependant', isDependant);
};

Component.getIsDependant = (componentDefinition: IComponentDefinition): boolean => {
    return COMPONENT_METADATA.get(componentDefinition, 'isDependant') || false;
};
