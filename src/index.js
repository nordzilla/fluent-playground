import { DOMLocalization } from "@fluent/dom";
import { FluentBundle, FluentResource } from "@fluent/bundle";
import "regenerator-runtime/runtime";

const availableLanguages = getMeta(document.head).available;

const h1 = document.querySelector("h1");
if (!h1) {
  throw new Error("Could not find the h1");
}

const button = document.querySelector("button");
if (!button) {
  throw new Error("Could not find the button");
}

const resources = document.querySelector("link[name=localization]");

const resourcePathTemplate = resources.attributes.content.nodeValue;

function topLanguage() {
  return availableLanguages[0];
}



function getMeta(elem) {
  return {
    available: elem.querySelector('meta[name="availableLanguages"]')
      .getAttribute("content")
      .split(",").map(s => s.trim()),
    default: elem.querySelector('meta[name="defaultLanguage"]')
      .getAttribute("content"),
  };
}

async function fetchResource(locale, id) {
  console.log("id: ", id);
  const url = id[0].replace("{locale}", locale);
  console.log("url: ", url);
  const response = await fetch(url);
  const text = await response.text();
  return new FluentResource(text);
}

async function* generateBundles(resourceIds) {
  console.log(availableLanguages);
  for (const locale of availableLanguages) {
    console.log(`fetching resource for ${locale}`);
    let resource = await fetchResource(locale, resourceIds);

    let bundle = new FluentBundle(locale);
    let errors = bundle.addResource(resource);
    if (errors.length) {
      // Syntax errors are per-message and don't break the whole resource
    }

    yield bundle;
  }
}

const l10n = new DOMLocalization([resourcePathTemplate], generateBundles);
l10n.connectRoot(document.documentElement);
l10n.setAttributes(h1, "welcome", { name: "Anna" });
l10n.translateRoots();

function updateButton() {
  availableLanguages.push(availableLanguages.shift())
  button.innerText = availableLanguages[0];
  l10n.handleEvent();
}
window.updateButton = updateButton;

updateButton();
