import AgentService from './AgentService';

/* const date = new Date();
const email = {
  toEmail: 'mike@trelar.net',
  toName: 'Test Subject #326',
  // eslint-disable-next-line prefer-template
  subject: 'Test | ' + date.getHours() + ':' + date.getMinutes(),
  isHTML: true,
  body: '<strong>BOLD TEXT!</strong><br><br>Testing...',
  attachmentImg: 'https://d2x9cff48m5sea.cloudfront.net/public/2019/04/7UAf2p.jpg',
  attachmentPdf: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  attachmentTxt: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
};
await EmailService.sendEmail(email); */

const PATH = '/email';

class EmailService extends AgentService {
  static async sendEmail(email) {
    const response = await super.post(PATH, email);
    return (response);
  }
}

export default EmailService;
