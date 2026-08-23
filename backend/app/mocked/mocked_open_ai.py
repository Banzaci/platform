from app.schemas.ai_sections import (
    AIProjectPlan,
    AITenant, AIPage,
    AITheme,
    HeroSection,
    HeroContent,
    LocalizedText,
    ImageTextSection,
    ImageTextContent,
    CardGridSection,
    CardGridContent,
    CardItem,
    PropertyGridSection,
    PropertyGridContent,
    ContactFormSection,
    ContactFormContent
  )
def get_mock_hotel_plan() -> AIProjectPlan:
    return AIProjectPlan(
        tenant=AITenant(
            name="Laughing Goat Ghana",
            category="Boutique hotel",
            location="Cape Coast, Ghana (near the beach)",
            short_description=(
                "A warm, relaxed 7-room beach hotel for surfers, "
                "couples and independent travelers."
            ),
        ),

        theme=AITheme(
            backgroundColor="#F5EBD8",
            textColor="#3B3A36",
            primaryColor="#C79A6E",
            secondaryColor="#7DA36F",
            fontFamily="Inter, system-ui, sans-serif",
            headingFontFamily="Merriweather, serif",
        ),

        pages=[
            AIPage(
                name="Home",
                slug="index",
                sections=[
                    HeroSection(
                        type="hero",
                        content=HeroContent(
                            heading=LocalizedText(
                                en="Laughing Goat Ghana"
                            ),
                            text=LocalizedText(
                                en=(
                                    "A small, friendly 7-room hotel by the sea — "
                                    "warm rooms, big views, relaxed local vibes."
                                )
                            ),
                            image="/images/hero-laughing-goat.jpg",
                        ),
                    ),

                    ImageTextSection(
                        type="image-text",
                        content=ImageTextContent(
                            heading=LocalizedText(
                                en="A relaxed place to land"
                            ),
                            text=LocalizedText(
                                en=(
                                    "We keep things simple and welcoming. "
                                    "All rooms include air conditioning, "
                                    "private bathroom and free Wi-Fi."
                                )
                            ),
                            image="/images/lobby-natural.jpg",
                        ),
                    ),

                    CardGridSection(
                        type="card-grid",
                        content=CardGridContent(
                            heading=LocalizedText(en="Things to do"),
                            text=LocalizedText(
                                en="Simple, local activities to enjoy during your stay."
                            ),
                            cards=[
                                CardItem(
                                    title=LocalizedText(en="Surfing"),
                                    text=LocalizedText(
                                        en="Local breaks for all levels."
                                    ),
                                    image="/images/activities/surfing.jpg",
                                ),
                                CardItem(
                                    title=LocalizedText(en="Beach Walks"),
                                    text=LocalizedText(
                                        en="Quiet stretches of sand close to the hotel."
                                    ),
                                    image="/images/activities/beach-walk.jpg",
                                ),
                                CardItem(
                                    title=LocalizedText(en="Local Food"),
                                    text=LocalizedText(
                                        en="Fresh fish, local dishes and tropical fruit."
                                    ),
                                    image="/images/activities/local-food.jpg",
                                ),
                            ],
                        ),
                    ),
                ],
            ),

            AIPage(
                name="Accommodation",
                slug="accommodation",
                sections=[
                    HeroSection(
                        type="hero",
                        content=HeroContent(
                            heading=LocalizedText(en="Rooms & Details"),
                            text=LocalizedText(
                                en=(
                                    "Seven comfortable rooms with AC, "
                                    "private bathrooms and Wi-Fi."
                                )
                            ),
                            image="/images/hero-rooms.jpg",
                        ),
                    ),

                    PropertyGridSection(
                        type="property-grid",
                        content=PropertyGridContent(
                            heading=LocalizedText(en="Our Rooms"),
                            text=LocalizedText(
                                en="Choose the room that fits your stay."
                            ),
                        ),
                    ),
                ],
            ),

            AIPage(
                name="About",
                slug="about",
                sections=[
                    HeroSection(
                        type="hero",
                        content=HeroContent(
                            heading=LocalizedText(en="About Laughing Goat"),
                            text=LocalizedText(
                                en="Small, friendly and rooted in local life."
                            ),
                            image="/images/hero-about.jpg",
                        ),
                    ),
                ],
            ),

            AIPage(
                name="Contact",
                slug="contact",
                sections=[
                    ContactFormSection(
                        type="contact-form",
                        content=ContactFormContent(
                            heading=LocalizedText(en="Get in touch"),
                            text=LocalizedText(
                                en="Questions or bookings? Send us a message."
                            ),
                        ),
                    ),
                ],
            ),
        ],

        property_count=7,
    )