import { $readFile } from '@cleavera/fs';
import { Asyncable, Maybe } from '@cleavera/types';
import { stringReplace } from '@cleavera/utils';
import { Binding, Component, Resource, RESOURCE_STORE } from '@getig/core';
import { join } from 'path';

import { LOGGER } from '../../constants/logger.constant';
import { $getContentPath } from '../../helpers/get-content-path';
import { $loadStyle } from '../../helpers/load-style';
import { $parseMarkdown } from '../../helpers/parse-markdown';

@Component({
    styles: $loadStyle(join(__dirname, './markdown.component.scss')),
    template: $readFile(join(__dirname, './markdown.component.html'))
})
export class MarkdownComponent {
    @Binding()
    public content: Promise<string>;

    constructor(markdown: Asyncable<string>, basePath: string = './') {
        this.content = this._parseMarkdown(markdown, basePath);
    }

    private async _parseMarkdown(markdown: Asyncable<string>, basePath: string): Promise<string> {
        const content: string = $parseMarkdown(await markdown) ?? '';

        return await stringReplace(content, /<img(?:[\s\S]+?)src="(.+?)"/g, async([match, filePath]: RegExpExecArray): Promise<string> => {
            let resource: Maybe<Resource> = null;

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
