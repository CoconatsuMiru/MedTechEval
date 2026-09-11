const reviewers = {
  "MED-8942": {
    title: "CardioPulse AI-ECG Rhythm Evaluation",
    questions: [
      {
        id: 1,
        question: "What does ECG stand for?",
        choices: [
          "Electrocardiogram",
          "Electrocorticogram",
          "Endocardiogram",
          "Electrocardiology"
        ],
        correctAnswer: "Electrocardiogram",
        rationale: "ECG (or EKG) stands for electrocardiogram, a recording of the heart's electrical activity."
      },
      {
        id: 2,
        question: "Which heart chamber pumps oxygenated blood to the body?",
        choices: [
          "Right atrium",
          "Right ventricle",
          "Left atrium",
          "Left ventricle"
        ],
        correctAnswer: "Left ventricle",
        rationale: "The left ventricle is the heart's main pumping chamber, pushing oxygen-rich blood out through the aorta to the body."
      },
      {
        id: 3,
        question: "A normal resting adult heart rate is generally considered to be:",
        choices: [
          "20–40 bpm",
          "60–100 bpm",
          "120–160 bpm",
          "180–220 bpm"
        ],
        correctAnswer: "60–100 bpm",
        rationale: "A normal resting heart rate for adults typically falls between 60 and 100 beats per minute."
      }
    ]
  }
};

export default reviewers;