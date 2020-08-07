export interface Schema {
    src: string;
    width: number;
    height: number;
    artist: string;
    title: string;
    license: string;
    credit: string;
    year: {
        text: string;
        number: number;
    };
}

export interface NameValue {
    name: string;
    value: number | string | Array<NameValue>;
}

export interface ExtObject {
    value: string;
    source: string;
    hidden?: string;
}

export type ExtKeys =
    | "DateTime"
    | "ObjectName"
    | "CommonsMetadataExtension"
    | "Categories"
    | "Assessments"
    | "Artist"
    | "DateTimeOriginal"
    | "Credit"
    | "LicenseShortName"
    | "UsageTerms"
    | "AttributionRequired"
    | "Copyrighted"
    | "Restrictions"
    | "License";

/**
 * only need to define the values which are used
 */
export interface ImageInfo {
    size: number;
    width: number;
    height: number;
    url: string;
    metadata: Array<NameValue>;
    commonmetadata: Array<NameValue>;
    extmetadata: Partial<Record<ExtKeys, ExtObject>>;
}

export interface Page {
    pageid: number;
    imageinfo: ImageInfo[];
}

export interface Response {
    query: {
        pages: Record<string, Page>;
    };
}
