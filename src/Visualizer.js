import React from 'react';
import ReduxDataDictionary from './DataDictionary';
import MonacoEditor from 'react-monaco-editor';

import './Visualizer.css';

class Visualizer extends React.Component {
  componentDidMount() {
    console.log(this.props.store);
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
                    value={JSON.stringify(this.props.code, null, 3)}
                    // options={options}
                    // onChange={::this.onChange}
                    // editorDidMount={::this.editorDidMount}
                />
            </div>
        </div>
        
                
            
        </>
    );
  }
}

export default Visualizer;
