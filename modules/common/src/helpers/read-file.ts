import { promises as fs } from 'fs';

export async function readfile(path: string): Promise<string> {
    return fs.readFile(path, {
        encoding: 'utf-8'
    });
}
