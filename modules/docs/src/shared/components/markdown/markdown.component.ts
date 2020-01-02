import { $readFile } from '@cleavera/fs';
import { $stringReplace } from '@cleavera/utils';
import { Binding, Component, Resource, RESOURCE_STORE } from '@getig/core';
import { join } from 'path';
import { LOGGER } from '../../constants/logger.constant';
import { $getContentPath } from '../../helpers/get-content-path';
import { $loadMarkdown } from '../../helpers/load-markdown';

@Component({
    template: $readFile(join(__dirname, './markdown.component.html'))
})
export class MarkdownComponent {
    @Binding()
    public content: Promise<string>;

    constructor(path: string) {
        this.content = this._loadMarkdown(path);
    }

    private async _loadMarkdown(path: string): Promise<string> {
        const content: string = (await $loadMarkdown(path, true)) || '';
        const basePath: string = path.substring(0, path.lastIndexOf('/'));

        return await $stringReplace(content, /<img(?:[\s\S]+?)src="(.+?)"/g, async(match: string, filePath: string): Promise<string> => {
            let resource: Resource;

            try {
                resource = await Resource.FromFilePath($getContentPath(join(basePath, filePath)));
            } catch (e) {
                LOGGER.warn(e); // tslint:disable-line no-console

                return match;
            }

            RESOURCE_STORE.addResource(resource);

            return `${match.replace(filePath, resource.url)}`;
        });
    }
}
