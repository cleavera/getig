import { $isNull, $stringReplace, Asyncable, Maybe } from '@cleavera/utils';
import { LOGGER } from '../constants/logger.constant';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IComponentDescription } from '../interfaces/component-description.interface';
import { IComponentInstance } from '../interfaces/component-instance.interface';
import { IInstanceMapping } from '../interfaces/instance-mapping.interface';
import { MetaData } from '../services/meta-data';

const COMPONENT_METADATA: typeof MetaData = MetaData;

export function Component({ template, styles = [], scripts = [], components = [] }: IComponentDescription): ClassDecorator {
    return (componentDefinition: any): void => { // tslint:disable-line no-any
        Component.setTemplate(componentDefinition, template);

        if (!Array.isArray(styles)) {
            styles = [styles];
        }

        if (!Array.isArray(scripts)) {
            scripts = [scripts];
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

    components.push(component);

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

Component.getStyles = (componentDefinition: IComponentDefinition): Array<Asyncable<string>> => {
    return COMPONENT_METADATA.get(componentDefinition, 'styles') || [];
};

Component.setScripts = (componentDefinition: IComponentDefinition, script: Asyncable<string>): void => {
    const scripts: Array<Promise<string>> = COMPONENT_METADATA.get(componentDefinition, 'scripts') || [];

    scripts.push(Promise.resolve(script));

    COMPONENT_METADATA.set(componentDefinition, 'scripts', scripts);
};

Component.getScripts = (componentDefinition: IComponentDefinition): Array<Asyncable<string>> => {
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
