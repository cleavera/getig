function getMatches(str: string, regex: RegExp): Array<RegExpExecArray> {
    let match: RegExpExecArray | null = regex.exec(str);
    const matches: Array<RegExpExecArray> = [];

    while (match !== null) {
        matches.push(match);

        if (regex.global) {
            match = regex.exec(str);
        } else {
            match = null;
        }
    }

    return matches;
}

export async function stringReplace(
    str: string,
    regex: RegExp,
    replacer: (match: RegExpExecArray) => Promise<string>
): Promise<string> {
    const matches: Array<RegExpExecArray> = getMatches(str, regex);

    if (matches.length === 0) {
        return str;
    }

    let offset: number = 0;

    for (const match of matches) {
        const replacedValue: string = await replacer(match);
        const matchLength: number = match[0].length;
        const part1: string = str.substring(0, match.index + offset);
        const part2: string = str.substring(match.index + offset + matchLength);

        str = part1 + replacedValue + part2;
        offset += replacedValue.length - matchLength;
    }

    return str;
}
