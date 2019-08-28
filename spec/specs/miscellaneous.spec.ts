import app from '../../src/setup/server';	
import chai, { expect } from 'chai';	
import chaiHttp from 'chai-http';	

chai.use(chaiHttp);	

describe('GET <API />', () => {	
  it('should return 200', async () => {	
    const { status, body } = await chai.request(app).get('/api/v1');	
    expect(status).to.equal(200);	
      expect(body.message).to.equal('Welcome to CMRC API');	
  });	
});