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

app.listen(PORT, () => {
  console.log(`Server is up and running on http://localhost:${PORT}`);
});
