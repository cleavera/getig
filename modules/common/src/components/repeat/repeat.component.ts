import { $readFile } from '@cleavera/fs';
import { Asyncable } from '@cleavera/types';
import { Binding, Component, COMPONENT_REGISTRY, IComponentDefinition } from '@getig/core';
import { join } from 'path';

@Component({
    template: $readFile(join(__dirname, './repeat.component.html'))
})
export class RepeatComponent<T = unknown> {
    @Binding()
    public content: Promise<string>;

    constructor(items: Array<unknown>, component: IComponentDefinition<T>) {
        COMPONENT_REGISTRY.addDynamicComponent(this, component);
        this.content = this._renderComponents(items, component);
    }

    private async _renderComponents(items: Asyncable<Array<unknown>>, component: { new(arg: unknown): T; }): Promise<string> {
        const values: Array<string> = await Promise.all((await items).map(async(item: unknown) => {
            const instance: T = new component(item);

            COMPONENT_REGISTRY.addInstance(this, instance);

            return COMPONENT_REGISTRY.render(instance);
        }));

        return values.join('');
    }
}
