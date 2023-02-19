/** @format */

import { DATA_TERMS_POLICY } from '#mocks';

const appController = {
  getConfig: (request, response) => {
    let results = null;
    const { type, language } = request.query;
    switch (type) {
      case 'terms-policy':
        results = language === 'en' ? DATA_TERMS_POLICY.en : DATA_TERMS_POLICY.vi;
        break;
      default:
        results = { version: '0.0.1' };
        break;
    }
    return response.status(200).send({
      message: 'Successfully',
      success: true,
      data: results,
    });
  },
};

export default appController;
