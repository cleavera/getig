import { $readFile } from '@cleavera/fs';
import { $componentFactory } from '@getig/common';
import { Binding, Component, IComponentDefinition } from '@getig/core';
import { join } from 'path';

import { $loadContent, ContentComponent, MarkdownComponent } from '../../../shared';

@Component({
    template: $readFile(join(__dirname, './error.component.html')),
    components: [ContentComponent]
})
export class ErrorComponent {
    @Binding()
    public content: IComponentDefinition;

    constructor() {
        this.content = $componentFactory(MarkdownComponent, $loadContent('error.md'));
    }
}
