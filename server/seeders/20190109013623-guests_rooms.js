"use strict";

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert(
            "guests_rooms",
            [
                {
                    roomId: 2,
                    guestId: 1,
                    pin: 1234,
                    active: 1,
                    checkout_date: "2019-03-30 05:29:22"
                },
                {
                    roomId: 3,
                    guestId: 2,
                    pin: 1234,
                    active: 1,
                    checkout_date: "2018-04-30 05:29:26"
                },
                {
                    roomId: 5,
                    guestId: 5,
                    pin: 1234,
                    active: 1,
                    checkout_date: "2019-05-12 05:29:29"
                },
                {
                    roomId: 6,
                    guestId: 6,
                    pin: 1234,
                    active: 1,
                    checkout_date: "2019-05-12 05:29:29"
                }
            ],
            {}
        );
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.bulkDelete("guests_rooms", null, {});
    }
};
