import { $readFile } from '@cleavera/fs';
import { $componentFactory, DynamicComponent } from '@getig/common';
import { Binding, Component, COMPONENT_REGISTRY, IBeforeRender, IComponentDefinition } from '@getig/core';
import { join } from 'path';
import { MarkdownComponent } from '../../components/markdown/markdown.component';
import { CONTENT_BASE_PATH } from '../../constants/content-base-path.constant';
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
    private _modulePath: string;
    private _interpolatableComponents: Array<IComponentDefinition>;

    constructor(markdown: string, title: string, pages: Array<IConceptPage>, modulePath: string, interpolatableComponents: Array<IComponentDefinition> = []) {
        this.navigationComponent = $componentFactory(ModuleNavComponent, pages, modulePath);
        this.title = title;

        this._markdown = markdown;
        this._modulePath = modulePath;
        this._interpolatableComponents = interpolatableComponents;
    }

    public async beforeRender(): Promise<void> {
        this.contentComponent = $componentFactory(MarkdownComponent, await this._interpolateComponents(this._markdown, this._interpolatableComponents), join(CONTENT_BASE_PATH, this._modulePath));
    }

    private async _interpolateComponents(markdown: string, interpolatableComponents: Array<IComponentDefinition>): Promise<string> {
        interpolatableComponents.forEach((component: IComponentDefinition) => {
            COMPONENT_REGISTRY.addDynamicComponent(this, component);
        });

        return await COMPONENT_REGISTRY.interpolate(this, markdown, [], interpolatableComponents);
    }
}
