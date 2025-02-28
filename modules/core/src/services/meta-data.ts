export class MetaData {
    private readonly _META_PROPERTY_NAME: symbol;

    constructor(description = 'MetaData') {
        this._META_PROPERTY_NAME = Symbol(description);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
    public get(object: object, metaKey: string): any | null {
        return (object as Record<symbol, Record<string, unknown> | null>)[this._META_PROPERTY_NAME]?.[metaKey] ?? null;
    }

    public set(object: object, metaKey: string, value: unknown): void {
        if (!(this._META_PROPERTY_NAME in object)) {
            (object as Record<symbol, Record<string, unknown>>)[this._META_PROPERTY_NAME] = {};
        }

        (object as Record<symbol, Record<string, unknown>>)[this._META_PROPERTY_NAME][metaKey] = value;
    }
}
