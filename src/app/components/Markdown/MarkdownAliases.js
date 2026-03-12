const aliases = {
    "id": "identity",
    "st": "status",
    "gn": "giftname",
    "gi": "gifticons",
    "kw": "keyword"
};

function convertMarkdownAlias(type) {
    return aliases[type] ?? type;
}

export { convertMarkdownAlias };