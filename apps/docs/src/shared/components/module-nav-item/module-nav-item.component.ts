import { $readFile } from '@cleavera/fs';
import { Binding, Component } from '@getig/core';
import { join } from 'path';

import { $loadStyle } from '../../helpers/load-style';
import { INavigationItem } from '../../interfaces/navigation-item.interface';

@Component({
    template: $readFile(join(__dirname, './module-nav-item.component.html')),
    styles: $loadStyle(join(__dirname, './module-nav-item.component.scss')),
    scripts: $readFile(join(__dirname, './module-nav-item.script.js'))
})
export class ModuleNavItemComponent {
    @Binding()
    public label: string;

    @Binding()
    public url: string;

    constructor({ action }: INavigationItem) {
        this.label = action.label;
        this.url = action.url;
    }
}
