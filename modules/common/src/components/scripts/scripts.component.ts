import { IDict } from '@cleavera/utils';
import { Binding, Component, IComponentDefinition, IComponentInstance, IOnRender, Resource, RESOURCE_STORE } from '@getig/core';
import { COMPONENT_REGISTRY } from '@getig/core';

@Component({
    template: '<script src="#{url}"></script>',
    isDependant: true
})
export class ScriptsComponent implements IOnRender {
    @Binding()
    public url!: string;

    public async onRender(): Promise<void> {
        const parent: IComponentInstance = COMPONENT_REGISTRY.getParent(this);
        const components: Array<IComponentDefinition> = COMPONENT_REGISTRY.getDescendants(parent);

        components.push(COMPONENT_REGISTRY.getDefinition(parent));

        const scripts: Resource = Resource.FromString((await this._getScripts(components)).join('\n'), 'js');

        RESOURCE_STORE.addResource(scripts);

        this.url = scripts.url;
    }

    private async _getScripts(components: Array<IComponentDefinition>): Promise<Array<string>> {
        const scripts: IDict<boolean> = {};

        await Promise.all(components.map(async(component: IComponentDefinition) => {
            const scriptDefinitions: Array<Promise<string>> = COMPONENT_REGISTRY.getScripts(component);

            for (const scriptDefinition of scriptDefinitions) {
                scripts[(await scriptDefinition)] = true;
            }
        }));

        return Object.keys(scripts);
    }
}
