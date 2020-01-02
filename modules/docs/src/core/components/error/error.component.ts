import { $readFile } from '@cleavera/fs';
import { Component } from '@getig/core';
import { join } from 'path';

@Component({
    template: $readFile(join(__dirname, './error.component.html'))
})
export class ErrorComponent {
}
