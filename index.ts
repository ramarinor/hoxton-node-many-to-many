import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 4000;

const db = new Database('./data.db', {
  verbose: console.log
});

const getAllApplicants = db.prepare(`
SELECT * FROM applicants;
`);

const getApplicantById = db.prepare(`
SELECT * FROM applicants WHERE id = ?;
`);

const getInterviewsByApllicantId = db.prepare(`
SELECT interviews.id,interviews.score,interviews.date,interviews.interviewerId,interviews.score,interviewers.name as interviewerName,interviewers.email as interviewerEmail FROM interviews
JOIN interviewers ON interviewers.id = interviews.interviewerId
WHERE interviews.applicantId = ?;
`);

const getAllInterviewers = db.prepare(`
SELECT * FROM interviewers;
`);

const getInterviewerById = db.prepare(`
SELECT * FROM interviewers WHERE id = ?;
`);

const getInterviewsByInterviewerId = db.prepare(`
SELECT interviews.id,interviews.score,interviews.date,interviews.applicantId,interviews.score,applicants.name as applicantName,applicants.email as applicantEmail FROM interviews
JOIN applicants ON applicants.id = interviews.applicantId
WHERE interviews.interviewerId = ?;
`);

const createApplicant = db.prepare(`
INSERT INTO applicants (name, email) VALUES (?,?);
`);

const createInterviewer = db.prepare(`
INSERT INTO interviewers (name, email) VALUES (?,?);
`);

const createInterview = db.prepare(`
INSERT INTO interviews (applicantId, interviewerId, date, score) VALUES (?,?,?,?);
`);

const getInterviewById = db.prepare(`
    SELECT * FROM interviews WHERE id = ?;
`);

app.get('/applicants', (req, res) => {
  const applicants = getAllApplicants.all();

  for (const applicant of applicants) {
    const interviews = getInterviewsByApllicantId.all(applicant.id);
    applicant.interviews = interviews;
  }

  res.send(applicants);
});

app.get('/applicants/:id', (req, res) => {
  const id = req.params.id;
  const applicant = getApplicantById.get(id);
  if (applicant) {
    const interviews = getInterviewsByApllicantId.all(applicant.id);
    applicant.interviews = interviews;
    res.send(applicant);
  } else {
    res.status(404).send({ error: 'Applicant not found!' });
  }
});

app.get('/interviewers', (req, res) => {
  const interviewers = getAllInterviewers.all();

  for (const interviewer of interviewers) {
    const interviews = getInterviewsByInterviewerId.all(interviewer.id);
    interviewer.interviews = interviews;
  }

  res.send(interviewers);
});

app.get('/interviewers/:id', (req, res) => {
  const id = req.params.id;
  const interviewer = getInterviewerById.get(id);
  if (interviewer) {
    const interviews = getInterviewsByInterviewerId.all(interviewer.id);
    interviewer.interviews = interviews;
    res.send(interviewer);
  } else {
    res.status(404).send({ error: 'Interviewer not found!' });
  }
});

app.post('/applicants', (req, res) => {
  const { name, email } = req.body;

  const errors = [];
  if (typeof name !== 'string') errors.push(`name is missing or not a string`);
  if (typeof email !== 'string')
    errors.push(`email is missing or not a string`);

  if (errors.length === 0) {
    const info = createApplicant.run(name, email);
    const newApplicant = getApplicantById.get(info.lastInsertRowid);
    res.send(newApplicant);
  } else {
    res.status(400).send({ errors: errors });
  }
});

app.post('/interviewers', (req, res) => {
  const { name, email } = req.body;

  const errors = [];
  if (typeof name !== 'string') errors.push('name is missing or not a string');
  if (typeof email !== 'string')
    errors.push('email is missing or not a string');

  if (errors.length === 0) {
    const info = createInterviewer.run(name, email);
    const newInterviewer = getInterviewerById.get(info.lastInsertRowid);
    res.send(newInterviewer);
  } else {
    res.status(400).send({ errors: errors });
  }
});

app.post('/interviews', (req, res) => {
  const { applicantId, interviewerId, date, score } = req.body;
  const errors = [];

  if (typeof applicantId !== 'number') {
    errors.push({ error: 'applicantId is missing or not a number!' });
  }
  if (typeof interviewerId !== 'number') {
    errors.push({ error: 'interviewerId is missing or not a number!' });
  }
  if (typeof date !== 'string') {
    errors.push({ error: 'date missing or not a string' });
  }
  if (typeof score !== 'number' || score < 1 || score > 10) {
    errors.push({ error: 'score missing or not a number between 1 and 10!' });
  }

  if (errors.length === 0) {
    const applicant = getApplicantById.get(applicantId);
    const interviewer = getInterviewerById.get(interviewerId);

    if (applicant && interviewer) {
      const result = createInterview.run(
        applicantId,
        interviewerId,
        date,
        score
      );
      const newInterview = getInterviewById.get(result.lastInsertRowid);
      res.send(newInterview);
    } else {
      res.status(404).send({ error: 'Applicant or Interviewer not found!' });
    }
  } else {
    res.status(400).send(errors);
  }
});

app.listen(PORT, () => {
  console.log(`Server is up and running on http://localhost:${PORT}`);
});
