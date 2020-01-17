import { IPage, Module, MODULE_REGISTRY } from '@getig/core';
import { $generatePages } from '../shared';

@Module({
    path: '/docs',
    pages: []
})
export class DocsModule {
    public async beforeGenerate(): Promise<void> {
        const pages: Array<IPage> = await $generatePages('docs');

        for (const page of pages) {
            MODULE_REGISTRY.addDynamicPage(this, page);
        }
    }
}
