import React, { Component } from 'react';
import { Button, ButtonToolbar, Card, CardBody } from 'reactstrap';
import { Storage } from 'aws-amplify';
import moment from 'moment';
import StringGenerator from '../utils/StringGenerator';
import TFileUploadSingle from './common/TFileUploadSingle';

class FileUploadPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      imageUploading: false
    };
    this.reset = this.reset.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(filesToUpload) {
    this.setState({ files: filesToUpload });
  }

  async handleSubmit(e) {
    const { files } = this.state;
    e.preventDefault();
    const file = files[0];
    const year = moment.utc().format('YYYY');
    const month = moment.utc().format('MM');
    const fileName = StringGenerator.makeId(6);
    const fileNamePieces = file.name.split(/[\s.]+/);
    const fileExtension = fileNamePieces[fileNamePieces.length - 1];
    let contentType = 'image/png';
    if (fileExtension === 'png') {
      contentType = 'image/png';
    } else {
      contentType = 'image/jpeg';
    }
    // try {
    // const result =
    this.setState({ imageUploading: true });
    await Storage.put(`${year}/${month}/${fileName}.${fileExtension}`, file, { contentType });
    this.setState({ imageUploading: false });
    // console.log(result);
    // }
    // catch (err) {
    //   console.log(err);
    // }
    // .then(result => console.log(result))
    // .catch(err =>);
    // {key: "2019/52/rb3zYH.png"}
    // this.showResults(this.state.files)
  }

  reset() {
    this.setState({ files: [] });
  }

  render() {
    const { files, imageUploading } = this.state;

    return (
      <Card>
        <CardBody>
          <div className="card__title">
            <h5 className="bold-text">File Upload</h5>
          </div>
          <form onSubmit={e => this.handleSubmit(e)}>
            <TFileUploadSingle name="fileupload" files={files} onChange={this.onChange}/>
            {imageUploading && <span>Loading...</span>}
            <ButtonToolbar className="form__button-toolbar">
              <Button color="primary" type="submit" disabled={imageUploading}>Submit</Button>
              <Button type="button" onClick={this.reset}
                      disabled={imageUploading}
              >
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
