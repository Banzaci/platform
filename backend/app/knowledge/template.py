KNOWLEDGE_TEMPLATES = [
    # FACILITIES
    {
        "key": "ask_pool",
        "category": "facilities",
        "type": "yes_no",
        "question": {
            "en": "Is there a swimming pool?",
            "sv": "Finns det en swimmingpool?",
        },
        "yes_answer": {
            "en": "Yes, we have a swimming pool.",
            "sv": "Ja, vi har en swimmingpool.",
        },
        "no_answer": {
            "en": "No, we do not have a swimming pool.",
            "sv": "Nej, vi har ingen swimmingpool.",
        },
    },
    {
        "key": "ask_wifi",
        "category": "facilities",
        "type": "yes_no",
        "question": {
            "en": "Do you have WiFi?",
            "sv": "Har ni WiFi?",
        },
        "yes_answer": {
            "en": "Yes, we have WiFi.",
            "sv": "Ja, vi har WiFi.",
        },
        "no_answer": {
            "en": "No, we do not have WiFi.",
            "sv": "Nej, vi har inte WiFi.",
        },
    },
    {
        "key": "ask_air_conditioning",
        "category": "facilities",
        "type": "yes_no",
        "question": {
            "en": "Do the rooms have air conditioning?",
            "sv": "Har rummen luftkonditionering?",
        },
        "yes_answer": {
            "en": "Yes, our rooms have air conditioning.",
            "sv": "Ja, våra rum har luftkonditionering.",
        },
        "no_answer": {
            "en": "No, our rooms do not have air conditioning.",
            "sv": "Nej, våra rum har inte luftkonditionering.",
        },
    },
    {
        "key": "ask_fan",
        "category": "facilities",
        "type": "yes_no",
        "question": {
            "en": "Do the rooms have fans?",
            "sv": "Har rummen fläkt?",
        },
        "yes_answer": {
            "en": "Yes, our rooms have fans.",
            "sv": "Ja, våra rum har fläkt.",
        },
        "no_answer": {
            "en": "No, our rooms do not have fans.",
            "sv": "Nej, våra rum har inte fläkt.",
        },
    },
    {
        "key": "ask_hot_water",
        "category": "facilities",
        "type": "yes_no",
        "question": {
            "en": "Is there hot water?",
            "sv": "Finns det varmvatten?",
        },
        "yes_answer": {
            "en": "Yes, we have hot water.",
            "sv": "Ja, vi har varmvatten.",
        },
        "no_answer": {
            "en": "No, we do not have hot water.",
            "sv": "Nej, vi har inte varmvatten.",
        },
    },
    {
        "key": "ask_pool_table",
        "category": "facilities",
        "type": "yes_no",
        "question": {
            "en": "Do you have a pool table?",
            "sv": "Har ni ett biljardbord?",
        },
        "yes_answer": {
            "en": "Yes, we have a pool table.",
            "sv": "Ja, vi har ett biljardbord.",
        },
        "no_answer": {
            "en": "No, we do not have a pool table.",
            "sv": "Nej, vi har inget biljardbord.",
        },
    },
    {
        "key": "ask_parking",
        "category": "facilities",
        "type": "yes_no",
        "question": {
            "en": "Is parking available?",
            "sv": "Finns det parkering?",
        },
        "yes_answer": {
            "en": "Yes, parking is available.",
            "sv": "Ja, det finns parkering.",
        },
        "no_answer": {
            "en": "No, parking is not available.",
            "sv": "Nej, det finns ingen parkering.",
        },
    },
    {
        "key": "ask_laundry",
        "category": "facilities",
        "type": "yes_no",
        "question": {
            "en": "Is laundry service available?",
            "sv": "Finns det tvättservice?",
        },
        "yes_answer": {
            "en": "Yes, laundry service is available.",
            "sv": "Ja, vi erbjuder tvättservice.",
        },
        "no_answer": {
            "en": "No, we do not offer laundry service.",
            "sv": "Nej, vi erbjuder inte tvättservice.",
        },
    },

    # LOCATION
    {
        "key": "ask_beach_distance",
        "category": "location",
        "type": "text",
        "question": {
            "en": "How far is it to the beach?",
            "sv": "Hur långt är det till stranden?",
        },
    },
    {
        "key": "ask_town_distance",
        "category": "location",
        "type": "text",
        "question": {
            "en": "How far is it to the nearest town or city?",
            "sv": "Hur långt är det till närmaste stad eller samhälle?",
        },
    },
    {
        "key": "ask_airport_distance",
        "category": "location",
        "type": "text",
        "question": {
            "en": "How far is it to the nearest airport?",
            "sv": "Hur långt är det till närmaste flygplats?",
        },
    },
    {
        "key": "ask_location_description",
        "category": "location",
        "type": "text",
        "question": {
            "en": "How would you describe the location?",
            "sv": "Hur skulle du beskriva läget?",
        },
    },

    # TRANSPORT
    {
        "key": "ask_airport_transfer",
        "category": "transport",
        "type": "yes_no",
        "question": {
            "en": "Do you offer airport transfers?",
            "sv": "Erbjuder ni flygplatstransfer?",
        },
        "yes_answer": {
            "en": "Yes, we can arrange airport transfers.",
            "sv": "Ja, vi kan ordna flygplatstransfer.",
        },
        "no_answer": {
            "en": "No, we do not offer airport transfers.",
            "sv": "Nej, vi erbjuder inte flygplatstransfer.",
        },
    },
    {
        "key": "ask_directions_from_airport",
        "category": "transport",
        "type": "text",
        "question": {
            "en": "How do guests get here from the airport?",
            "sv": "Hur tar sig gäster hit från flygplatsen?",
        },
    },
    {
        "key": "ask_directions_from_main_city",
        "category": "transport",
        "type": "text",
        "question": {
            "en": "How do guests get here from the nearest major city?",
            "sv": "Hur tar sig gäster hit från närmaste större stad?",
        },
    },
    {
        "key": "ask_taxi_available",
        "category": "transport",
        "type": "yes_no",
        "question": {
            "en": "Can you arrange a taxi?",
            "sv": "Kan ni ordna taxi?",
        },
        "yes_answer": {
            "en": "Yes, we can arrange a taxi.",
            "sv": "Ja, vi kan ordna taxi.",
        },
        "no_answer": {
            "en": "No, we cannot arrange a taxi.",
            "sv": "Nej, vi kan inte ordna taxi.",
        },
    },

    # FOOD & DRINK
    {
        "key": "ask_breakfast",
        "category": "food",
        "type": "yes_no",
        "question": {
            "en": "Do you serve breakfast?",
            "sv": "Serverar ni frukost?",
        },
        "yes_answer": {
            "en": "Yes, we serve breakfast.",
            "sv": "Ja, vi serverar frukost.",
        },
        "no_answer": {
            "en": "No, we do not serve breakfast.",
            "sv": "Nej, vi serverar inte frukost.",
        },
    },
    {
        "key": "ask_breakfast_hours",
        "category": "food",
        "type": "text",
        "question": {
            "en": "What time is breakfast served?",
            "sv": "Vilken tid serveras frukost?",
        },
    },
    {
        "key": "ask_restaurant",
        "category": "food",
        "type": "yes_no",
        "question": {
            "en": "Do you have a restaurant?",
            "sv": "Har ni en restaurang?",
        },
        "yes_answer": {
            "en": "Yes, we have a restaurant.",
            "sv": "Ja, vi har en restaurang.",
        },
        "no_answer": {
            "en": "No, we do not have a restaurant.",
            "sv": "Nej, vi har ingen restaurang.",
        },
    },
    {
        "key": "ask_restaurant_hours",
        "category": "food",
        "type": "text",
        "question": {
            "en": "What are the restaurant opening hours?",
            "sv": "Vilka öppettider har restaurangen?",
        },
    },
    {
        "key": "ask_bar",
        "category": "food",
        "type": "yes_no",
        "question": {
            "en": "Do you have a bar?",
            "sv": "Har ni en bar?",
        },
        "yes_answer": {
            "en": "Yes, we have a bar.",
            "sv": "Ja, vi har en bar.",
        },
        "no_answer": {
            "en": "No, we do not have a bar.",
            "sv": "Nej, vi har ingen bar.",
        },
    },
    {
        "key": "ask_vegetarian_food",
        "category": "food",
        "type": "yes_no",
        "question": {
            "en": "Do you offer vegetarian food?",
            "sv": "Erbjuder ni vegetarisk mat?",
        },
        "yes_answer": {
            "en": "Yes, vegetarian options are available.",
            "sv": "Ja, vegetariska alternativ finns.",
        },
        "no_answer": {
            "en": "No, we do not currently offer vegetarian options.",
            "sv": "Nej, vi erbjuder för närvarande inte vegetariska alternativ.",
        },
    },

    # CHECK-IN / CHECK-OUT
    {
        "key": "ask_check_in_time",
        "category": "check-in",
        "type": "time",
        "question": {
            "en": "What time does check-in start?",
            "sv": "Vilken tid börjar incheckningen?",
        },
    },
    {
        "key": "ask_check_out_time",
        "category": "check-in",
        "type": "time",
        "question": {
            "en": "What time is check-out?",
            "sv": "Vilken tid är utcheckningen?",
        },
    },
    {
        "key": "ask_late_check_in",
        "category": "check-in",
        "type": "yes_no",
        "question": {
            "en": "Is late check-in possible?",
            "sv": "Är sen incheckning möjlig?",
        },
        "yes_answer": {
            "en": "Yes, late check-in is possible.",
            "sv": "Ja, sen incheckning är möjlig.",
        },
        "no_answer": {
            "en": "No, late check-in is not available.",
            "sv": "Nej, sen incheckning är inte möjlig.",
        },
    },
    {
        "key": "ask_early_check_in",
        "category": "check-in",
        "type": "yes_no",
        "question": {
            "en": "Is early check-in possible?",
            "sv": "Är tidig incheckning möjlig?",
        },
        "yes_answer": {
            "en": "Yes, early check-in may be possible.",
            "sv": "Ja, tidig incheckning kan vara möjlig.",
        },
        "no_answer": {
            "en": "No, early check-in is not available.",
            "sv": "Nej, tidig incheckning är inte möjlig.",
        },
    },

    # POLICIES
    {
        "key": "ask_pets",
        "category": "policies",
        "type": "yes_no",
        "question": {
            "en": "Are pets allowed?",
            "sv": "Är husdjur tillåtna?",
        },
        "yes_answer": {
            "en": "Yes, pets are allowed.",
            "sv": "Ja, husdjur är tillåtna.",
        },
        "no_answer": {
            "en": "No, pets are not allowed.",
            "sv": "Nej, husdjur är inte tillåtna.",
        },
    },
    {
        "key": "ask_smoking",
        "category": "policies",
        "type": "yes_no",
        "question": {
            "en": "Is smoking allowed?",
            "sv": "Är rökning tillåten?",
        },
        "yes_answer": {
            "en": "Yes, smoking is allowed in designated areas.",
            "sv": "Ja, rökning är tillåten på anvisade områden.",
        },
        "no_answer": {
            "en": "No, smoking is not allowed.",
            "sv": "Nej, rökning är inte tillåten.",
        },
    },
    {
        "key": "ask_children",
        "category": "policies",
        "type": "yes_no",
        "question": {
            "en": "Are children welcome?",
            "sv": "Är barn välkomna?",
        },
        "yes_answer": {
            "en": "Yes, children are welcome.",
            "sv": "Ja, barn är välkomna.",
        },
        "no_answer": {
            "en": "No, the property is adults only.",
            "sv": "Nej, boendet är endast för vuxna.",
        },
    },
    {
        "key": "ask_quiet_hours",
        "category": "policies",
        "type": "text",
        "question": {
            "en": "Do you have quiet hours?",
            "sv": "Har ni särskilda tider då det ska vara tyst?",
        },
    },

    # ACTIVITIES
    {
        "key": "ask_surfing",
        "category": "activities",
        "type": "yes_no",
        "question": {
            "en": "Is surfing available nearby?",
            "sv": "Finns det möjlighet att surfa i närheten?",
        },
        "yes_answer": {
            "en": "Yes, surfing is available nearby.",
            "sv": "Ja, det finns möjlighet att surfa i närheten.",
        },
        "no_answer": {
            "en": "No, surfing is not available nearby.",
            "sv": "Nej, det finns ingen surfing i närheten.",
        },
    },
    {
        "key": "ask_surf_lessons",
        "category": "activities",
        "type": "yes_no",
        "question": {
            "en": "Can you arrange surf lessons?",
            "sv": "Kan ni ordna surflektioner?",
        },
        "yes_answer": {
            "en": "Yes, we can help arrange surf lessons.",
            "sv": "Ja, vi kan hjälpa till att ordna surflektioner.",
        },
        "no_answer": {
            "en": "No, we do not arrange surf lessons.",
            "sv": "Nej, vi ordnar inte surflektioner.",
        },
    },
    {
        "key": "ask_tours",
        "category": "activities",
        "type": "yes_no",
        "question": {
            "en": "Can you arrange tours or excursions?",
            "sv": "Kan ni ordna turer eller utflykter?",
        },
        "yes_answer": {
            "en": "Yes, we can help arrange tours and excursions.",
            "sv": "Ja, vi kan hjälpa till att ordna turer och utflykter.",
        },
        "no_answer": {
            "en": "No, we do not arrange tours or excursions.",
            "sv": "Nej, vi ordnar inte turer eller utflykter.",
        },
    },
    {
        "key": "ask_activities_nearby",
        "category": "activities",
        "type": "text",
        "question": {
            "en": "What activities are available nearby?",
            "sv": "Vilka aktiviteter finns i närheten?",
        },
    },

    # SERVICES
    {
        "key": "ask_reception",
        "category": "services",
        "type": "yes_no",
        "question": {
            "en": "Do you have a reception?",
            "sv": "Har ni reception?",
        },
        "yes_answer": {
            "en": "Yes, we have a reception.",
            "sv": "Ja, vi har reception.",
        },
        "no_answer": {
            "en": "No, we do not have a reception.",
            "sv": "Nej, vi har ingen reception.",
        },
    },
    {
        "key": "ask_reception_hours",
        "category": "services",
        "type": "text",
        "question": {
            "en": "What are the reception opening hours?",
            "sv": "Vilka öppettider har receptionen?",
        },
    },
    {
        "key": "ask_luggage_storage",
        "category": "services",
        "type": "yes_no",
        "question": {
            "en": "Can guests store luggage before check-in or after check-out?",
            "sv": "Kan gäster förvara bagage före incheckning eller efter utcheckning?",
        },
        "yes_answer": {
            "en": "Yes, luggage storage is available.",
            "sv": "Ja, bagageförvaring finns.",
        },
        "no_answer": {
            "en": "No, luggage storage is not available.",
            "sv": "Nej, bagageförvaring finns inte.",
        },
    },

    # PAYMENT / BOOKING
    {
        "key": "ask_card_payment",
        "category": "payment",
        "type": "yes_no",
        "question": {
            "en": "Can guests pay by card?",
            "sv": "Kan gäster betala med kort?",
        },
        "yes_answer": {
            "en": "Yes, card payments are accepted.",
            "sv": "Ja, kortbetalning accepteras.",
        },
        "no_answer": {
            "en": "No, card payments are not accepted.",
            "sv": "Nej, kortbetalning accepteras inte.",
        },
    },
    {
        "key": "ask_cash_payment",
        "category": "payment",
        "type": "yes_no",
        "question": {
            "en": "Can guests pay in cash?",
            "sv": "Kan gäster betala kontant?",
        },
        "yes_answer": {
            "en": "Yes, cash payments are accepted.",
            "sv": "Ja, kontant betalning accepteras.",
        },
        "no_answer": {
            "en": "No, cash payments are not accepted.",
            "sv": "Nej, kontant betalning accepteras inte.",
        },
    },

    # GENERAL
    {
        "key": "ask_languages_spoken",
        "category": "general",
        "type": "text",
        "question": {
            "en": "Which languages do you speak?",
            "sv": "Vilka språk talar ni?",
        },
    },
    {
        "key": "ask_special_information",
        "category": "general",
        "type": "text",
        "question": {
            "en": "Is there anything else guests should know before arriving?",
            "sv": "Finns det något annat gäster bör känna till före ankomst?",
        },
    },
]