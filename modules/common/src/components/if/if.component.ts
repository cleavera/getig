import { Binding, Component, COMPONENT_REGISTRY, IComponentDefinition } from '@getig/core';

@Component({
    template: `#{content}`
})
export class IfComponent<T = unknown> {
    @Binding()
    public content: Promise<string>;

    constructor(show: boolean, component: IComponentDefinition<T>) {
        if (!show) {
            this.content = Promise.resolve('');

            return;
        }

        COMPONENT_REGISTRY.addDynamicComponent(this, component);

        const instance: T = new component();

        COMPONENT_REGISTRY.addInstance(this, instance);

        this.content = COMPONENT_REGISTRY.render(instance);
    }
}
