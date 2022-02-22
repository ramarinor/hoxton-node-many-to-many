import Database from 'better-sqlite3';

const db = new Database('./data.db', {
  verbose: console.log
});

const interviewers = [
  { name: 'Niclas', email: 'nicolas@gmail.com' },
  { name: 'Ed', email: 'ed@gmail.com' },
  { name: 'Gerald', email: 'gerald@gmail.com' },
  { name: 'Kushtrim', email: 'kushtrim@gmail.com' }
];

const applicants = [
  { name: 'Rinor', email: 'rinor@gmail.com' },
  { name: 'Elidon', email: 'elidon@gmail.com' },
  { name: 'Visard', email: 'visard@gmail.com' },
  { name: 'Desintila', email: 'desintila@gmail.com' },
  { name: 'Artiola', email: 'artiola@gmail.com' }
];

const interviews = [
  {
    interviewerId: 1,
    applicantId: 1,
    score: 10,
    date: '2022-02-01'
  },
  {
    interviewerId: 1,
    applicantId: 2,
    score: 9,
    date: '2022-02-02'
  },
  {
    interviewerId: 1,
    applicantId: 3,
    score: 8,
    date: '2022-02-03'
  },
  {
    interviewerId: 1,
    applicantId: 4,
    score: 7,
    date: '2022-02-04'
  },
  {
    interviewerId: 1,
    applicantId: 5,
    score: 6,
    date: '2022-02-05'
  },
  {
    interviewerId: 2,
    applicantId: 1,
    score: 5,
    date: '2022-02-06'
  },
  {
    interviewerId: 1,
    applicantId: 3,
    score: 4,
    date: '2022-02-07'
  },
  {
    interviewerId: 1,
    applicantId: 5,
    score: 3,
    date: '2022-02-08'
  },
  {
    interviewerId: 4,
    applicantId: 1,
    score: 2,
    date: '2022-02-09'
  },
  {
    interviewerId: 4,
    applicantId: 2,
    score: 1,
    date: '2022-02-10'
  }
];

db.exec(`
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS interviewers;
DROP TABLE IF EXISTS applicants;
CREATE TABLE IF NOT EXISTS interviewers (
  id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS applicants (
  id INTEGER,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS interviews (
  id INTEGER,
  interviewerId INTEGER NOT NULL,
  applicantId INTEGER NOT NULL,
  score INTEGER NOT NULL,
  date TEXT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (interviewerId) REFERENCES interviewers(id),
  FOREIGN KEY (applicantId) REFERENCES applicants(id)
);
`);

const createInterviewer = db.prepare(`
INSERT INTO interviewers (name, email) VALUES (?, ?);
`);

const createApplicant = db.prepare(`
INSERT INTO applicants (name, email) VALUES (?, ?);
`);

const createInterview = db.prepare(`
INSERT INTO interviews (interviewerId, applicantId, score, date)
VALUES (?, ?, ?, ?);
`);

for (const interviewer of interviewers) {
  createInterviewer.run(interviewer.name, interviewer.email);
}

for (const applicant of applicants) {
  createApplicant.run(applicant.name, applicant.email);
}

for (const interview of interviews) {
  createInterview.run(
    interview.interviewerId,
    interview.applicantId,
    interview.score,
    interview.date
  );
}
