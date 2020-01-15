import { $readFile } from '@cleavera/fs';
import { $componentFactory } from '@getig/common';
import { Binding, Component, IComponentDefinition } from '@getig/core';
import { join } from 'path';
import { $loadContent, ContentComponent, MarkdownComponent } from '../../../shared';

@Component({
    template: $readFile(join(__dirname, './home.component.html')),
    components: [
        ContentComponent
    ]
})
export class HomeComponent {
    @Binding()
    public contentComponent: IComponentDefinition;

    constructor() {
        this.contentComponent = $componentFactory(MarkdownComponent, $loadContent('index.md'));
    }
}
