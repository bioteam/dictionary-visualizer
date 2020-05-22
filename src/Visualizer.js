import React from 'react';
import ReduxDataDictionary from './DataDictionary';
import MonacoEditor from 'react-monaco-editor';

import './Visualizer.css';

class Visualizer extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }
  componentDidMount() {
    
  }
  editorDidMount(editor, monaco) {
    console.log('editorDidMount', editor);
    editor.focus();
  }
  onChange(newValue, e) {
      console.log(newValue);
    this.props.dh.loadSchema(JSON.parse(newValue));
  }
  render() {
   
    return (
        <>
            
        <ReduxDataDictionary />
    
        <div className="popup-editor">
            <div className="v-center">
                <MonacoEditor
                    width="800"
                    height="600"
                    language="json"
                    theme="vs-dark"
                    value={JSON.stringify(this.props.dh.schema, null, 3)}
                    // options={options}
                    onChange={this.onChange}
                    editorDidMount={this.editorDidMount}
                />
            </div>
        </div>
        
                
            
        </>
    );
  }
}

export default Visualizer;
