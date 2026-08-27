import random
import spacy
from spacy.training import Example

from nlp.data.guest_count_examples import guest_count_examples


LABELS = [
    "GUESTS_1",
    "GUESTS_2",
    "GUESTS_3",
    "GUESTS_4",
    "GUESTS_5",
    "GUESTS_6",
]

def train_guest_count():
    nlp = spacy.blank("en")

    textcat = nlp.add_pipe("textcat")

    for label in LABELS:
        textcat.add_label(label)

    optimizer = nlp.initialize()

    for epoch in range(30):
        random.shuffle(guest_count_examples)

        losses = {}

        for text, count in guest_count_examples:
            cats = {
                label: 0.0
                for label in LABELS
            }

            cats[f"GUESTS_{count}"] = 1.0

            example = Example.from_dict(
                nlp.make_doc(text),
                {"cats": cats},
            )

            nlp.update(
                [example],
                sgd=optimizer,
                losses=losses,
            )

        print(
            f"Epoch {epoch + 1}:",
            losses,
        )

    nlp.to_disk("nlp/output/guest_count")

    print("Guest count model saved.")


if __name__ == "__main__":
    train_guest_count()

# python -m nlp.data.train_guest_count