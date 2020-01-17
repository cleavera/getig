import { IPage, Module, MODULE_REGISTRY } from '@getig/core';
import { $generatePages } from '../shared';

@Module({
    path: '/guides',
    pages: []
})
export class GuidesModule {
    public async beforeGenerate(): Promise<void> {
        const pages: Array<IPage> = await $generatePages('guides');

        for (const page of pages) {
            MODULE_REGISTRY.addDynamicPage(this, page);
        }
    }
}
