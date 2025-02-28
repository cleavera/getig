import { Binding, Component, COMPONENT_REGISTRY, IComponentDefinition } from '@getig/core';

@Component({
    template: `#{content}`
})
export class DynamicComponent<T = unknown> {
    @Binding()
    public content: Promise<string>;

    constructor(component: IComponentDefinition<T>) {
        COMPONENT_REGISTRY.addDynamicComponent(this, component);

        const instance: T = new component();

        COMPONENT_REGISTRY.addInstance(this, instance);

        this.content = COMPONENT_REGISTRY.render(instance);
    }
}
