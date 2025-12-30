// ===== SAMPLE QUESTION DATA WITH RUBRICS =====
// This file contains the enhanced evaluation rubrics for your questions

const questionDatabase = {
    "Define inertia. Give its classification.": {
        id: 1,
        subject: "Science",
        topic: "Laws of Motion",
        difficulty: "Medium",
        maxPoints: 100,
        timeLimit: 180,
        rubricItems: [
            {
                rubric_id: 1,
                key_phrase: "inertia is the property",
                points_value: 25,
                is_mandatory: true,
                category: "definition",
                alternative_phrases: [
                    "inertia property",
                    "property of inertia",
                    "inertia is property"
                ],
                fuzzy_threshold: 0.75
            },
            {
                rubric_id: 2,
                key_phrase: "resist changes in motion",
                points_value: 20,
                is_mandatory: true,
                category: "definition",
                alternative_phrases: [
                    "resist change",
                    "oppose change",
                    "resist motion change",
                    "oppose motion change"
                ],
                fuzzy_threshold: 0.70
            },
            {
                rubric_id: 3,
                key_phrase: "classified into three types",
                points_value: 10,
                is_mandatory: true,
                category: "classification",
                alternative_phrases: [
                    "three types",
                    "three kinds",
                    "three categories"
                ],
                fuzzy_threshold: 0.70
            },
            {
                rubric_id: 4,
                key_phrase: "inertia of rest",
                points_value: 15,
                is_mandatory: false,
                category: "types",
                alternative_phrases: [
                    "rest inertia",
                    "stationary inertia"
                ],
                fuzzy_threshold: 0.80
            },
            {
                rubric_id: 5,
                key_phrase: "inertia of motion",
                points_value: 15,
                is_mandatory: false,
                category: "types",
                alternative_phrases: [
                    "motion inertia",
                    "moving inertia"
                ],
                fuzzy_threshold: 0.80
            },
            {
                rubric_id: 6,
                key_phrase: "inertia of direction",
                points_value: 15,
                is_mandatory: false,
                category: "types",
                alternative_phrases: [
                    "direction inertia",
                    "directional inertia"
                ],
                fuzzy_threshold: 0.80
            }
        ],
        modelAnswer: "Inertia is the property of an object to resist changes in its state of motion. It is classified into three types: inertia of rest (objects at rest stay at rest), inertia of motion (moving objects keep moving), and inertia of direction (objects continue in the same direction)."
    },

    "Classify the types of force based on their application.": {
        id: 2,
        subject: "Science",
        topic: "Laws of Motion",
        difficulty: "Medium",
        maxPoints: 100,
        timeLimit: 180,
        rubricItems: [
            {
                rubric_id: 7,
                key_phrase: "classified into two types",
                points_value: 10,
                is_mandatory: true,
                category: "classification",
                alternative_phrases: [
                    "two types",
                    "two kinds",
                    "two categories"
                ],
                fuzzy_threshold: 0.70
            },
            {
                rubric_id: 8,
                key_phrase: "contact forces",
                points_value: 20,
                is_mandatory: true,
                category: "type1",
                alternative_phrases: [
                    "contact force",
                    "forces requiring contact",
                    "touch forces"
                ],
                fuzzy_threshold: 0.75
            },
            {
                rubric_id: 9,
                key_phrase: "physical touch",
                points_value: 15,
                is_mandatory: false,
                category: "type1-detail",
                alternative_phrases: [
                    "physical contact",
                    "direct contact",
                    "touching"
                ],
                fuzzy_threshold: 0.70
            },
            {
                rubric_id: 10,
                key_phrase: "friction",
                points_value: 10,
                is_mandatory: false,
                category: "example1",
                alternative_phrases: [
                    "frictional force"
                ],
                fuzzy_threshold: 0.85
            },
            {
                rubric_id: 11,
                key_phrase: "non-contact forces",
                points_value: 20,
                is_mandatory: true,
                category: "type2",
                alternative_phrases: [
                    "non contact forces",
                    "noncontact forces",
                    "forces at distance"
                ],
                fuzzy_threshold: 0.75
            },
            {
                rubric_id: 12,
                key_phrase: "without physical contact",
                points_value: 10,
                is_mandatory: false,
                category: "type2-detail",
                alternative_phrases: [
                    "without touching",
                    "at a distance",
                    "no contact"
                ],
                fuzzy_threshold: 0.70
            },
            {
                rubric_id: 13,
                key_phrase: "gravitational force",
                points_value: 15,
                is_mandatory: false,
                category: "example2",
                alternative_phrases: [
                    "gravity",
                    "gravitational"
                ],
                fuzzy_threshold: 0.80
            }
        ],
        modelAnswer: "Forces are classified into two types based on application: Contact forces require physical touch between objects (examples: friction, tension, normal force). Non-contact forces act at a distance without physical contact (examples: gravitational force, magnetic force, electrostatic force)."
    },

    "Differentiate mass and weight.": {
        id: 3,
        subject: "Science",
        topic: "Laws of Motion",
        difficulty: "Easy",
        maxPoints: 100,
        timeLimit: 180,
        rubricItems: [
            {
                rubric_id: 14,
                key_phrase: "mass is amount of matter",
                points_value: 25,
                is_mandatory: true,
                category: "definition-mass",
                alternative_phrases: [
                    "mass is matter",
                    "mass quantity of matter"
                ],
                fuzzy_threshold: 0.70
            },
            {
                rubric_id: 15,
                key_phrase: "mass is constant",
                points_value: 15,
                is_mandatory: false,
                category: "property-mass",
                alternative_phrases: [
                    "mass remains same",
                    "mass does not change"
                ],
                fuzzy_threshold: 0.70
            },
            {
                rubric_id: 16,
                key_phrase: "weight is force",
                points_value: 25,
                is_mandatory: true,
                category: "definition-weight",
                alternative_phrases: [
                    "weight force",
                    "weight is gravitational force"
                ],
                fuzzy_threshold: 0.75
            },
            {
                rubric_id: 17,
                key_phrase: "weight varies",
                points_value: 15,
                is_mandatory: false,
                category: "property-weight",
                alternative_phrases: [
                    "weight changes",
                    "weight is different"
                ],
                fuzzy_threshold: 0.70
            },
            {
                rubric_id: 18,
                key_phrase: "weight equals mass times gravity",
                points_value: 20,
                is_mandatory: false,
                category: "formula",
                alternative_phrases: [
                    "w = mg",
                    "weight = m x g",
                    "mass multiplied by acceleration"
                ],
                fuzzy_threshold: 0.65
            }
        ],
        modelAnswer: "Mass is the amount of matter in an object and remains constant everywhere. Weight is the force with which Earth attracts an object and varies with location. Weight equals mass times gravitational acceleration (W = mg)."
    },

    "State Newton's second law.": {
        id: 4,
        subject: "Science",
        topic: "Laws of Motion",
        difficulty: "Easy",
        maxPoints: 100,
        timeLimit: 120,
        rubricItems: [
            {
                rubric_id: 19,
                key_phrase: "rate of change of momentum",
                points_value: 30,
                is_mandatory: true,
                category: "definition",
                alternative_phrases: [
                    "momentum change rate",
                    "change in momentum"
                ],
                fuzzy_threshold: 0.70
            },
            {
                rubric_id: 20,
                key_phrase: "directly proportional to force",
                points_value: 25,
                is_mandatory: true,
                category: "relationship",
                alternative_phrases: [
                    "proportional to force",
                    "proportional force applied"
                ],
                fuzzy_threshold: 0.70
            },
            {
                rubric_id: 21,
                key_phrase: "direction of force",
                points_value: 20,
                is_mandatory: false,
                category: "direction",
                alternative_phrases: [
                    "same direction as force",
                    "force direction"
                ],
                fuzzy_threshold: 0.70
            },
            {
                rubric_id: 22,
                key_phrase: "F = ma",
                points_value: 25,
                is_mandatory: false,
                category: "formula",
                alternative_phrases: [
                    "force equals mass times acceleration",
                    "F equals ma"
                ],
                fuzzy_threshold: 0.75
            }
        ],
        modelAnswer: "The rate of change of momentum of an object is directly proportional to the applied force and takes place in the direction of the force. Mathematically, F = ma, where F is force, m is mass, and a is acceleration."
    }
};

// Export for use in the app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = questionDatabase;
}