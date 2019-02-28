import webpack from 'webpack';
import webpackConfig from '../webpack.config.dev';

process.env.NODE_ENV = 'production';
console.log('generating minified bundle for production via webpack. this will take a moment.');

webpack(webpackConfig).run((err, stats) => {
  if(err) {
    console.log(err);
    return 1;
  }

  const jsonStats = stats.toJson();

  if(jsonStats.hasErrors) {
    return jsonStats.errors.map(error => console.log(error));
  }

  if(jsonStats.hasWarning) {
    console.log('webpack generated the following warnings: ');
    jsonStats.warnings.map(warning => console.log(warning));
  }

  console.log(`Webpack stats: ${stats}`);
  console.log('your app has been compiled in production mode and written to /dist. It is ready to roll!');
  return 0;
});
