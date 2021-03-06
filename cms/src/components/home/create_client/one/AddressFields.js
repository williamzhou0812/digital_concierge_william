export default [
    [
        {
            name: "venue_address",
            label: "Venue Address",
            required: true,
            flexBasis: "45%",
            marginRight: "5%",
            type: "text"
        },
        {
            name: "postal_address",
            label: "Postal Address",
            required: false,
            flexBasis: "45%",
            marginRight: "5%",
            type: "text"
        }
    ],
    [
        {
            name: "venue_city",
            label: "City",
            required: true,
            flexBasis: "20%",
            marginRight: "5%",
            type: "text"
        },
        {
            name: "venue_zip_code",
            label: "Zip Code",
            required: true,
            flexBasis: "20%",
            marginRight: "5%",
            type: "text"
        },
        {
            name: "postal_city",
            label: "City",
            required: true,
            flexBasis: "20%",
            marginRight: "5%",
            type: "text"
        },
        {
            name: "postal_zip_code",
            label: "Zip Code",
            required: true,
            flexBasis: "20%",
            marginRight: "5%",
            type: "text"
        }
    ],
    [
        {
            name: "country_id",
            label: "Country",
            required: true,
            flexBasis: "45%",
            marginRight: "5%",
            type: "select",
            select_id: "select-1"
        },
        {
            name: "postal_country_id",
            label: "Country",
            required: true,
            flexBasis: "45%",
            marginRight: "5%",
            type: "select",
            select_id: "select-2"
        }
    ],
    [
        {
            name: "venueStateId",
            label: "State / Province (If Applicable)",
            required: true,
            flexBasis: "45%",
            marginRight: "5%",
            type: "select",
            select_id: "select-3"
        },
        {
            name: "postalStateId",
            label: "State / Province (If Applicable)",
            required: true,
            flexBasis: "45%",
            marginRight: "5%",
            type: "select",
            select_id: "select-4"
        }
    ]
];
