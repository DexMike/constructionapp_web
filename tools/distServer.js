import express from 'express';
import path from 'path';
import open from 'open';
import compression from 'compression';

const port = 8083;
const app = express();

app.use(compression());
app.use(express.static('dist'));

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, function(err) {
  if(err) {
    console.log(err);
  }else {
    open(`http://localhost:${port}`);
  }
});
