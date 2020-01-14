import { $prettifyString } from '@cleavera/utils';
import { $componentFactory } from '@getig/common';
import { IComponentDefinition, IPage, Page } from '@getig/core';
import { ConceptComponent } from '../components/concept/concept.component';
import { PageComponent } from '../components/page/page.component';
import { IConceptPage } from '../interfaces/concept-page.interface';
import { $getConcepts } from './get-concepts';

export async function $generatePages(moduleName: string, interpolatableComponents: Array<IComponentDefinition> = []): Promise<Array<IPage>> {
    const pages: Array<IConceptPage> = await $getConcepts(moduleName);

    if (!(pages.find((page: IConceptPage) => {
        return page.path === 'index';
    }))) {
        pages.push({
            path: 'index',
            title: $prettifyString(moduleName),
            content: '',
            resources: []
        });
    }

    const out: Array<IPage> = [];

    for (const page of pages) {
        out.push(Page.Create(
            `${page.path}.html`,
            new PageComponent(
                page.title,
                $componentFactory(ConceptComponent, page.content, page.title, pages, moduleName, interpolatableComponents)),
            page.resources));
    }

    return out;
}
