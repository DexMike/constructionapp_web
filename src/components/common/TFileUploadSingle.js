import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import * as PropTypes from 'prop-types';

class TFileUploadSingle extends Component {
  constructor(props) {
    super(props);

    this.removeFile = this.removeFile.bind(this);
  }

  removeFile(index, e) {
    const { files, onChange } = this.props;
    e.preventDefault();
    onChange(files.filter((file, i) => i !== index));
  }

  render() {
    const { files, name, onChange } = this.props;
    return (
      <div className="dropzone dropzone--single dropzone--custom-height">
        <Dropzone
          className="dropzone__input"
          accept="image/jpeg, image/png"
          name={name}
          multiple={false}
          onDrop={(filesToUpload) => {
            onChange(filesToUpload);
          }}
        >
          {(!files || files.length === 0)
          && (
            <div className="dropzone__drop-here">
              <span className="lnr lnr-upload"/>
              Drop file here to upload
            </div>
          )}
        </Dropzone>
        {files && Array.isArray(files) && files.length > 0
        && (
          <div className="dropzone__img">
            <img src={files[0].preview} alt="drop-img"/>
            <p className="dropzone__img-name">{files[0].name}</p>
            <button type="button" className="dropzone__img-delete" onClick={e => this.removeFile(0, e)}>
              Remove
            </button>
          </div>
        )}
      </div>
    );
  }
}

TFileUploadSingle.propTypes = {
  name: PropTypes.string,
  files: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func
};

TFileUploadSingle.defaultProps = {
  name: 'fileupload',
  files: [],
  onChange: () => {
  }
};

export default TFileUploadSingle;
