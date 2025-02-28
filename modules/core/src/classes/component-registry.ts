import { LOGGER } from '../constants/logger.constant';
import { RESOURCE_STORE } from '../constants/resource-store.constant';
import { stringReplace } from '../helpers/string-replace';
import { IComponentDefinition } from '../interfaces/component-definition.interface';
import { IComponentDescription } from '../interfaces/component-description.interface';
import { IComponentInstance } from '../interfaces/component-instance.interface';
import { IInstanceMapping } from '../interfaces/instance-mapping.interface';
import { IResource } from '../interfaces/resource.interface';
import { MetaData } from '../services/meta-data';

interface ComponentMeta {
  isDependant: boolean | null;
  template: Promise<string> | null;
  components: Array<IComponentDefinition> | null;
  bindings: Array<string> | null;
  styles: Array<Promise<string>> | null;
  scripts: Array<Promise<string>> | null;
  instances: Array<IInstanceMapping> | null;
  parent: IComponentInstance | null; // eslint-disable-line @typescript-eslint/no-redundant-type-constituents
  onRenderCallbacks: Array<string> | null;
  beforeRenderCallbacks: Array<string> | null;
}

export class ComponentRegistry {
  private readonly _registry: MetaData<ComponentMeta>;

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

    styles.forEach((style: string | Promise<string>): void => {
      this.addStyles(componentDefinition, style);
    });

    scripts.forEach((script: string | Promise<string>): void => {
      this.setScripts(componentDefinition, script);
    });

    components.forEach((component: IComponentDefinition): void => {
      this.addStaticComponent(componentDefinition, component);
    });

    resources.forEach((resource: IResource | Promise<IResource>): void => {
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

    const template: string | null = await this.getTemplate(componentDefinition);
    const bindings: Array<Extract<keyof IComponentInstance, string>> = this.getBindings(componentDefinition);
    const components: Array<IComponentDefinition<IComponentInstance>> = this.getStaticComponents(componentDefinition);

    if (template === null) {
      LOGGER.error(new Error(`No template ${componentDefinition.name}`));

      return process.exit(1);
    }

    const beforeRenderCallbacks: Array<string> = this.getBeforeRenderCallbacks(componentDefinition);

    if (beforeRenderCallbacks.length > 0) {
      LOGGER.silly(`Running beforeRender lifecycle hook for ${componentDefinition.name}`);

      await Promise.all(beforeRenderCallbacks.map(async (propertyName: string) => {
        await componentInstance[propertyName]?.();
      }));
    }

    const onRenderCallbacks: Array<string> = this.getOnRenderCallbacks(componentDefinition);

    return this.interpolate(componentInstance, template, bindings, components, async (): Promise<void> => {
      if (onRenderCallbacks.length > 0) {
        LOGGER.silly(`Running onRender lifecycle hook for ${componentDefinition.name}`);

        await Promise.all(onRenderCallbacks.map(async (propertyName: string) => {
          await componentInstance[propertyName]?.();
        }));
      }
    });
  }

  public async interpolate(
    context: IComponentInstance,
    template: string,
    bindings: Array<Extract<keyof IComponentInstance, string>>,
    components: Array<IComponentDefinition<IComponentInstance>>,
    onRender: (() => void | Promise<void>) | null = null
  ): Promise<string> {
    for (const component of components) {
      template = await stringReplace(
        template,
        new RegExp(`@{${component.name}\\(((?:[A-z0-9-_]+?(?:,(?:\\s)?)?)*)\\)}`, 'g'),
        async ([, args]: RegExpExecArray): Promise<string> => {
          const params: Array<unknown> = this._parseParams((args.split(/,\s?/g) as Array<keyof IComponentInstance>), context, components);

          LOGGER.silly(`Loading child component ${component.name} with arguments ${JSON.stringify(params)}`);

          const comp: IComponentInstance = new component(...params);

          this.addInstance(context, comp);

          return this.render(comp);
        }
      );
    }

    if (onRender !== null) {
      await onRender();
    }

    for (const binding of bindings) {
      template = template.replace(new RegExp(`#{${binding}}`, 'g'), (await (context[binding] as unknown as Promise<string>)));
    }

    return template;
  }

  public setTemplate(componentDefinition: IComponentDefinition, template: string | Promise<string>): void {
    this._registry.set(componentDefinition, 'template', Promise.resolve(template));
  }

  public async getTemplate(componentDefinition: IComponentDefinition): Promise<string | null> {
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

  public getInstanceComponents(componentInstance: IComponentInstance): Array<IComponentDefinition> {
    const dynamicComponents: Array<IComponentDefinition> = this._registry.get(componentInstance, 'components') ?? [];
    const staticComponents: Array<IComponentDefinition> = this._registry.get(this.getDefinition(componentInstance), 'components') ?? [];

    return dynamicComponents.concat(staticComponents);
  }

  public getStaticComponents(componentDefinition: IComponentDefinition): Array<IComponentDefinition<IComponentInstance>> {
    return this._registry.get(componentDefinition, 'components') ?? [];
  }

  public getDescendants(componentInstance: IComponentInstance): Array<IComponentDefinition> {
    const components: Record<string, IComponentDefinition> = this._getRecursiveChildComponents(componentInstance);
    const out: Array<IComponentDefinition> = [];

    for (const component in components) {
      if (!Object.prototype.hasOwnProperty.call(components, component)) {
        continue;
      }

      out.push(components[component]);
    }

    return out;
  }

  public addBeforeRenderCallback(componentDefinition: IComponentDefinition, propertyName: string): void {
    const beforeRender: Array<string> = this._registry.get(componentDefinition, 'beforeRenderCallbacks') ?? [];

    beforeRender.push(propertyName);

    this._registry.set(componentDefinition, 'beforeRenderCallbacks', beforeRender);
  }

  public getBeforeRenderCallbacks(componentDefinition: IComponentDefinition): Array<Extract<keyof IComponentInstance, string>> {
    return this._registry.get(componentDefinition, 'beforeRenderCallbacks') ?? [];
  }


  public addOnRenderCallback(componentDefinition: IComponentDefinition, propertyName: string): void {
    const onRenders: Array<string> = this._registry.get(componentDefinition, 'onRenderCallbacks') ?? [];

    onRenders.push(propertyName);

    this._registry.set(componentDefinition, 'onRenderCallbacks', onRenders);
  }

  public getOnRenderCallbacks(componentDefinition: IComponentDefinition): Array<Extract<keyof IComponentInstance, string>> {
    return this._registry.get(componentDefinition, 'onRenderCallbacks') ?? [];
  }

  public addBinding(componentDefinition: IComponentDefinition, binding: string): void {
    const bindings: Array<string> = this._registry.get(componentDefinition, 'bindings') ?? [];

    bindings.push(binding);

    this._registry.set(componentDefinition, 'bindings', bindings);
  }

  public getBindings(componentDefinition: IComponentDefinition): Array<Extract<keyof IComponentInstance, string>> {
    return this._registry.get(componentDefinition, 'bindings') ?? [];
  }

  public addStyles(componentDefinition: IComponentDefinition, styleDefinitions: string | Promise<string>): void {
    const styles: Array<Promise<string>> = this._registry.get(componentDefinition, 'styles') ?? [];

    styles.push(Promise.resolve(styleDefinitions));

    this._registry.set(componentDefinition, 'styles', styles);
  }

  public getStyles(componentDefinition: IComponentDefinition): Array<Promise<string>> {
    return this._registry.get(componentDefinition, 'styles') ?? [];
  }

  public setScripts(componentDefinition: IComponentDefinition, script: string | Promise<string>): void {
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
      type: this.getDefinition(childInstance),
      instance: childInstance
    });

    this._registry.set(parentInstance, 'instances', instances);
    this._registry.set(childInstance, 'parent', parentInstance);
  }

  public getInstances(parentInstance: IComponentInstance, childDefinition: IComponentDefinition): Array<IComponentInstance> {
    const instances: Array<IInstanceMapping> = this._registry.get(parentInstance, 'instances') ?? [];

    return instances.reduce((filteredInstances: Array<IComponentInstance>, instance: IInstanceMapping): Array<IComponentInstance> => {
      if (instance.type === childDefinition) {
        filteredInstances.push(instance.instance);
      }

      return filteredInstances;
    }, []);
  }

  public getParent(childInstance: IComponentInstance): IComponentInstance | null { // eslint-disable-line @typescript-eslint/no-redundant-type-constituents
    return this._registry.get(childInstance, 'parent');
  }

  private _getRecursiveChildComponents(parentInstance: IComponentInstance, components: Record<string, IComponentDefinition> = {}): Record<string, IComponentDefinition> {
    for (const component of this.getInstanceComponents(parentInstance)) {
      components[component.toString()] = component;

      for (const instance of this.getInstances(parentInstance, component)) {
        this._getRecursiveChildComponents(instance, components);
      }
    }

    return components;
  }

  private _parseParams(args: Array<keyof IComponentInstance>, context: IComponentInstance, components: Array<IComponentDefinition>): Array<unknown> {
    return args.map((param: keyof IComponentInstance): unknown => {
      for (const c of components) {
        if (c.name === param) {
          return c;
        }
      }

      return context[param];
    });
  }
}
