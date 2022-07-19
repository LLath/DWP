const fetch = require("node-fetch");
const { log } = require("@llath/logger");

/**
 * @typedef promotion
 * @type {object}
 * @property {string} startDate
 * @property {string} endDate
 * @property {object} discount type, percentage
 */

/**
 * @typedef freeGame
 * @type {object}
 * @property {string} title
 * @property {promotion} promotion
 * @property {string} url
 * @property {string} thumbnail
 */

/**
 * @typedef freeEpicGames
 * @type {object}
 * @property {Array<freeGame>} freeGames
 * @property {Array<string>} upcomingPromotions
 *
 */

/**
 * @async
 * @returns {Promise<freeEpicGames>}
 */
const getFreeGames = async () => {
  const freeGames = [];
  const upcomingPromotions = [];
  const { data } = await fetch(
    "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?allowCountries=EU"
  ).then((data) => data.json());

  data.Catalog.searchStore.elements.forEach(
    ({ title, promotions, productSlug, keyImages, offerMappings }) => {
      if (productSlug === null) {
        productSlug = title;
      }
      if (promotions === null) {
        // FIXME: DEBUG
        // console.log(`No promotion for game ${title}`);
        return;
      }
      if (offerMappings.length > 0) {
        productSlug = offerMappings[0].pageSlug;
      }

      const promotion = promotions.promotionalOffers[0]?.promotionalOffers[0];
      const upcomingPromotion =
        promotions.upcomingPromotionalOffers[0]?.promotionalOffers[0];

      if (promotions?.promotionalOffers?.length < 1) {
        log(
          `Upcoming promotion for game ${title}; ${upcomingPromotion.startDate}`,
          "debug"
        );
        upcomingPromotions.push(upcomingPromotion.startDate);
        return;
      }
      if (promotion.discountSetting.discountPercentage !== 0) {
        // TODO: Sales command?
        // console.log(`Sale on ${title}`);
        return;
      }
      const freeGame = {
        title: title,
        promotion: {
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          discount: {
            type: promotion.discountSetting.discountType,
            percentage: promotion.discountSetting.discountPercentage,
          },
        },
        url: `https://store.epicgames.com/en-US/p/${productSlug.replace(
          "/home",
          ""
        )}`,
        thumbnail: encodeURI(keyImages[0].url),
      };
      freeGames.push(freeGame);
    }
  );

  return { freeGames, upcomingPromotions: [...new Set(upcomingPromotions)] };
};

module.exports = { getFreeGames };
