import React, { Component } from 'react';
import { Button, ButtonToolbar, Card, CardBody, Container } from 'reactstrap';
import Dropzone from 'react-dropzone';
import { Storage } from 'aws-amplify';
import moment from 'moment';
import StringGenerator from '../utils/StringGenerator';

class FileUploadPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      customHeight: true,
      files: [],
      name: 'a name'
    };
    this.reset = this.reset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  } // constructor


  // async componentDidMount() {
  //   //
  // }

  async handleSubmit(e) {
    e.preventDefault();
    const file = this.state.files[0];
    const year = moment().format('YYYY');
    const month = moment().format('MM');
    const fileNamePieces = file.name.split(/[\s.]+/);
    const fileExtension = fileNamePieces[fileNamePieces.length-1];
    Storage.put(`${year}/${month}/${StringGenerator.makeId(6)}.${fileExtension}`, file)
      .then (result => console.log(result))
      .catch(err => console.log(err));
    // {key: "2019/52/rb3zYH.png"}
    // this.showResults(this.state.files)
  }

  onChange(filesToUpload) {
    this.setState({files: filesToUpload})
  }

  reset() {
    this.setState({files: []});
  }

  // showResults(values) {
  //   console.log(`You submitted:\n\n${JSON.stringify(values, null, 2)}`);
  // }

  removeFile(index, e) {
    e.preventDefault();
    this.setState({files: []});
    this.onChange(this.state.files.filter((file, i) => i !== index));
  }

  render() {
    const { files } = this.state;

    return (
      <Card>
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">File Upload</h5>
          </div>
          <form className="form" onSubmit={e => this.handleSubmit(e)}>
            <div
              className={`dropzone dropzone--single${this.state.customHeight ? ' dropzone--custom-height' : ''}`}>
              <Dropzone
                className="dropzone__input"
                accept="image/jpeg, image/png"
                name={this.state.name}
                multiple={true}
                onDrop={(filesToUpload) => {
                  this.onChange(filesToUpload);
                }}
              >
                {(!files || files.length === 0) &&
                <div className="dropzone__drop-here"><span className="lnr lnr-upload"/> Drop file
                  here to upload</div>}
              </Dropzone>
              {files && Array.isArray(files) && files.length > 0 &&
              <div className="dropzone__img">
                <img src={files[0].preview} alt="drop-img"/>
                <p className="dropzone__img-name">{files[0].name}</p>
                <button className="dropzone__img-delete" onClick={e => this.removeFile(0, e)}>
                  Remove
                </button>
              </div>}
            </div>
            <ButtonToolbar className="form__button-toolbar">
              <Button color="primary" type="submit">Submit</Button>
              <Button type="button" onClick={this.reset}>
                Cancel
              </Button>
            </ButtonToolbar>
          </form>
        </CardBody>
      </Card>
    );
  }
}

export default FileUploadPage;
