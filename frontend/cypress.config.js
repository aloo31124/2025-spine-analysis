const { defineConfig } = require('cypress');

module.exports = defineConfig({
    // 本專案的 Cypress 測試以「頸椎分析計算邏輯」為主，
    // 直接於 spec 內 import spineRecommendation.js 進行驗證，
    // 不需啟動實際 App，因此 baseUrl 指向空白頁即可。
    reporter: 'mochawesome',
    reporterOptions: {
        reportDir: 'cypress/reports/.jsons',
        overwrite: false,
        html: false,
        json: true,
        reportFilename: '[name]',
    },
    e2e: {
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',
        supportFile: 'cypress/support/e2e.js',
        video: false,
        screenshotOnRunFailure: false,
        setupNodeEvents(on, config) {
            return config;
        },
    },
});
