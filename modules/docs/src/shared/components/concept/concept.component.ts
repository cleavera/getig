import { $readFile } from '@cleavera/fs';
import { $componentFactory, DynamicComponent, ProjectionComponent } from '@getig/common';
import { Binding, Component, IBeforeRender, IComponentDefinition } from '@getig/core';
import { join } from 'path';
import { $loadStyle } from '../../helpers/load-style';
import { IConceptPage } from '../../interfaces/concept-page.interface';
import { ContentComponent } from '../content/content.component';
import { ModuleNavComponent } from '../module-nav/module-nav.component';

@Component({
    template: $readFile(join(__dirname, './concept.component.html')),
    styles: $loadStyle(join(__dirname, './concept.component.scss')),
    components: [
        ContentComponent,
        DynamicComponent
    ]
})
export class ConceptComponent implements IBeforeRender {
    @Binding()
    public navigationComponent: IComponentDefinition;

    @Binding()
    public contentComponent?: IComponentDefinition;

    @Binding()
    public title: string;

    private _markdown: string;
    private _interpolatableComponents: Array<IComponentDefinition>;

    constructor(markdown: string, title: string, pages: Array<IConceptPage>, modulePath: string, interpolatableComponents: Array<IComponentDefinition> = []) {
        this.navigationComponent = $componentFactory(ModuleNavComponent, pages, modulePath);
        this.title = title;

        this._markdown = markdown;
        this._interpolatableComponents = interpolatableComponents;
    }

    public async beforeRender(): Promise<void> {
        this.contentComponent = $componentFactory(ProjectionComponent, await this._interpolateComponents(this._markdown, this._interpolatableComponents));
    }

    private async _interpolateComponents(markdown: string, interpolatableComponents: Array<IComponentDefinition>): Promise<string> {
        interpolatableComponents.forEach((component: IComponentDefinition) => {
            Component.addDynamicComponent(this, component);
        });

        return await Component.interpolate(this, markdown, [], interpolatableComponents);
    }
}
