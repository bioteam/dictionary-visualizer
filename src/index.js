import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import { createStore } from 'redux'
import Visualizer from './Visualizer';
import reducers from './reducers'
import $RefParser from "@apidevtools/json-schema-ref-parser";

const version = {"commit":"913161064b02bcef024d072873e77c8c79cc1a68","dictionary":{"commit":"520a25999fd183f6c5b7ddef2980f3e839517da5","version":"0.2.1-9-g520a259"},"version":"4.0.0-44-g9131610"};

const findObjectWithRef = (obj, updateFn, root_key = '', level = 0) => {
  // iterate over the properties
  for (var propertyName in obj) {

    if ( level === 0 ) root_key = propertyName;

    if ( propertyName === '$ref' ) {
      obj['$ref'] = updateFn(obj['$ref'], root_key);
    }

    // any object that is not a simple value
    if (obj[propertyName] !== null && typeof obj[propertyName] === 'object') {
      // recurse into the object and write back the result to the object graph
      obj[propertyName] = findObjectWithRef(obj[propertyName], updateFn, root_key, (level + 1));
    }
  }
  
  return obj;
};

// unresolveable:
// {$ref: "_terms.yaml#/file_format"}
// {$ref: "#/UUID"}

class DictionaryHelper {
  constructor(store) {
    this.store = store;
  }
  async fetchSchema(url) {
    // Fetch S3 schema.jsob
    this.schema = await (await fetch(url)).json();
    return this.schema;
  }
  async loadSchema(newDict) {

    // Remove .yaml extension from keys 
    let dict = {};  
    for (let [key, value] of Object.entries(newDict)) {
      dict[key.slice(0, -5)] = value;
    }

    // Recursivly fix references
    dict = findObjectWithRef(dict, (refObj, rootKey)=> { // This halts for sub objects./...
      if ( refObj.includes('.yaml') ) {
        // ABS_FIX
        // "$ref": "_definitions.yaml#/ubiquitous_properties",
        // ->
        // "$ref": "#/_definitions/ubiquitous_properties",
        refObj = "#/" + refObj.replace('.yaml#', '');
      } else {
        // REL FIX
        // "$ref": "#/state"
        // ->
        // "$ref": "#/{_definitions aka root key}/state"
        refObj = '#/' + rootKey + '/' + refObj.replace('#/', '');
      }
      return refObj;
    });

    // This is a HACK FIX ME!!@!!!
    dict['_terms']['file_format'] = {description: 'wut'};


    let derefDict = await $RefParser.dereference(dict, {
      continueOnError: false,            // Don't throw on the first error
      dereference: {
        circular: true                 // Don't allow circular $refs
      }
    });

    await Promise.all(
      [
        this.store.dispatch({
          type: 'RECEIVE_DICTIONARY',
          data: derefDict
        }),
        this.store.dispatch({
          type: 'RECEIVE_VERSION_INFO',
          data: version
        })
      ],
    );
  }
}


async function init() {
  const store = createStore(reducers);

  let dh = new DictionaryHelper(store);
  
  let url = 'https://bms-gen3-dev.s3.amazonaws.com/datadictionary/master/schema.json';
  if ( window.location.hash ) {
    url = window.location.hash.slice(1);
  }

  // window.addEventListener('hashchange', () => {
  //   await dh.loadSchema(await dh.fetchSchema(url));
  // }, false);

  await dh.loadSchema(await dh.fetchSchema(url));

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <Visualizer dh={dh} />
      </Provider>
    </React.StrictMode>,
    document.getElementById('root')
  );
}


init();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
