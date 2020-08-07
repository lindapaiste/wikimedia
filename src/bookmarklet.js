(function(){


    const getFileData = async (title) => {
        const json = await fetch(makeUrl(title), { mode: "no-cors" }).then((res) =>
            res.json()
        );
        const schemas = mapJson(json);
        return schemas[0] && schemas[0][0] ? (schemas[0][0]) : undefined;
    };

    const makeUrl = (title) => {
        return (
            "https://commons.wikimedia.org/w/api.php?" +
            "action=query&prop=imageinfo&iiprop=extmetadata%7Cmetadata%7Ccommonmetadata%7Csize%7Curl&iimetadataversion=latest&titles=" +
            encodeURIComponent(decodeURIComponent(title)) +
            "&format=json"
        );
    };

//array of arrays -- pages (expect 1) and images on page ( expect 1 )
    const mapJson = (json) => {
        const pages = json.query.pages;
        return Object.keys(pages).map((key) =>
            pages[key].imageinfo.map(mapImageInfo)
        );
    };

    const mapImageInfo = (imageinfo) => {
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
    const getValue = (object) => {
        if (object) {
            //ensure response is always a string
            //can loop through objects, but now just ignoring
            return String(object.value);
        } else return "";
    };

    const toText = (html) => {
        const domparser = new DOMParser();
        const doc = domparser.parseFromString(html, "text/html");
        removeHiddenChildren(doc.body); //void method mutates doc
        return doc.body.innerText.trim();
    };

    const removeHiddenChildren = (node) => {
        //@ts-ignore
        [...node.children].forEach( child =>
            ( child.style.display === "none" )  ? node.removeChild(child) : removeHiddenChildren(child)
        )
    }

    const dateToYear = (html) => {
        const text = toText(html);
        const yearmatch = text.match(/[0-9]{4}/);
        return {
            text,
            number: yearmatch ? parseInt(yearmatch[0], 10) : NaN
        };
    };

    const urls = [...document.querySelectorAll('li.gallerybox a')].map(a => a.href);
    const titles = urls.map((url) => url.replace(/.*\/wiki\//, ""));
    Promise.allSettled(
        titles.map( getFileData )
    ).then(
        results => console.log( JSON.stringify(results) )
    ).catch(console.error);
})();
