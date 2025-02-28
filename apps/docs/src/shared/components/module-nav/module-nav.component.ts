import { $readFile } from '@cleavera/fs';
import { RepeatComponent } from '@getig/common';
import { Binding, Component } from '@getig/core';
import { join } from 'path';

import { $loadStyle } from '../../helpers/load-style';
import { IConceptPage } from '../../interfaces/concept-page.interface';
import { INavigationItem } from '../../interfaces/navigation-item.interface';
import { ModuleNavItemComponent } from '../module-nav-item/module-nav-item.component';

@Component({
    template: $readFile(join(__dirname, './module-nav.component.html')),
    styles: $loadStyle(join(__dirname, './module-nav.component.scss')),
    components: [
        ModuleNavItemComponent,
        RepeatComponent
    ]
})
export class ModuleNavComponent {
    @Binding()
    public items: Array<INavigationItem>;

    constructor(pages: Array<IConceptPage>, modulePath: string) {
        this.items = [];

        for (const page of pages) {
            if (page.path === 'index') {
                continue;
            }

            this.items.push({
                action: {
                    url: `/${modulePath}/${page.path}.html`,
                    label: page.title
                }
            });
        }
    }
}
