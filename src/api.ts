const makeUrl = (title: string): string => {
  return (
    "https://commons.wikimedia.org/w/api.php?" +
    "action=query&prop=imageinfo&iiprop=extmetadata%7Cmetadata%7Ccommonmetadata%7Csize%7Curl&iimetadataversion=latest&titles=" +
    encodeURIComponent(title) +
    "&format=json"
  );
};

export const getFileData = async (
  title: string
): Promise<Schema | undefined> => {
  const json = await fetch(makeUrl(title), { mode: "no-cors" }).then((res) =>
    res.json()
  );
  const schemas = mapJson(json);
  return schemas[0] && schemas[0][0] ? (schemas[0][0] as Schema) : undefined;
};

export interface Schema {
  src: string;
  width: number;
  height: number;
  artist: string;
  title: string;
  license: string;
  credit: string;
  year: {
    original: string;
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

//array of arrays -- pages (expect 1) and images on page ( expect 1 )
export const mapJson = (json: Response) => {
  const pages = json.query.pages;
  return Object.keys(pages).map((key) =>
    pages[key].imageinfo.map(mapImageInfo)
  );
};

export const mapImageInfo = (imageinfo: ImageInfo): Schema => {
  return {
    src: imageinfo.url,
    width: imageinfo.width,
    height: imageinfo.height,
    artist: toText(getValue(imageinfo.extmetadata.Artist)),
    title: toText(getValue(imageinfo.extmetadata.ObjectName)),
    license: getValue(imageinfo.extmetadata.License),
    credit: toText(
      getValue(
        imageinfo.metadata.find((p) => p.name === "Credit") ||
          imageinfo.extmetadata.Credit
      )
    ),
    year: dateToYear(getValue(imageinfo.extmetadata.DateTimeOriginal))
  };
};

//avoids getting value on undefined
export const getValue = (object: NameValue | ExtObject | undefined): string => {
  if (object) {
    //ensure response is always a string
    //can loop through objects, but now just ignoring
    return String(object.value);
  } else return "";
};

export const toText = (html: string): string => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(html, "text/html");
  return doc.body.innerText.trim();
};

export const dateToYear = (html: string): Schema["year"] => {
  const text = toText(html.replace(/<div.*<\/div>/, ""));
  const yearmatch = text.match(/[0-9]{4}/);
  return {
    original: html,
    text,
    number: yearmatch ? parseInt(yearmatch[0], 10) : NaN
  };
};
