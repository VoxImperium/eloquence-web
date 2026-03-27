'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('crfpa_subjects', [
      {
        title: 'Subject Title 1',
        description: 'Description for Subject 1',
        difficulty_level: 'Easy',
        year: 2023,
        source_name: 'Source Name 1',
        source_url: 'http://source-url-1.com',
        category: 'Category 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // ... continue for all 30+ subjects
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('crfpa_subjects', null, {});
  },
};
