import app from './app';
import config from 'config';

app.set('port', config.get('app.port'));

const server = app.listen(app.get('port'), (): void => {
  console.log(`Server running on PORT ${app.get('port')} in ${app.get('env')} mode`);
});

export default server;