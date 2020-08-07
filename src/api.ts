import {ExtObject, ImageInfo, NameValue, Response, Schema} from "./types";

export const getFileData = async (
    title: string
): Promise<Schema | undefined> => {
  const json = await fetch(makeUrl(title), { mode: "no-cors" }).then((res) =>
      res.json()
  );
  const schemas = mapJson(json);
  return schemas[0] && schemas[0][0] ? (schemas[0][0] as Schema) : undefined;
};

const makeUrl = (title: string): string => {
  return (
    "https://commons.wikimedia.org/w/api.php?" +
    "action=query&prop=imageinfo&iiprop=extmetadata%7Cmetadata%7Ccommonmetadata%7Csize%7Curl&iimetadataversion=latest&titles=" +
    encodeURIComponent(decodeURIComponent(title)) +
    "&format=json"
  );
};

//array of arrays -- pages (expect 1) and images on page ( expect 1 )
const mapJson = (json: Response): Schema[][] => {
  const pages = json.query.pages;
  return Object.keys(pages).map((key) =>
    pages[key].imageinfo.map(mapImageInfo)
  );
};

const mapImageInfo = (imageinfo: ImageInfo): Schema => {
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
const getValue = (object: NameValue | ExtObject | undefined): string => {
  if (object) {
    //ensure response is always a string
    //can loop through objects, but now just ignoring
    return String(object.value);
  } else return "";
};

const toText = (html: string): string => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(html, "text/html");
  removeHiddenChildren(doc.body); //void method mutates doc
  return doc.body.innerText.trim();
};

const removeHiddenChildren = (node: HTMLElement) => {
  //@ts-ignore
  [...node.children].forEach( child =>
    ( child.style.display === "none" )  ? node.removeChild(child) : removeHiddenChildren(child)
  )
}

const dateToYear = (html: string): Schema["year"] => {
  const text = toText(html);
  const yearmatch = text.match(/[0-9]{4}/);
  return {
    text,
    number: yearmatch ? parseInt(yearmatch[0], 10) : NaN
  };
};
