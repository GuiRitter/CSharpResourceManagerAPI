export const closeTagRegex = /<\/data>/im;

export const commentRegex = /<comment>(.+?)<\/comment>/im;

export const englishRegex = /(.+).en-US.resx$/im;

export const fileExtensionRegex = /(.+).resx$/im;

export const isFolderOrCSharpResource = file => file.isDirectory || file.name.endsWith('resx');

export const nameRegex = /<data name="(.+?)"/im;

export const resHeaderStartRegex = /<resheader /im;

export const resHeaderCloseRegex = /<\/resheader>/im;

export const startTagRegex = /<\/xsd:schema>/im;

export const valueRegex = /<value>(.+?)<\/value>/im;
