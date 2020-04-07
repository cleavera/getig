import { Asyncable } from '@cleavera/types';
import { Binding, Component } from '@getig/core';

@Component({
    template: '#{content}'
})
export class ProjectionComponent {
    @Binding()
    public content: Promise<string>;

    constructor(content: Asyncable<string>) {
        this.content = Promise.resolve(content);
    }
}
