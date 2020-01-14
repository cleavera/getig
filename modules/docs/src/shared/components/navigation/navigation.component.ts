import { $readFile } from '@cleavera/fs';
import { Component } from '@getig/core';
import { join } from 'path';

import { $loadStyle } from '../../helpers/load-style';

@Component({
    template: $readFile(join(__dirname, './navigation.component.html')),
    styles: $loadStyle(join(__dirname, './navigation.component.scss')),
})
export class NavigationComponent {}
